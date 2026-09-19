// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file FunctionDoc for `layoutCheck()` / `astryx layout check`. Colocated with
 * the API function it documents; the response-shape source of truth stays in
 * `layout.type.mjs`.
 * @position packages/cli/api/layout — function documentation
 */

/** @type {import('@astryxdesign/cli/authoring').FunctionDoc} */
export const doc = {
  type: 'function',
  kind: 'api',
  name: 'layoutCheck',
  displayName: 'layoutCheck()',
  summary: 'Validate a layout expression without expanding it.',
  description:
    'The validator behind `astryx layout check`. Parses and validates a compressed XLE/XLO ' +
    'expression without generating any TSX, and echoes it back in both canonical surfaces ' +
    '(compact and outline). Validation failures are reported in the layout.check envelope ' +
    '(valid: false) with line/col and suggestions (not thrown) so callers can lint an ' +
    'expression and surface fixes.',
  importPath: '@astryxdesign/cli/api',
  signature:
    'layoutCheck(expression: string, options?: LayoutCheckOptions): Promise<LayoutCheckResponse>',
  keywords: ['layout', 'check', 'validate', 'xle', 'xlo', 'lint'],
  params: [
    {
      name: 'expression',
      type: 'string',
      description: 'The layout expression to validate.',
      required: true,
    },
    {
      name: 'options.form',
      type: "'compact' | 'outline' | 'auto'",
      description:
        'Force which input surface the expression is parsed as, or auto-detect it.',
      default: "'auto'",
    },
    {
      name: 'options.loose',
      type: 'boolean',
      description:
        'Treat unknown {hint} references as warnings instead of errors.',
      default: 'false',
    },
    {
      name: 'options.cwd',
      type: 'string',
      description: 'Directory the block catalog and registry resolve against.',
    },
  ],
  returns: [
    {
      type: 'layout.check',
      description:
        'The validation result: a valid flag, the detected form, errors (each with line/col, message, formatted text, and suggestions), warnings, and the expression re-printed in both canonical surfaces (compact and outline).',
    },
  ],
  throws: [
    {code: 'ERR_INVALID_ARGUMENT', when: 'the expression is empty'},
    {
      code: 'ERR_INVALID_OPTION',
      when: 'form is not one of "compact", "outline", or "auto"',
    },
    {
      code: 'ERR_LAYOUT_PARSE',
      when: 'the expression has a syntax error (reported with line/col)',
    },
  ],
  examples: [
    {
      label: 'Validate an expression',
      code: 'const r = await layoutCheck(\'VStack[g4] > Text"Hi"\');',
    },
    {
      label: 'Read the canonical forms',
      code: 'const {data} = await layoutCheck(\'Card > Text"Hi"\');',
    },
  ],
  command: 'layout check',
  related: ['layoutExpand', 'layoutGrammar'],
};
