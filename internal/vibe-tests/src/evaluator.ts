/**
 * @file Evaluator module - judges LLM responses against component system
 * @position internal/vibe-tests/src/evaluator.ts
 */

import Anthropic from '@anthropic-ai/sdk';
import * as path from 'node:path';
import type {Evaluation} from './types.js';
import {readPromptFile, getPromptsDir} from './utils.js';

const EVALUATOR_PROMPT_PATH = path.join(getPromptsDir(), 'evaluator.md');

export interface EvaluateInput {
  userPrompt: string;
  llmResponse: string;
  expectedComponents: string[];
  skillDoc: string;
}

/**
 * Evaluate an LLM response against the component system
 */
export async function evaluate(
  client: Anthropic,
  input: EvaluateInput,
  model: string,
): Promise<Evaluation> {
  const evaluatorPrompt = readPromptFile(EVALUATOR_PROMPT_PATH);

  const systemPrompt = `${evaluatorPrompt}

## Skill Doc (Component System Documentation)

${input.skillDoc}`;

  const userMessage = `## User's Original Prompt

${input.userPrompt}

## Expected Components

${input.expectedComponents.join(', ')}

## LLM Response to Evaluate

${input.llmResponse}

---

Evaluate this response and return JSON matching the Evaluation schema. Only output valid JSON, no other text.`;

  const response = await client.messages.create({
    model,
    max_tokens: 2048,
    system: systemPrompt,
    messages: [{role: 'user', content: userMessage}],
  });

  const content = response.content[0];
  if (content.type !== 'text') {
    throw new Error('Expected text response from evaluator');
  }

  // Parse JSON from response, handling potential markdown code blocks
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
    return JSON.parse(jsonText) as Evaluation;
  } catch {
    // If parsing fails, return a failure evaluation
    console.error('Failed to parse evaluator response:', content.text);
    return {
      success: false,
      componentsUsed: [],
      componentsExpected: input.expectedComponents,
      escapeHatches: [],
      failureMode: 'evaluator_parse_error',
      confusionSignals: [],
    };
  }
}
