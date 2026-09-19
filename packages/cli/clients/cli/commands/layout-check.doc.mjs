// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file CommandDoc for `astryx layout check`. The terminal binding of the
 * `layoutCheck()` function (referenced via `fn`); its args/flags map to that
 * function's params so a converter can build Commander config + --help from one
 * source of truth.
 * @position packages/cli/clients/cli/commands — command documentation
 */

/** @type {import('@astryxdesign/cli/authoring').CommandDoc} */
export const doc = {
  type: 'command',
  name: 'layout check',
  displayName: 'astryx layout check',
  namespace: 'cli',
  summary:
    'Validate a layout expression and echo canonical compact/outline forms',
  description:
    'Parses and validates a compressed XLE/XLO expression without generating any TSX, and ' +
    'echoes it back in both canonical surfaces (compact and outline). An invalid but ' +
    'parseable expression is reported with line/col and suggestions, and exits non-zero.',
  fn: 'layoutCheck',
  args: [{name: 'expression', param: 'expression', required: false}],
  options: [
    {flag: '--file <file>', description: 'Read the expression from a file'},
    {
      flag: '--form <form>',
      param: 'options.form',
      choices: ['compact', 'outline', 'auto'],
      default: 'auto',
      description: 'Input surface: compact, outline, or auto',
    },
    {
      flag: '--loose',
      param: 'options.loose',
      description: 'Downgrade unknown {block} hints to TODO placeholders',
    },
  ],
  examples: [
    {
      label: 'Validate an expression',
      cli: "astryx layout check 'A[cp6] > L > LC > S[p6]' --json",
    },
  ],
  exitCodes: [
    {code: 0, when: 'the expression is valid'},
    {
      code: 1,
      when: 'the expression is invalid or empty, has a syntax error, or a bad --form',
    },
  ],
  related: ['layout expand', 'layout grammar'],
};
