// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file CommandDoc for `astryx doctor`. The terminal binding of the `doctor()`
 * function (referenced via `fn`); it carries only CLI-surface facts so a
 * converter can build Commander config + --help from one source of truth.
 * @position packages/cli/clients/cli/commands — command documentation
 */

/** @type {import('@astryxdesign/cli/authoring').CommandDoc} */
export const doc = {
  type: 'command',
  name: 'doctor',
  displayName: 'astryx doctor',
  namespace: 'cli',
  summary: 'Diagnose Astryx projects and integration packages',
  description:
    'Runs read-only project health diagnostics by default: Node version, @astryxdesign/core ' +
    'install and version alignment, themes, config, agent docs, and package manager. ' +
    'The `integration` subcommands provide authoring checks for one integration package.',
  fn: 'doctor',
  subcommands: ['integration'],
  examples: [
    {label: 'Run project diagnostics', cli: 'astryx doctor'},
    {label: 'Machine-readable project report', cli: 'astryx doctor --json'},
    {
      label: 'Validate an integration',
      cli: 'astryx doctor integration validate @acme/widgets',
    },
    {
      label: 'Check template ids against Core',
      cli: 'astryx doctor integration templates @acme/widgets',
    },
    {
      label: 'Check component names against Core',
      cli: 'astryx doctor integration components @acme/widgets',
    },
    {
      label: 'Classify doc overlaps with Core',
      cli: 'astryx doctor integration docs @acme/widgets',
    },
  ],
  exitCodes: [
    {code: 0, when: 'no checks failed (warnings are allowed)'},
    {code: 1, when: 'one or more checks failed'},
  ],
  related: ['init', 'upgrade'],
};
