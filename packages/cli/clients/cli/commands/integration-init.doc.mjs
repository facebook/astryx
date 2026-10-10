// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @type {import('@astryxdesign/cli/authoring').CommandDoc} */
export const doc = {
  type: 'command',
  name: 'integration init',
  displayName: 'astryx integration init',
  namespace: 'cli/commands',
  summary: 'Create an Astryx integration package in one step',
  description:
    "Creates or completes the package.json for an integration package: sets the name, version, and — for a new package — an empty exports map, then adds missing dependencies as dev dependencies and installs declared ones where they are declared. The Core peer is written by `integration add` on the first component, template, or theme. After init, run `astryx integration add` to add your first item. See {@link generic:quick-start}.",
  fn: 'integrationInit',
  args: [
    {
      name: 'name',
      param: 'options.name',
      required: false,
      description:
        'Package name (e.g. @acme/astryx-widgets). Default: the current directory name. Cannot differ from an existing package name.',
    },
  ],
  options: [
    {
      flag: '--dry-run',
      param: 'options.dryRun',
      description: 'Preview what would change without writing files or installing',
    },
    {
      flag: '--no-install',
      param: 'options.noInstall',
      description:
        'Skip the dependency install step (write package.json only)',
    },
  ],
  examples: [
    {
      label: 'Initialize a new integration',
      cli: 'astryx integration init @acme/astryx-widgets',
    },
    {
      label: 'Initialize using the directory name',
      cli: 'astryx integration init',
    },
    {
      label: 'Preview without changes',
      cli: 'astryx integration init @acme/astryx-widgets --dry-run --json',
    },
  ],
  exitCodes: [
    {code: 0, when: 'the package is initialized, unchanged, or the dry run succeeds'},
    {code: 1, when: 'the name is invalid, conflicts with the existing name, or the dependency install fails'},
  ],
  related: ['integration add', 'integration verify'],
};
