// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file CommandDoc for `astryx template`. The terminal binding of the
 * `template()` function (referenced via `fn`); its args/flags map to that
 * function's params so a converter can build Commander config + --help from one
 * source of truth.
 * @position packages/cli/clients/cli/commands — command documentation
 */

/** @type {import('@astryxdesign/cli/authoring').CommandDoc} */
export const doc = {
  type: 'command',
  name: 'template',
  displayName: 'astryx template',
  namespace: 'cli',
  summary: 'Inject a page or block template',
  description:
    'One entry point for the template family: with no name it lists the discovered ' +
    'templates; with a name it shows the source or a layout skeleton, or scaffolds it ' +
    'into the project at a target path. Narrow an ambiguous name with --type and/or --package.',
  fn: 'template',
  args: [
    {name: 'name', param: 'name', required: false},
    {name: 'path', param: 'options.targetPath', required: false},
  ],
  options: [
    {flag: '--list', param: 'options.list', description: 'List available templates'},
    {
      flag: '--type <type>',
      param: 'options.type',
      choices: ['page', 'block'],
      description: 'Filter by template type: page or block',
    },
    {
      flag: '--package <pkg>',
      param: 'options.package',
      description: 'Narrow to templates from a specific package',
    },
    {
      flag: '--skeleton',
      param: 'options.skeleton',
      description:
        'Show layout skeleton with spatial annotations (padding, gap, nesting)',
    },
    {
      flag: '-f, --overwrite',
      param: 'options.overwrite',
      description: 'Overwrite existing files without prompting',
    },
    {
      flag: '--with-shell',
      param: 'options.withShell',
      description:
        "Wrap the template in the project's app shell (an integration's, or core's AppShell)",
    },
  ],
  examples: [
    {label: 'List templates', cli: 'astryx template --json'},
    {
      label: 'Scaffold into the app',
      cli: 'astryx template dashboard ./src/app',
    },
  ],
  exitCodes: [
    {code: 0, when: 'success'},
    {
      code: 1,
      when: 'unknown or ambiguous template, no source, a path escape, or an existing target without --overwrite',
    },
  ],
  related: ['component', 'search', 'discover', 'init'],
};
