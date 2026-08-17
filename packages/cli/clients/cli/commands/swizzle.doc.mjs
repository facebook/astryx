// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file CommandDoc for `astryx swizzle`. The terminal binding of the `swizzle()`
 * function (referenced via `fn`); its args/flags map to that function's params
 * so a converter can build Commander config + --help from one source of truth.
 * @position packages/cli/clients/cli/commands — command documentation
 */

/** @type {import('@astryxdesign/cli/authoring').CommandDoc} */
export const doc = {
  type: 'command',
  name: 'swizzle',
  displayName: 'astryx swizzle',
  namespace: 'cli',
  summary: 'Copy component source for customization',
  description:
    "Ejects a component's source from the resolved @astryxdesign/core (or its owning " +
    'integration) into your project for deep customization, rewriting imports that ' +
    'escape the component directory. With no name it lists the swizzlable components.',
  fn: 'swizzle',
  args: [{name: 'component', param: 'component', required: false}],
  options: [
    {
      flag: '--output <dir>',
      param: 'options.output',
      default: './components/astryx',
      description: 'Output directory',
    },
    {
      flag: '--package <pkg>',
      param: 'options.package',
      description: 'Scope to a specific owning package',
    },
    {
      flag: '--list',
      param: 'options.list',
      description: 'List available components',
    },
    {
      flag: '-f, --overwrite',
      param: 'options.overwrite',
      description: 'Overwrite existing files without prompting',
    },
  ],
  examples: [
    {label: 'List swizzlable components', cli: 'astryx swizzle --list'},
    {label: 'Eject a component', cli: 'astryx swizzle XDSButton'},
  ],
  exitCodes: [
    {code: 0, when: 'success'},
    {
      code: 1,
      when: 'unknown or ambiguous component, no source on disk, a path escape, or existing files without --overwrite',
    },
  ],
  related: ['component', 'discover', 'upgrade'],
};
