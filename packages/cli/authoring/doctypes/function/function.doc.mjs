// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file SchemaDoc for the `FunctionDoc` doc-type — the generalized
 * `type: 'function'` doc that covers BOTH React hooks and CLI/programmatic API
 * functions. Colocated with the type it describes (`type.ts`).
 * @position packages/cli/authoring/doctypes/function — doc-type documentation
 */

/** @type {import('@astryxdesign/cli/authoring').SchemaDoc} */
export const doc = {
  type: 'schema',
  name: 'function-doc',
  displayName: 'FunctionDoc',
  namespace: 'authoring',
  description:
    "The generalized `type: 'function'` doc-type covering both React hooks and CLI/API " +
    'functions. A hook (HookDoc) is the hook-flavored view of this same kind; FunctionDoc ' +
    'adds the fields an API function needs (a {type, data} return envelope, thrown error ' +
    'codes, the wrapping CLI command). The CLI binding itself lives in a separate CommandDoc.',
  appliesTo: 'api/<name>/<name>.doc.mjs',
  fields: [
    {
      name: 'type',
      type: "'function'",
      description: 'Doc-kind discriminant (shared with hooks).',
    },
    {
      name: 'name',
      type: 'string',
      description: "Export name, e.g. 'search' | 'useMediaQuery'.",
      required: true,
    },
    {
      name: 'displayName',
      type: 'string',
      description: "Human-readable display name, e.g. 'search()'.",
      required: true,
    },
    {
      name: 'kind',
      type: "'hook' | 'api'",
      description:
        'Which flavor; drives docsite sectioning; inferred from importPath if omitted.',
    },
    {
      name: 'summary',
      type: 'string',
      description: 'One-line summary.',
    },
    {
      name: 'description',
      type: 'string',
      description: 'Longer description.',
    },
    {
      name: 'namespace',
      type: 'string',
      description:
        "Docs namespace path. Defaults (e.g. 'cli/api') applied by the docs index.",
    },
    {
      name: 'aliases',
      type: 'string[]',
      description: 'Alternate slugs that also resolve to this doc.',
    },
    {
      name: 'keywords',
      type: 'string[]',
      description: 'Search keywords for discovery.',
    },
    {
      name: 'importPath',
      type: 'string',
      description:
        "Import path, e.g. '@astryxdesign/cli/api' | '@astryxdesign/core/hooks'.",
    },
    {
      name: 'signature',
      type: 'string',
      description:
        "Full signature as a string, e.g. 'search(query, options?): Promise<SearchResponse>'.",
    },
    {
      name: 'params',
      type: 'HookParamDoc[]',
      description: 'Parameters / options-object fields.',
      required: true,
      fields: [
        {
          name: 'params[].name',
          type: 'string',
          description: 'Parameter or option field name.',
          required: true,
        },
        {
          name: 'params[].type',
          type: 'string',
          description: 'TypeScript type signature as a string.',
          required: true,
        },
        {
          name: 'params[].description',
          type: 'string',
          description: 'What this parameter does. 1-2 sentences.',
          required: true,
        },
        {
          name: 'params[].default',
          type: 'string',
          description: 'Default value as a string, if optional with a default.',
        },
        {
          name: 'params[].required',
          type: 'boolean',
          description: 'True if required. Omit if optional.',
        },
      ],
    },
    {
      name: 'returns',
      type: 'FunctionReturnDoc[]',
      description:
        'Return documentation. Hooks list named return fields (`name` set); API functions list {type, data} envelope entries where `type` is the response discriminant and `name` is omitted.',
      required: true,
      fields: [
        {
          name: 'returns[].name',
          type: 'string',
          description: 'Field name (hooks); omit for API envelope entries.',
        },
        {
          name: 'returns[].type',
          type: 'string',
          description:
            'TS type (hooks) or response-type discriminant (API), as a string.',
          required: true,
        },
        {
          name: 'returns[].description',
          type: 'string',
          description: 'What this return value / envelope entry provides.',
          required: true,
        },
      ],
    },
    {
      name: 'throws',
      type: 'FunctionThrowsDoc[]',
      description:
        'Errors the function throws (API functions), keyed to ERROR_CODES.',
      fields: [
        {
          name: 'throws[].code',
          type: 'string',
          description: 'The ERROR_CODES member thrown.',
          required: true,
        },
        {
          name: 'throws[].when',
          type: 'string',
          description: 'The condition under which it is thrown.',
          required: true,
        },
      ],
    },
    {
      name: 'examples',
      type: 'FunctionExampleDoc[]',
      description: 'Usage examples.',
      fields: [
        {
          name: 'examples[].label',
          type: 'string',
          description: 'Optional heading shown above the snippet.',
        },
        {
          name: 'examples[].code',
          type: 'string',
          description: 'Language-level usage, e.g. "await search(\'button\')".',
          required: true,
        },
        {
          name: 'examples[].result',
          type: 'string',
          description: 'Optional sample result.',
        },
      ],
    },
    {
      name: 'usage',
      type: 'UsageDoc',
      description:
        'Usage documentation (hooks): description, best practices, anatomy. Same shape as HookDoc.usage.',
    },
    {
      name: 'command',
      type: 'string',
      description: "The CLI command that wraps this function, e.g. 'search'.",
    },
    {
      name: 'related',
      type: 'string[]',
      description: 'Related function/command names.',
    },
    {
      name: 'relatedComponents',
      type: 'string[]',
      description: 'Component names this is commonly used with (hooks).',
    },
    {
      name: 'relatedHooks',
      type: 'string[]',
      description: 'Other hook names this is commonly used with (hooks).',
    },
    {
      name: 'category',
      type: 'string',
      description: 'Category for grouping in listings.',
    },
  ],
  examples: [
    {
      label: 'An API function doc (envelope return, no field name)',
      code: `/** @type {import('@astryxdesign/cli/authoring').FunctionDoc} */
export const doc = {
  type: 'function',
  kind: 'api',
  name: 'search',
  displayName: 'search()',
  namespace: 'cli/api',
  importPath: '@astryxdesign/cli/api',
  summary: 'Find components, hooks, docs, and templates by term.',
  signature: 'search(query, options?): Promise<SearchResponse>',
  params: [
    {name: 'query', type: 'string', description: 'The search term.', required: true},
    {name: 'options.type', type: "'component' | 'hook' | 'doc' | 'template'", description: 'Restrict results to one domain.'},
  ],
  returns: [
    {type: 'search', description: 'Envelope with the query and ranked results[].'},
  ],
  throws: [
    {code: 'ERR_INVALID_ARGUMENT', when: 'query is empty.'},
  ],
  examples: [
    {label: 'Basic', code: "await search('button')", result: "{ type: 'search', data: { results: [...] } }"},
  ],
  command: 'search',
};`,
    },
  ],
  notes: [
    {
      type: 'prose',
      text: "The `type` discriminant is 'function' for both flavors. Set `kind: 'hook'` or `kind: 'api'` to drive docsite sectioning; it is inferred from `importPath` when omitted.",
    },
    {
      type: 'prose',
      text: 'The two flavors differ in `returns`: a hook lists named fields (`name` set), while an API function lists {type, data} envelope entries whose `type` is the response discriminant and whose `name` is omitted. `throws` (keyed to ERROR_CODES) applies to API functions.',
    },
    {
      type: 'prose',
      text: 'The function does not know it has a CLI. The terminal binding (args, flags, exit codes) lives in a separate CommandDoc that references this function via `fn`; here you only note the wrapping command name via `command`.',
    },
  ],
};
