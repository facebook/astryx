// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file CommandDoc for `astryx discover`. The terminal binding of the
 * `discover()` function (referenced via `fn`); its args/flags map to that
 * function's params so a converter can build Commander config + --help from one
 * source of truth.
 * @position packages/cli/clients/cli/commands — command documentation
 */

/** @type {import('@astryxdesign/cli/authoring').CommandDoc} */
export const doc = {
  type: 'command',
  name: 'discover',
  displayName: 'astryx discover',
  namespace: 'cli',
  summary: 'Discover external packages and components',
  description:
    'Explores components contributed by configured external packages and integrations. ' +
    'With no query it lists those packages; an @scope/name query browses one package; ' +
    'an @scope/name/Component path or a free-text term resolves to a component doc.',
  fn: 'discover',
  args: [{name: 'query', param: 'query', required: false}],
  options: [
    {
      flag: '--components',
      param: 'options.components',
      description: 'List components only',
    },
  ],
  examples: [
    {label: 'List packages', cli: 'astryx discover --json'},
    {label: 'Browse a package', cli: 'astryx discover @acme/ui'},
  ],
  exitCodes: [
    {code: 0, when: 'success'},
    {
      code: 1,
      when: 'unknown package or component, a malformed doc, or an empty free-text query',
    },
  ],
  related: ['component', 'search', 'template'],
};
