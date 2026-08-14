// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file CommandDoc for `astryx docs`. The terminal binding of the `docs()`
 * function (referenced via `fn`); its args/flags map to that function's params
 * so a converter can build Commander config + --help from one source of truth.
 * @position packages/cli/clients/cli/commands — command documentation
 */

/** @type {import('@astryxdesign/cli/authoring').CommandDoc} */
export const doc = {
  type: 'command',
  name: 'docs',
  displayName: 'astryx docs',
  namespace: 'cli',
  summary: 'Print reference docs',
  description:
    'Reads the reference docs: with no topic it lists every topic; a topic prints that ' +
    'full doc; a topic plus a section returns the first section whose title contains the ' +
    '(case-insensitive) query.',
  fn: 'docs',
  args: [
    {name: 'topic', param: 'topic', required: false},
    {name: 'section', param: 'section', required: false},
  ],
  examples: [
    {label: 'List topics', cli: 'astryx docs'},
    {label: 'One topic as JSON', cli: 'astryx docs spacing --json'},
  ],
  exitCodes: [
    {code: 0, when: 'success'},
    {
      code: 1,
      when: 'unknown topic, or a section that matches no title in the topic',
    },
  ],
  related: ['search', 'component', 'hook', 'template'],
};
