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
  summary: 'Diagnose your XDS setup and report problems with fixes',
  description:
    'Runs read-only diagnostics: Node version, @astryxdesign/core install and version ' +
    'alignment, installed themes, config validity, agent docs, and the package manager, ' +
    'and reports pass/warn/fail with an actionable fix for each problem. Safe as a CI gate.',
  fn: 'doctor',
  examples: [
    {label: 'Run diagnostics', cli: 'astryx doctor'},
    {label: 'Machine-readable report', cli: 'astryx doctor --json'},
  ],
  exitCodes: [
    {code: 0, when: 'no checks failed (warnings are allowed)'},
    {code: 1, when: 'one or more checks failed'},
  ],
  related: ['init', 'upgrade'],
};
