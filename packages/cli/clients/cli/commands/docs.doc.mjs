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
    'Reads the reference docs progressively: with no topic it lists every topic; a topic ' +
    'lists its sections, each with the key to read it by; a topic plus a section prints ' +
    'that section (by key, exact title, or a unique part of a title); `--detail full` ' +
    'prints the whole topic.',
  fn: 'docs',
  args: [
    {name: 'topic', param: 'topic', required: false},
    {name: 'section', param: 'section', required: false},
  ],
  examples: [
    {label: 'List topics', cli: 'astryx docs'},
    {label: "A topic's sections", cli: 'astryx docs theme'},
    {label: 'One section', cli: 'astryx docs theme quick-start'},
    {label: 'A whole topic as JSON', cli: 'astryx docs spacing --detail full --json'},
  ],
  exitCodes: [
    {code: 0, when: 'success'},
    {
      code: 1,
      when: 'unknown topic, or a section that matches no section or more than one',
    },
  ],
  related: ['search', 'component', 'hook', 'template'],
};
