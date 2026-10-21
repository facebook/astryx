// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file FunctionDoc for `searchCatalog()`, search on a gathered catalog.
 * @position packages/cli/api/search — function documentation
 */

/** @type {import('@astryxdesign/cli/authoring').FunctionDoc} */
export const doc = {
  type: 'function',
  kind: 'api',
  name: 'searchCatalog',
  namespace: 'cli/api',
  displayName: 'searchCatalog()',
  summary:
    'The same answer as search(), from a catalog gatherSearchCatalog() returned.',
  description:
    "Runs `search()`'s ranking on a catalog from `gatherSearchCatalog()`, without reading files, so code in a browser answers as `astryx search` does. It is the entry of `@astryxdesign/cli/search`. Use a catalog from the same CLI; another shape is refused. A catalog gathered for one `type` answers only that `type`.",
  importPath: '@astryxdesign/cli/search',
  signature:
    'searchCatalog(query: string, options: {type?: SearchDomain, limit?: number}, catalog: GatheredSearchCatalog): Promise<SearchResponse>',
  keywords: ['search', 'catalog'],
  params: [
    {
      name: 'query',
      type: 'string',
      description: 'Free-text search term.',
      required: true,
    },
    {
      name: 'options.limit',
      type: 'number',
      description: 'Maximum number of results.',
      default: '20',
    },
    {
      name: 'options.type',
      type: "'component' | 'hook' | 'doc' | 'template' | 'theme'",
      description: 'The `type` the catalog was gathered for, if any.',
    },
    {
      name: 'catalog',
      type: 'GatheredSearchCatalog',
      description: 'What gatherSearchCatalog() returned, parsed from JSON.',
      required: true,
    },
  ],
  returns: [
    {
      type: 'search',
      description: 'What `search()` returns for the same query.',
    },
  ],
  throws: [
    {
      code: 'ERR_INVALID_ARGUMENT',
      when: "the query is empty, the limit is not a positive integer, or `type` is not the catalog's",
    },
  ],
  examples: [
    {
      label: 'Search a catalog',
      code: "await searchCatalog('button', {}, catalog);",
    },
  ],
  related: ['search', 'gatherSearchCatalog'],
};
