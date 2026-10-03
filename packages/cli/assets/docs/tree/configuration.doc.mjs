// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @file astryx docs cli/integrations/building-blocks/configuration — set how your integration behaves. */

/** @type {import('@astryxdesign/cli/authoring').NamespaceDoc} */
export const docs = {
  type: 'namespace',
  name: 'configuration',
  placement: {parent: 'namespace:building-blocks', slot: 'guides', order: 60},
  title: 'Configuration',
  summary:
    'Set how your integration behaves in an app: agent guidance, debug and gap reports, and more as it grows.',
  keywords: ['configuration', 'agent guidance', 'debug', 'gap reports'],
  slots: {
    guides: {
      title: 'Configuration',
      accepts: {kinds: ['generic', 'namespace']},
    },
  },
  blocks: [
    {
      type: 'prose',
      text: 'Beyond the things you ship, an integration can set how it behaves in an app: the guidance it gives the AI agents working there, and the record it keeps of each CLI run. Open one below to set it up.',
    },
  ],
};
