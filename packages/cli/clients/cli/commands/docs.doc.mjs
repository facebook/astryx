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
  namespace: 'cli/commands',
  summary: 'Print reference docs',
  description:
    'Reads the reference docs: with no topic it lists every topic; a topic prints that ' +
    'full doc; `--index` lists its sections instead, each with the key to read it by; a ' +
    'topic plus a section prints that section (by key, exact title, or a unique part of ' +
    'a title). A route opens a node of the docs tree, one level at a time: `cli` lists ' +
    'its guides and reference, `cli/api/functions` lists every API function, and ' +
    '`cli/api/functions/search` prints one.',
  fn: 'docs',
  args: [
    {name: 'topic', param: 'topic', required: false},
    {name: 'section', param: 'section', required: false},
  ],
  options: [
    {
      flag: '--index',
      param: 'options.index',
      description: "List the topic's sections and their keys instead of printing the whole topic",
    },
  ],
  examples: [
    {label: 'List topics', cli: 'astryx docs'},
    {label: 'One topic as JSON', cli: 'astryx docs spacing --json'},
    {label: "A topic's sections", cli: 'astryx docs theme --index'},
    {label: 'One section', cli: 'astryx docs theme quick-start'},
    {label: 'The CLI docs tree', cli: 'astryx docs cli'},
    {label: 'One API function', cli: 'astryx docs cli/api/functions/search'},
  ],
  exitCodes: [
    {code: 0, when: 'success'},
    {
      code: 1,
      when: 'unknown topic or route, or a section that matches no section or more than one',
    },
  ],
  related: ['search', 'component', 'hook', 'template'],
};
