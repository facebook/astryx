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
      text: 'In global mode: users can install your integration for their computer, beside the global CLI. It then applies in folders outside any project, and inside a project only if the project installs it. See {@link namespace:global} and {@link generic:global-integrations}.',
    },
    {
      type: 'prose',
      text: 'An integration is a way to share things with Astryx users: a package you own and maintain, built on a framework Astryx gives you. Publish one, many, or any mix, and people install it in one step. It works with the Astryx CLI alongside Core. See each kind under {@link namespace:building-blocks}.',
    },
    {
      type: 'prose',
      text: 'For example, ship a carousel as an integration. Any app that installs it can find it with `astryx search carousel`, and the CLI uses it like any Astryx Core component.',
    },
    {
      type: 'prose',
      text: 'An integration can also replace a built-in template or doc. To start, install `@astryxdesign/cli` and open {@link generic:quick-start}.',
    },
    {
      type: 'prose',
      text: 'Every field of every file you write for an integration is in {@link generic:authoring}.',
    },
    {
      type: 'prose',
      text: "Every integration runs `astryx integration check --strict` in its own build: it is required, not optional, so a doc, prop, or link that stops matching the code fails your build instead of your users' apps. See {@link generic:checks}.",
    },
  ],
};
