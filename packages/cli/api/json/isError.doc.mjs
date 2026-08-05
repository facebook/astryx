// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file FunctionDoc for `isError()`. Colocated with the consumer helper it
 * documents; the CLIError shape is re-exported from `index.ts`.
 * @position packages/cli/api/json — function documentation
 */

/** @type {import('@astryxdesign/cli/authoring').FunctionDoc} */
export const doc = {
  type: 'function',
  kind: 'api',
  name: 'isError',
  displayName: 'isError()',
  summary: 'Type guard: did the CLI return an error envelope?',
  description:
    'Narrows a parsed response to the CLIError branch by testing for an `error` key. ' +
    'Branch on this before touching `data` — and prefer the stable `code` field over ' +
    'matching the human-readable message, which is not a contract.',
  importPath: '@astryxdesign/cli/json',
  signature: 'isError(result: unknown): boolean',
  keywords: ['json', 'error', 'guard', 'narrow', 'subprocess'],
  params: [
    {
      name: 'result',
      type: 'unknown',
      description: 'A parsed response envelope, typically from parseResponse().',
      required: true,
    },
  ],
  returns: [
    {
      type: 'boolean',
      description:
        'True when the value is a non-null object carrying an `error` key (a CLIError envelope).',
    },
  ],
  examples: [
    {
      label: 'Branch on the stable code',
      code:
        "const result = parseResponse(stdout);\nif (isError(result)) {\n  if (result.code === 'ERR_UNKNOWN_COMPONENT') suggest(result.suggestions);\n}",
    },
  ],
  related: ['parseResponse', 'assertResponse'],
};
