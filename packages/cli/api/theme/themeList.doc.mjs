// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file FunctionDoc for the synchronous bundled-theme compatibility API.
 */

/** @type {import('@astryxdesign/cli/authoring').FunctionDoc} */
export const doc = {
  type: 'function',
  kind: 'api',
  name: 'themeList',
  displayName: 'themeList()',
  summary: 'List themes bundled with this CLI build.',
  description:
    'Projects the bundled-theme manifest into a synchronous theme.list envelope. This preserves the original programmatic API contract. The CLI command uses themeListAvailable() so installed integrations also appear.',
  importPath: '@astryxdesign/cli/api',
  signature: 'themeList(): ThemeListResponse',
  keywords: ['theme', 'list', 'themes', 'bundled', 'available'],
  params: [],
  returns: [
    {
      type: 'theme.list',
      description:
        'Every bundled theme as ThemeListEntry[]: slug, displayName, description, and maintained flag.',
    },
  ],
  throws: [
    {
      code: 'ERR_NO_SOURCE',
      when: 'the bundled-theme manifest cannot be read or parsed',
    },
  ],
  examples: [{label: 'List bundled themes', code: 'const {data} = themeList();'}],
  related: ['themeListAvailable', 'themeAdd', 'listThemes'],
};
