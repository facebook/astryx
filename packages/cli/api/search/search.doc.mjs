// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file FunctionDoc for `search()` / `astryx search`. Colocated with the API
 * function it documents; the shape source of truth stays in `search.type.mjs`.
 * @position packages/cli/api/search — function documentation
 */

/** @type {import('@astryxdesign/cli/authoring').FunctionDoc} */
export const doc = {
  type: 'function',
  kind: 'api',
  name: 'search',
  displayName: 'search()',
  summary:
    'Unified ranked search across components, hooks, docs, and templates.',
  description:
    'The single "I\'m looking for X" entry point across every content domain. ' +
    'Ranking is keyword + fuzzy (not embeddings); name and keyword signals outrank ' +
    'incidental prose mentions, so an exact match always sorts first.',
  importPath: '@astryxdesign/cli/api',
  signature:
    'search(query: string, options?: SearchOptions): Promise<SearchResponse>',
  keywords: ['search', 'find', 'lookup', 'discover'],
  params: [
    {
      name: 'query',
      type: 'string',
      description: 'Free-text search term.',
      required: true,
    },
    {
      name: 'options.type',
      type: "'component' | 'hook' | 'doc' | 'template'",
      description: 'Restrict results to a single domain.',
    },
    {
      name: 'options.limit',
      type: 'number',
      description: 'Maximum number of results.',
      default: '20',
    },
    {
      name: 'options.cwd',
      type: 'string',
      description: 'Directory to resolve @astryxdesign/core from.',
    },
  ],
  returns: [
    {
      type: 'search',
      description:
        'The query echoed back plus a ranked SearchResultEntry[] (domain, name, score, reason, description, follow-up command, and import path where relevant).',
    },
  ],
  throws: [
    {
      code: 'ERR_INVALID_ARGUMENT',
      when: 'the query is empty, --type is unknown, or --limit is not a positive integer',
    },
  ],
  examples: [
    {label: 'Find a component', code: "const r = await search('button');"},
    {
      label: 'Restrict + limit',
      code: "await search('data table', {type: 'template', limit: 5});",
    },
  ],
  command: 'search',
  related: ['component', 'hook', 'docs', 'template', 'build'],
};
