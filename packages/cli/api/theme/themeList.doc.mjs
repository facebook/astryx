// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file FunctionDoc for `themeList()` / `astryx theme list`. Colocated with the
 * API function it documents; the response-shape source of truth stays in
 * `theme.type.mjs`.
 * @position packages/cli/api/theme — function documentation
 */

/** @type {import('@astryxdesign/cli/authoring').FunctionDoc} */
export const doc = {
  type: 'function',
  kind: 'api',
  name: 'themeList',
  displayName: 'themeList()',
  summary: 'List the themes bundled with this CLI build.',
  description:
    'Projects the bundled-theme manifest into the theme.list envelope: the themes that themeAdd ' +
    'can scaffold. A pure projection of the manifest read by listThemes(); no I/O beyond that read, ' +
    'and it returns synchronously.',
  importPath: '@astryxdesign/cli/api',
  signature: 'themeList(): ThemeListResponse',
  keywords: ['theme', 'list', 'themes', 'bundled', 'available'],
  params: [],
  returns: [
    {
      type: 'theme.list',
      description:
        'Every bundled theme as a ThemeListEntry[]: each entry has slug, displayName, description, and a maintained flag.',
    },
  ],
  throws: [
    {
      code: 'ERR_NO_SOURCE',
      when: 'the bundled-theme manifest exists but cannot be read or parsed',
    },
  ],
  examples: [
    {label: 'List bundled themes', code: 'const {data} = themeList();'},
  ],
  command: 'theme list',
  related: ['themeAdd', 'listThemes', 'themeBuild'],
};
