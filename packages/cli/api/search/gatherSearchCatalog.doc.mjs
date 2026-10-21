// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file FunctionDoc for `gatherSearchCatalog()`, the catalog searchCatalog() reads.
 * @position packages/cli/api/search — function documentation
 */

/** @type {import('@astryxdesign/cli/authoring').FunctionDoc} */
export const doc = {
  type: 'function',
  kind: 'api',
  name: 'gatherSearchCatalog',
  namespace: 'cli/api',
  displayName: 'gatherSearchCatalog()',
  summary:
    'Everything search() ranks for a project, as JSON, for searchCatalog().',
  description:
    "Gathers what `search()` ranks from `cwd`, with the project's integrations, as JSON. Pass it to `searchCatalog()` to get `search()`'s answer without reading files. It records the CLI version that gathered it; gather it again when the CLI changes.",
  importPath: '@astryxdesign/cli/api',
  signature:
    'gatherSearchCatalog(options?: {cwd?: string, type?: SearchDomain}): Promise<GatheredSearchCatalog>',
  keywords: ['search', 'catalog'],
  params: [
    {
      name: 'options.cwd',
      type: 'string',
      description:
        'The project, as `search()` reads it. Default: the current directory.',
    },
    {
      name: 'options.type',
      type: "'component' | 'hook' | 'doc' | 'template' | 'theme'",
      description:
        'Gather one `type` only; the catalog then answers that `type` alone.',
    },
  ],
  returns: [
    {
      type: 'GatheredSearchCatalog',
      description:
        'JSON that `searchCatalog()` reads, with the CLI version that gathered it.',
    },
  ],
  throws: [
    {code: 'ERR_INVALID_ARGUMENT', when: '`type` is not a search domain'},
    {
      code: 'ERR_CORE_NOT_FOUND',
      when: '`type` needs @astryxdesign/core and none is found from `cwd`',
    },
  ],
  examples: [
    {
      label: 'Gather a catalog',
      code: 'const catalog = await gatherSearchCatalog({cwd});',
    },
  ],
  related: ['search', 'searchCatalog'],
};
