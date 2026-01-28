/**
 * @file Test runner - orchestrates test execution
 * @position internal/vibe-tests/src/runner.ts
 */

import Anthropic from '@anthropic-ai/sdk';
import * as fs from 'node:fs';
import * as path from 'node:path';
import type {
  TestPrompt,
  TestResult,
  TestSet,
  Turn,
  RunConfig,
  PersonaType,
  Evaluation,
} from './types.js';
import {evaluate} from './evaluator.js';
import {stratifiedSample} from './sampling.js';
import {
  generateIterationId,
  hashContent,
  estimateTokens,
  sleep,
  ensureDir,
  appendJsonl,
  readPromptFile,
  getPromptsDir,
  getResultsDir,
  progressBar,
  timestamp,
} from './utils.js';

const RATE_LIMIT_DELAY = 500; // ms between requests

export interface RunResult {
  iterationId: string;
  results: TestResult[];
  promptsRun: string[];
  promptsTotal: number;
}

/**
 * Load persona prompt
 */
function loadPersona(persona: PersonaType): string {
  const personaPath = path.join(getPromptsDir(), 'personas', `${persona}.md`);
  return readPromptFile(personaPath);
}

/**
 * Wrap user prompt with persona framing
 */
function applyPersona(prompt: string, personaPrompt: string): string {
  return `${personaPrompt}

---

Now, as this persona, make the following request:

${prompt}`;
}

/**
 * Run a single test prompt (one-shot)
 */
async function runOneShot(
  client: Anthropic,
  testPrompt: TestPrompt,
  skillDoc: string,
  personaPrompt: string,
  config: RunConfig,
): Promise<{response: string; conversation: Turn[]; tokenUsage: number}> {
  const framedPrompt = applyPersona(testPrompt.prompt, personaPrompt);

  const response = await client.messages.create({
    model: config.model,
    max_tokens: 4096,
    system: skillDoc,
    messages: [{role: 'user', content: framedPrompt}],
  });

  const content = response.content[0];
  if (content.type !== 'text') {
    throw new Error('Expected text response');
  }

  const turn: Turn = {
    type: 'probe',
    prompt: testPrompt.prompt,
    response: content.text,
  };

  const tokenUsage =
    estimateTokens(skillDoc) +
    estimateTokens(framedPrompt) +
    estimateTokens(content.text);

  return {
    response: content.text,
    conversation: [turn],
    tokenUsage,
  };
}

/**
 * Run degradation curve test
 */
async function runDegradation(
  client: Anthropic,
  testPrompt: TestPrompt,
  skillDoc: string,
  personaPrompt: string,
  fillerPrompts: string[],
  distractorPrompts: string[],
  recoveryContext: string,
  config: RunConfig,
): Promise<{
  turns: Turn[];
  evaluations: Map<number, Evaluation>;
  tokenUsage: number;
}> {
  const messages: Anthropic.MessageParam[] = [];
  const turns: Turn[] = [];
  const evaluations = new Map<number, Evaluation>();
  let tokenUsage = estimateTokens(skillDoc);

  // Helper to add a turn
  const addTurn = async (
    type: Turn['type'],
    prompt: string,
  ): Promise<string> => {
    const framedPrompt =
      type === 'probe' ? applyPersona(prompt, personaPrompt) : prompt;

    messages.push({role: 'user', content: framedPrompt});
    tokenUsage += estimateTokens(framedPrompt);

    await sleep(RATE_LIMIT_DELAY);
    const response = await client.messages.create({
      model: config.model,
      max_tokens: 4096,
      system: skillDoc,
      messages,
    });

    const content = response.content[0];
    if (content.type !== 'text') {
      throw new Error('Expected text response');
    }

    messages.push({role: 'assistant', content: content.text});
    tokenUsage += estimateTokens(content.text);

    turns.push({type, prompt, response: content.text});
    return content.text;
  };

  // Turn 0: Initial probe
  const initialResponse = await addTurn('probe', testPrompt.prompt);
  const eval0 = await evaluate(
    client,
    {
      userPrompt: testPrompt.prompt,
      llmResponse: initialResponse,
      expectedComponents: testPrompt.expectedComponents,
      skillDoc,
    },
    config.model,
  );
  turns[0].evaluation = eval0;
  evaluations.set(0, eval0);

  // Turns 1-5: Filler
  for (let i = 0; i < 5; i++) {
    const fillerPrompt =
      fillerPrompts[Math.floor(Math.random() * fillerPrompts.length)];
    await addTurn('filler', fillerPrompt);
  }

  // Turn 6: Re-probe with natural framing
  const reprobe1 = `Actually, let me revisit this. ${testPrompt.prompt}`;
  const response6 = await addTurn('probe', reprobe1);
  const eval6 = await evaluate(
    client,
    {
      userPrompt: testPrompt.prompt,
      llmResponse: response6,
      expectedComponents: testPrompt.expectedComponents,
      skillDoc,
    },
    config.model,
  );
  turns[turns.length - 1].evaluation = eval6;
  evaluations.set(6, eval6);

  // Turn 7: Distractor
  const distractor =
    distractorPrompts[Math.floor(Math.random() * distractorPrompts.length)];
  await addTurn('distractor', distractor);

  // Turn 8: Re-probe after distractor
  const reprobe2 = `I want to redo that earlier request. ${testPrompt.prompt}`;
  const response8 = await addTurn('probe', reprobe2);
  const eval8 = await evaluate(
    client,
    {
      userPrompt: testPrompt.prompt,
      llmResponse: response8,
      expectedComponents: testPrompt.expectedComponents,
      skillDoc,
    },
    config.model,
  );
  turns[turns.length - 1].evaluation = eval8;
  evaluations.set(8, eval8);

  // Turn 9: Recovery (re-inject partial skill doc)
  const recovery = `${recoveryContext}\n\n${skillDoc.slice(0, 2000)}...`;
  await addTurn('recovery', recovery);

  // Turn 10: Final re-probe after recovery
  const reprobe3 = `Let me try that again. ${testPrompt.prompt}`;
  const response10 = await addTurn('probe', reprobe3);
  const eval10 = await evaluate(
    client,
    {
      userPrompt: testPrompt.prompt,
      llmResponse: response10,
      expectedComponents: testPrompt.expectedComponents,
      skillDoc,
    },
    config.model,
  );
  turns[turns.length - 1].evaluation = eval10;
  evaluations.set(10, eval10);

  return {turns, evaluations, tokenUsage};
}

/**
 * Run tests with the given configuration
 */
export async function runTests(
  testSet: TestSet,
  config: RunConfig,
): Promise<RunResult> {
  const client = new Anthropic();
  const iterationId = generateIterationId();
  const skillDoc = fs.readFileSync(config.skillDocPath, 'utf-8');
  const personaPrompt = loadPersona(config.persona);

  // Select prompts
  let prompts: TestPrompt[];
  if (config.holdout && testSet.holdout) {
    prompts = testSet.holdout;
  } else if (config.sample && config.sample < testSet.prompts.length) {
    prompts = stratifiedSample(testSet.prompts, config.sample);
  } else {
    prompts = testSet.prompts;
  }

  // Setup results directory
  const resultsDir = path.join(getResultsDir(), iterationId);
  ensureDir(resultsDir);
  const runsPath = path.join(resultsDir, 'runs.jsonl');

  const results: TestResult[] = [];
  const promptsRun: string[] = [];

  console.log(`\nRunning vibeability tests...`);
  console.log(`  Protocol: ${config.protocol}`);
  console.log(`  Persona: ${config.persona}`);
  console.log(`  Model: ${config.model}`);
  console.log(
    `  Test set: ${testSet.name} (${prompts.length}${config.sample ? ` sampled from ${testSet.prompts.length}` : ''} prompts)`,
  );
  console.log(`  Iteration: ${iterationId}\n`);

  for (let i = 0; i < prompts.length; i++) {
    const testPrompt = prompts[i];
    promptsRun.push(testPrompt.id);

    process.stdout.write(`  ${progressBar(i + 1, prompts.length)}\r`);

    try {
      if (config.protocol === 'one-shot') {
        const {response, conversation, tokenUsage} = await runOneShot(
          client,
          testPrompt,
          skillDoc,
          personaPrompt,
          config,
        );

        const evaluation = await evaluate(
          client,
          {
            userPrompt: testPrompt.prompt,
            llmResponse: response,
            expectedComponents: testPrompt.expectedComponents,
            skillDoc,
          },
          config.model,
        );

        conversation[0].evaluation = evaluation;

        const result: TestResult = {
          id: `${iterationId}-${testPrompt.id}`,
          timestamp: timestamp(),
          systemVersion: hashContent(skillDoc),
          model: config.model,
          persona: config.persona,
          promptCategory: testPrompt.category,
          trajectoryDepth: 0,
          prompt: testPrompt.prompt,
          response,
          evaluation,
          fullConversation: conversation,
          contextWindowUsage: tokenUsage,
        };

        results.push(result);
        appendJsonl(runsPath, result);
      } else if (config.protocol === 'degradation') {
        const {turns, evaluations, tokenUsage} = await runDegradation(
          client,
          testPrompt,
          skillDoc,
          personaPrompt,
          testSet.fillerPrompts ?? [],
          testSet.distractorPrompts ?? [],
          testSet.recoveryContext ?? '',
          config,
        );

        // Create results for each evaluation point
        for (const [depth, evaluation] of evaluations) {
          const result: TestResult = {
            id: `${iterationId}-${testPrompt.id}-t${depth}`,
            timestamp: timestamp(),
            systemVersion: hashContent(skillDoc),
            model: config.model,
            persona: config.persona,
            promptCategory: testPrompt.category,
            trajectoryDepth: depth,
            prompt: testPrompt.prompt,
            response: turns[depth]?.response ?? '',
            evaluation,
            fullConversation: turns,
            contextWindowUsage: tokenUsage,
          };

          results.push(result);
          appendJsonl(runsPath, result);
        }
      }
    } catch (error) {
      console.error(`\nError on prompt ${testPrompt.id}:`, error);
    }

    await sleep(RATE_LIMIT_DELAY);
  }

  console.log(`\n`);

  return {
    iterationId,
    results,
    promptsRun,
    promptsTotal: testSet.prompts.length,
  };
}
