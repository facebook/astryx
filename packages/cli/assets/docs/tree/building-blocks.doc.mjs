// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @file astryx docs cli/integrations/building-blocks — the kinds you can add. */

/** @type {import('@astryxdesign/cli/authoring').NamespaceDoc} */
export const docs = {
  type: 'namespace',
  name: 'building-blocks',
  placement: {parent: 'namespace:integrations', slot: 'guides', order: 20},
  title: 'Building Blocks',
  summary:
    'Add components, templates, themes, docs, and codemods, and configure how it behaves.',
  keywords: [
    'building blocks',
    'contribute',
    'add to an integration',
    'contribution kinds',
  ],
  slots: {
    guides: {
      title: 'Building Blocks',
      accepts: {kinds: ['generic', 'namespace']},
    },
  },
  blocks: [
    {
      type: 'prose',
      text: 'These are everything you can add to an integration. Mix them however you like. You are not limited to any one thing.',
    },
    {
      type: 'list',
      style: 'unordered',
      items: [
        'One component, or a whole library of them.',
        'Components together with themes and templates.',
        'Only docs, if that is all you need.',
        'Agent guidance, so the AI agents in an app follow your library.',
        'Codemods that update app code across your breaking changes.',
      ],
    },
    {
      type: 'prose',
      text: 'Each kind below is its own guide. Open one to learn, in depth, how to add it and how to keep it healthy as your package grows.',
    },
  ],
};
