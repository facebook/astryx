// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file `astryx docs cli/integrations/components/describe-the-component`:
 * choose and maintain the ComponentDoc shape that matches a component's public
 * source.
 */

/** @type {import('@astryxdesign/cli/authoring').NamespaceDoc} */
export const docs = {
  type: 'namespace',
  name: 'describe-the-component',
  placement: {parent: 'namespace:components', slot: 'guides', order: 20},
  title: 'Describe the component',
  summary:
    'Write and maintain the default component doc, then adapt it when one family owns several exports or a member needs its own file.',
  keywords: [
    'component doc',
    'component documentation',
    'component family',
    'subcomponent',
  ],
  slots: {
    guides: {
      title: 'Guides',
      accepts: {kinds: ['generic']},
    },
  },
};
