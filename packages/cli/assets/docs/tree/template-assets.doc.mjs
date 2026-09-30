// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file `astryx docs cli/integrations/templates/template-assets`: make every
 * style, font, icon, and media dependency survive a template copy.
 */

/** @type {import('@astryxdesign/cli/authoring').NamespaceDoc} */
export const docs = {
  type: 'namespace',
  name: 'template-assets',
  placement: {
    parent: 'namespace:build-the-template',
    slot: 'guides',
    order: 20,
  },
  title: 'Assets',
  summary:
    "Make sure the template's styles, fonts, icons, images, and video still show up after an app copies it.",
  keywords: [
    'template assets',
    'template styles',
    'template fonts',
    'template icons',
    'template images',
  ],
  slots: {
    guides: {
      title: 'Guides',
      accepts: {kinds: ['generic']},
    },
  },
};
