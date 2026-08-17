// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file CommandDoc for `astryx theme template`. The terminal binding of the
 * `themeTemplate()` function (referenced via `fn`); its args/flags map to that
 * function's params so a converter can build Commander config + --help from one
 * source of truth.
 * @position packages/cli/clients/cli/commands — command documentation
 */

/** @type {import('@astryxdesign/cli/authoring').CommandDoc} */
export const doc = {
  type: 'command',
  name: 'theme template',
  displayName: 'astryx theme template',
  namespace: 'cli',
  summary: 'Write the annotated theme template into your project',
  description:
    'Writes theme.template.ts: the annotated reference for the whole theme surface — every ' +
    'defineTheme field, the token families, the component override syntax, and how a theme is ' +
    'consumed — naming the CLI command that prints the authoritative reference for each. Read ' +
    'it, copy what you need into your own theme file, delete it. Use `theme add <slug>` instead ' +
    'to start from a theme we ship. Leaves an existing file untouched unless --overwrite.',
  fn: 'themeTemplate',
  args: [{name: 'path', param: 'options.targetPath', required: false}],
  options: [
    {
      flag: '-f, --overwrite',
      param: 'options.overwrite',
      description: 'Replace an existing file',
    },
  ],
  examples: [
    {label: 'Write it at the project root', cli: 'astryx theme template'},
    {label: 'Somewhere else', cli: 'astryx theme template src/themes/starter.ts'},
  ],
  exitCodes: [
    {code: 0, when: 'success, including when an existing file was left untouched'},
    {code: 1, when: 'the target path escapes the project'},
  ],
  related: ['theme add', 'theme list', 'theme build'],
};
