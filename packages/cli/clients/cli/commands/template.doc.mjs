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
    'into the project at a target path. Narrow an ambiguous name with --type and/or --package. ' +
    '--cdn writes the no-build-step CDN starter page, which ships as an asset rather than as ' +
    'a discovered template.',
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
      flag: '--cdn [path]',
      param: 'options.cdn',
      description:
        'Write the no-build-step CDN starter page (default: cdn.template.html)',
    },
    {
      flag: '-f, --overwrite',
      param: 'options.overwrite',
      description: 'Overwrite existing files without prompting',
    },
  ],
  examples: [
    {label: 'List templates', cli: 'astryx template --json'},
    {
      label: 'Scaffold into the app',
      cli: 'astryx template dashboard ./src/app',
    },
    {label: 'CDN starter page', cli: 'astryx template --cdn'},
    {label: 'CDN starter page, elsewhere', cli: 'astryx template --cdn public/demo.html'},
  ],
  exitCodes: [
    {code: 0, when: 'success, including a CDN page left untouched because it already exists'},
    {
      code: 1,
      when: 'unknown or ambiguous template, no source, a path escape, or an existing target without --overwrite',
    },
  ],
  related: ['component', 'search', 'discover', 'init'],
};
