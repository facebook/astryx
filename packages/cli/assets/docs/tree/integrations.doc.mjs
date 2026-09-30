// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file `astryx docs cli/integrations`: the guides to building an integration
 * package, one short guide per task (spec:AST-046). A namespace declares its
 * slots and never lists its children: each guide places itself here with
 * `placement`.
 */

/** @type {import('@astryxdesign/cli/authoring').NamespaceDoc} */
export const docs = {
  type: 'namespace',
  name: 'integrations',
  placement: {parent: 'namespace:cli', slot: 'guides', order: 10},
  title: 'Build an integration',
  summary:
    'Build an npm package that adds components, templates, themes, docs, and codemods to Astryx apps.',
  keywords: [
    'integration',
    'integration package',
    'make an integration',
    'publish an integration',
    'integration authoring',
  ],
  slots: {
    start: {title: 'Start', accepts: {kinds: ['generic']}},
    contribute: {title: 'Contribute', accepts: {kinds: ['generic', 'namespace']}},
    ship: {title: 'Ship', accepts: {kinds: ['generic']}},
    help: {title: 'Help', accepts: {kinds: ['generic']}},
  },
};
