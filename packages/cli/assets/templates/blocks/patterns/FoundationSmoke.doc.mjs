// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @type {import('@astryxdesign/cli/authoring').TemplateDoc} */
export const doc = {
  type: 'block',
  name: 'Foundation Smoke Check',
  displayName: 'Foundation Smoke Check',
  description:
    'Button, TextInput, Card and Table under the host app CSS, with stable markers for the foundation browser check. Render before building or migrating screens.',
  keywords: [
    'foundation',
    'setup',
    'migration',
    'cascade layers',
    'smoke check',
  ],
  isReady: true,
  scaffold: true,
  aspectRatio: 16 / 9,
  componentsUsed: ['Button', 'TextInput', 'Card', 'Table', 'Layout', 'Text'],
};
