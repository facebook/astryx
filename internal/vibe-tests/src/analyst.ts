/**
 * @file Analyst module - analyzes test results and suggests refinements
 * @position internal/vibe-tests/src/analyst.ts
 */

import Anthropic from '@anthropic-ai/sdk';
import * as path from 'node:path';
import type {TestResult, AnalysisResult} from './types.js';
import {readPromptFile, getPromptsDir} from './utils.js';

const ANALYST_PROMPT_PATH = path.join(getPromptsDir(), 'analyst.md');

export interface AnalyzeInput {
  results: TestResult[];
  skillDoc: string;
  promptsRun: number;
  promptsTotal: number;
}

/**
 * Analyze a batch of test results and suggest refinements
 */
export async function analyze(
  client: Anthropic,
  input: AnalyzeInput,
  model: string,
): Promise<AnalysisResult> {
  const analystPrompt = readPromptFile(ANALYST_PROMPT_PATH);

  const systemPrompt = `${analystPrompt}

## Skill Doc (Component System Documentation)

${input.skillDoc}`;

  // Prepare results summary (full results could be too large)
  const resultsSummary = input.results.map(r => ({
    id: r.id,
    category: r.promptCategory,
    persona: r.persona,
    prompt: r.prompt,
    success: r.evaluation.success,
    componentsUsed: r.evaluation.componentsUsed,
    componentsExpected: r.evaluation.componentsExpected,
    escapeHatches: r.evaluation.escapeHatches,
    failureMode: r.evaluation.failureMode,
    confusionSignals: r.evaluation.confusionSignals,
    trajectoryDepth: r.trajectoryDepth,
  }));

  const userMessage = `## Sampling Metadata

- Prompts run: ${input.promptsRun}
- Total prompts in pool: ${input.promptsTotal}
- Sampling: ${input.promptsRun < input.promptsTotal ? 'Yes (stratified)' : 'No (full run)'}

## Test Results

\`\`\`json
${JSON.stringify(resultsSummary, null, 2)}
\`\`\`

---

Analyze these results and return JSON matching the AnalysisResult schema. Only output valid JSON, no other text.`;

  const response = await client.messages.create({
    model,
    max_tokens: 4096,
    system: systemPrompt,
    messages: [{role: 'user', content: userMessage}],
  });

  const content = response.content[0];
  if (content.type !== 'text') {
    throw new Error('Expected text response from analyst');
  }

  // Parse JSON from response
  let jsonText = content.text.trim();
  if (jsonText.startsWith('```json')) {
    jsonText = jsonText.slice(7);
  } else if (jsonText.startsWith('```')) {
    jsonText = jsonText.slice(3);
  }
  if (jsonText.endsWith('```')) {
    jsonText = jsonText.slice(0, -3);
  }
  jsonText = jsonText.trim();

  try {
    return JSON.parse(jsonText) as AnalysisResult;
  } catch {
    console.error('Failed to parse analyst response:', content.text);
    return {
      patterns: [],
      refinements: [],
      summary: 'Failed to parse analyst response',
    };
  }
}
