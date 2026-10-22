// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file `astryx docs reference/api`: the programmatic API of `@astryxdesign/cli/api`.
 *
 * Adopts each function, schema, and enum doc whose `namespace` is `reference/api`,
 * one generated level per kind: `reference/api/functions`, `reference/api/schemas`, and
 * `reference/api/enums`.
 */

/** @type {import('@astryxdesign/cli/authoring').NamespaceDoc} */
export const docs = {
  type: 'namespace',
  name: 'api',
  title: 'API',
  summary:
    'The programmatic API: functions, the JSON output envelope, error codes, and response types.',
  keywords: ['api', 'functions', 'schemas', 'enums', 'json'],
  placement: {parent: 'namespace:reference', slot: 'reference', order: 20},
  slots: {
    kinds: {title: 'Reference', accepts: {kinds: ['namespace']}},
  },
  blocks: [
    {
      type: 'prose',
      text: 'To run the whole CLI from your own command-line tool, with its arguments, folder, and command name, use the host entry: {@link generic:host-entry}.',
    },
  ],
  adopts: [
    {
      source: {group: 'reference/api', kinds: ['function', 'schema', 'enum']},
      into: 'kinds',
      groupBy: 'kind',
    },
  ],
};
