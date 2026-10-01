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
  namespace: 'cli/commands',
  summary: 'Expand a layout expression into validated XDS TSX',
  description:
    'Parses and validates a compressed XLE/XLO expression, then expands it into ' +
    'ready-to-use XDS TSX, routing children into slots, scaffolding typed useState for ' +
    'interactive controls, and splicing referenced blocks. Writes to a path, or returns the code.',
  fn: 'layoutExpand',
  args: [
    {
      name: 'expression',
      param: 'expression',
      required: false,
      description:
        'The XLE/XLO expression. Pass - to read it from stdin; --file reads it from a file instead.',
    },
    {
      name: 'path',
      param: 'options.targetPath',
      required: false,
      description:
        'Where to write the TSX, relative to the project root. A path that ends in .tsx, .ts, .jsx, .js, .mjs, .cjs, .css, .scss, .json, .md or .html is the file to write; ' +
        'any other path is a directory, which receives <Name>.tsx (see --name). An existing file there is replaced. ' +
        'Omit it to print the code.',
    },
  ],
  options: [
    {
      flag: '--file <file>',
      description: 'Read the expression from a file (used instead of the argument when both are given)',
    },
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
      when: 'a missing, empty or over-5 MB expression (from stdin or --file), a bad --name or --form, a parse/validation error, or a path escape',
    },
  ],
  related: ['layout check', 'layout grammar'],
};
