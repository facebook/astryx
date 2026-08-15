// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file CommandDoc for `astryx build`. The terminal binding of the `build()`
 * function (referenced via `fn`); its args/flags map to that function's params
 * so a converter can build Commander config + --help from one source of truth.
 * @position packages/cli/clients/cli/commands — command documentation
 */

/** @type {import('@astryxdesign/cli/authoring').CommandDoc} */
export const doc = {
  type: 'command',
  name: 'build',
  displayName: 'astryx build',
  namespace: 'cli',
  summary:
    'Build a page: composition kit for an idea, or the workflow playbook (no args)',
  description:
    'The assemble-a-page entry point. With no query it returns the how-to-build-a-page ' +
    'playbook; with a query it groups the unified search hits into a composition kit: ' +
    'the closest templates, drop-in blocks, and idea-specific components and hooks.',
  fn: 'build',
  args: [{name: 'query', param: 'query', required: false}],
  options: [
    {
      flag: '--type <domain>',
      param: 'options.type',
      choices: ['component', 'hook', 'template'],
      description: 'Filter the kit to one domain (component|hook|template)',
    },
    {
      flag: '--limit <n>',
      param: 'options.limit',
      description: 'Max candidates to draw from (default 60)',
    },
    {
      flag: '--verbose',
      description: 'Verbose output (include import paths and match reason)',
    },
  ],
  examples: [
    {label: 'Get the playbook', cli: 'astryx build'},
    {label: 'Compose a page', cli: 'astryx build "analytics dashboard" --json'},
  ],
  exitCodes: [
    {code: 0, when: 'success (including zero matches)'},
    {code: 1, when: 'invalid --type or a non-positive --limit'},
  ],
  related: ['search', 'template', 'component', 'hook', 'init'],
};
