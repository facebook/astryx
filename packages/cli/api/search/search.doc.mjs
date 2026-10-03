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
  namespace: 'cli/api',
  displayName: 'search()',
  summary:
    'Unified ranked search across components, hooks, docs, and templates.',
  description:
    'The single "I\'m looking for X" entry point across every content domain. ' +
    'Ranking is keyword + fuzzy (not embeddings); name and keyword signals outrank ' +
    'incidental prose mentions, so an exact match always sorts first. A component\'s ' +
    'usage guidance (its best practices) is indexed one tier below its description, ' +
    'so the words a reader types still find it — but a component that IS the answer ' +
    'always outranks one whose advice merely mentions the term.',
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
      description:
        "Directory to resolve @astryxdesign/core from. A docs-only search (`type: 'doc'`) does not need it, and a search with no `type` covers the docs alone when core is missing.",
    },
  ],
  returns: [
    {
      type: 'search',
      description:
        'The query echoed back, `matchCount` (how many candidates matched in total, before `limit`), plus a ranked SearchResultEntry[] bounded by `limit`: each has domain, name, score, reason, description, and follow-up command, plus `import` for components and hooks, `title` for docs, and `displayName` and `kind` for templates. A doc result is the smallest part that answers: one section (with `section`, and a command that reads only it), one docs-tree route, or a topic, whose command lists its sections. `parent` is the command that opens the level above it: the section list of its topic, the namespace a tree node sits in, the Unorganized level for a flat topic, or the topic list for a top-level namespace. Every doc result also carries `package`, the npm package that authored it (for a section, the package its file came from).',
    },
  ],
  throws: [
    {
      code: 'ERR_INVALID_ARGUMENT',
      when: 'the query is empty, --type is unknown, or --limit is not a positive integer',
    },
    {
      code: 'ERR_CORE_NOT_FOUND',
      when: '@astryxdesign/core cannot be found from the cwd, and `type` names a domain that reads it: `component`, `hook`, or `template`',
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
