// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @file astryx docs cli/integrations — build an integration package. */

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
    guides: {
      title: 'Build an integration',
      accepts: {kinds: ['generic', 'namespace']},
    },
  },
  blocks: [
    {
      type: 'prose',
      text: 'An integration is a way to share things with Astryx users: a package you own and maintain, built on a framework Astryx gives you. Publish one, many, or any mix, and people install it in one step. It works with the Astryx CLI alongside Core. See each kind under {@link namespace:building-blocks}.',
    },
    {
      type: 'prose',
      text: 'For example, ship a carousel as an integration. Any app that installs it can find it with `npx astryx search carousel`, and the CLI uses it like any Astryx Core component.',
    },
    {
      type: 'prose',
      text: 'An integration can also replace a built-in template or doc. To start, install `@astryxdesign/cli` and open {@link generic:quick-start}.',
    },
  ],
};
