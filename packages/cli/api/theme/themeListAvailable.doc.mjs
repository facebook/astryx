// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file FunctionDoc for the project-aware `astryx theme list` API.
 */

/** @type {import('@astryxdesign/cli/authoring').FunctionDoc} */
export const doc = {
  type: 'function',
  kind: 'api',
  name: 'themeListAvailable',
  namespace: 'cli/api',
  displayName: 'themeListAvailable()',
  summary: 'List bundled and installed integration themes.',
  description:
    'Lists the bundled themes plus source themes from integrations installed in cwd, each with its owner package. If the project configuration cannot be read, it falls back to the bundled themes.',
  importPath: '@astryxdesign/cli/api',
  signature:
    'themeListAvailable(options?: {cwd?: string, package?: string}): Promise<ThemeListResponse>',
  keywords: ['theme', 'list', 'themes', 'integration', 'available', 'package'],
  params: [
    {
      name: 'options.cwd',
      type: 'string',
      description:
        'Project directory whose installed integrations contribute themes.',
      default: 'process.cwd()',
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
      when: 'the CLI bundled-theme descriptors cannot be read or parsed',
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
