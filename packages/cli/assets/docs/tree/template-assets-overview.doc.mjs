// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file `astryx docs cli/integrations/templates/build-the-template/template-assets/template-assets-overview`:
 * choose one owner for every asset a copied template needs.
 */

/** @type {import('@astryxdesign/cli/authoring').ReferenceDoc} */
export const docs = {
  type: 'generic',
  name: 'template-assets-overview',
  placement: {
    parent: 'namespace:template-assets',
    slot: 'guides',
    order: 10,
  },
  title: 'Asset overview',
  category: 'guide',
  description:
    'Decide whether each style, font, icon, image, or video travels in the copied file, stays in your package, or comes from the app.',
  sections: [
    {
      id: 'choose-the-owner',
      title: 'Choose the owner',
      content: [
        {
          type: 'prose',
          text: 'The copied file does not bring sibling assets with it ({@link generic:write-the-template-file}). Give every asset exactly one owner:',
        },
        {
          type: 'table',
          headers: ['Owner', 'Use when', 'How the copied source reaches it'],
          rows: [
            [
              'Copied source',
              'The value is small, editable, and belongs to the starting point',
              'Keep it in the `.tsx` file',
            ],
            [
              'Integration package',
              'The asset should stay centrally maintained with the package',
              'Import a stable public package path',
            ],
            [
              'App',
              'The app must provide product-specific content or branding',
              'Use an explicit placeholder or app public URL and say what to replace',
            ],
          ],
        },
        {
          type: 'prose',
          text: 'Do not make a template look self-contained while it relies on an undocumented package file or app convention.',
        },
      ],
    },
  ],
};
