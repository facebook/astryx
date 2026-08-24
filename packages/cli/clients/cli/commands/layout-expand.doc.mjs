// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file CommandDoc for `astryx layout expand`. The terminal binding of the
 * `layoutExpand()` function (referenced via `fn`); its args/flags map to that
 * function's params so a converter can build Commander config + --help from one
 * source of truth.
 * @position packages/cli/clients/cli/commands — command documentation
 */

/** @type {import('@astryxdesign/cli/authoring').CommandDoc} */
export const doc = {
  type: 'command',
  name: 'layout expand',
  displayName: 'astryx layout expand',
  namespace: 'cli',
  summary: 'Expand a layout expression into validated XDS TSX',
  description:
    'Parses and validates a compressed XLE/XLO expression, then expands it into ' +
    'ready-to-use XDS TSX, routing children into slots, scaffolding typed useState for ' +
    'interactive controls, and splicing referenced blocks. Writes to a path, or returns the code.',
  fn: 'layoutExpand',
  args: [
    {name: 'expression', param: 'expression', required: false},
    {name: 'path', param: 'options.targetPath', required: false},
  ],
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
      flag: '--name <name>',
      param: 'options.name',
      default: 'GeneratedLayout',
      description: 'Generated component name (PascalCase)',
    },
    {
      flag: '--loose',
      param: 'options.loose',
      description: 'Downgrade unknown {block} hints to TODO placeholders',
    },
  ],
  examples: [
    {
      label: 'Expand to a file',
      cli: "astryx layout expand 'V[g6] > C{card-callout}*4' ./src/Page.tsx",
    },
    {
      label: 'From a file, named',
      cli: 'astryx layout expand --file layout.xlo --name Dashboard',
    },
  ],
  exitCodes: [
    {code: 0, when: 'success'},
    {
      code: 1,
      when: 'a missing/empty expression, a bad --name or --form, a parse/validation error, or a path escape',
    },
  ],
  related: ['layout check', 'layout grammar'],
};
