// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file CommandDoc for `astryx search`. The terminal binding of the `search()`
 * function (referenced via `fn`); flags map to that function's params so a
 * converter can build Commander config + --help from one source of truth.
 * @position packages/cli/clients/cli/commands — command documentation
 */

/** @type {import('@astryxdesign/cli/authoring').CommandDoc} */
export const doc = {
  type: 'command',
  name: 'search',
  displayName: 'astryx search',
  namespace: 'cli',
  summary: 'Search components, hooks, docs, and templates in one ranked list',
  description:
    'Terminal front-end to search(): prints one ranked, greppable list across ' +
    'every content domain, each row carrying a follow-up command to act on it.',
  fn: 'search',
  args: [{name: 'query', param: 'query', required: true}],
  options: [
    {
      flag: '--type <domain>',
      param: 'options.type',
      choices: ['component', 'hook', 'doc', 'template'],
      description: 'Filter to one domain (component|hook|doc|template)',
    },
    {
      flag: '--limit <n>',
      param: 'options.limit',
      description: 'Max number of results (default 20)',
    },
    {
      flag: '--verbose',
      description: 'Verbose output (include import paths and match reason)',
    },
  ],
  examples: [
    {label: 'Ranked results', cli: 'astryx search button'},
    {
      label: 'Filter + JSON',
      cli: 'astryx search "data table" --type template --json',
    },
  ],
  exitCodes: [
    {code: 0, when: 'success (including zero matches)'},
    {code: 1, when: 'invalid --type or a non-positive --limit'},
  ],
  related: ['component', 'hook', 'docs', 'template', 'build'],
};
