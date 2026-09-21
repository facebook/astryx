// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file FunctionDoc for the project-aware `astryx theme list` API.
 */

/** @type {import('@astryxdesign/cli/authoring').FunctionDoc} */
export const doc = {
  type: 'function',
  kind: 'api',
  name: 'themeListAvailable',
  displayName: 'themeListAvailable()',
  summary: 'List bundled and installed integration themes.',
  description:
    'Loads Project for the requested directory, combines the CLI bundle with source themes from installed integrations, and projects each entry with its owner package. An unreadable project configuration degrades to the bundled catalog.',
  importPath: '@astryxdesign/cli/api',
  signature:
    'themeListAvailable(options?: {cwd?: string, package?: string}): Promise<ThemeListResponse>',
  keywords: ['theme', 'list', 'themes', 'integration', 'available', 'package'],
  params: [
    {
      name: 'options.cwd',
      type: 'string',
      description: 'Project directory whose installed integrations contribute themes.',
    },
    {
      name: 'options.package',
      type: 'string',
      description: 'Optional exact owner-package filter.',
    },
  ],
  returns: [
    {
      type: 'theme.list',
      description:
        'Every available theme as ThemeListEntry[]: slug, displayName, description, maintained flag, and owner package.',
    },
  ],
  throws: [
    {
      code: 'ERR_NO_SOURCE',
      when: 'the CLI bundled-theme manifest cannot be read or parsed',
    },
  ],
  examples: [
    {
      label: 'List project themes',
      code: 'const {data} = await themeListAvailable();',
    },
    {
      label: 'List one package',
      code: "await themeListAvailable({package: '@acme/themes'});",
    },
  ],
  command: 'theme list',
  related: ['themeList', 'themeAdd'],
};
