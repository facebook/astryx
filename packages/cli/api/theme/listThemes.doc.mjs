// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file FunctionDoc for the synchronous bundled-theme compatibility helper.
 */

/** @type {import('@astryxdesign/cli/authoring').FunctionDoc} */
export const doc = {
  type: 'function',
  kind: 'api',
  name: 'listThemes',
  displayName: 'listThemes()',
  summary: 'Read the CLI bundled-theme manifest.',
  description:
    'Reads templates/themes/manifest.json and returns its raw entries synchronously. This low-level helper keeps its historical bundled-only contract; project-aware themeList() and themeAdd() also discover source themes from installed integrations.',
  importPath: '@astryxdesign/cli/api',
  signature: 'listThemes(): BundledTheme[]',
  keywords: ['theme', 'themes', 'manifest', 'bundled', 'adapter', 'list'],
  params: [],
  returns: [
    {
      type: 'BundledTheme[]',
      description:
        'The bundled manifest entries: slug, displayName, description, maintained, entry, exportName, and files.',
    },
  ],
  throws: [
    {
      code: 'ERR_NO_SOURCE',
      when: 'the bundled catalog is missing, invalid, or references missing source files',
    },
  ],
  examples: [
    {label: 'Read bundled entries', code: 'const themes = listThemes();'},
  ],
  related: ['themeList', 'themeAdd', 'themeBuild'],
};
