// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file FunctionDoc for `discover()` / `astryx discover`. Colocated with the API
 * function it documents; the shape source of truth stays in `discover.type.mjs`.
 * @position packages/cli/api/discover — function documentation
 */

/** @type {import('@astryxdesign/cli/authoring').FunctionDoc} */
export const doc = {
  type: 'function',
  kind: 'api',
  name: 'discover',
  displayName: 'discover()',
  summary: 'Browse and search components from configured external packages.',
  description:
    'Explores components contributed by configured external packages and integrations ' +
    'the ones that declare a components root. With no query it lists those packages; ' +
    'an @scope/name query browses one package; @scope/name/Component (or a free-text ' +
    "term that resolves to a single component) returns that component's validated doc; " +
    'a free-text term with several matches returns the candidate list.',
  importPath: '@astryxdesign/cli/api',
  signature:
    'discover(query?: string, options?: DiscoverOptions): Promise<DiscoverListResponse | DiscoverDetailResponse | DiscoverDetailDocResponse | DiscoverSearchResponse>',
  keywords: [
    'discover',
    'packages',
    'integrations',
    'external',
    'components',
    'search',
  ],
  params: [
    {
      name: 'query',
      type: 'string',
      description:
        'An @scope/name package, an @scope/name/Component path, or a free-text term. Omit to list all configured packages.',
    },
    {
      name: 'options.components',
      type: 'boolean',
      description:
        'List components only. A CLI display flag consumed by the renderer; the programmatic response shape is unchanged.',
    },
    {
      name: 'options.lang',
      type: 'string',
      description: 'Language code to translate a resolved component doc into.',
    },
    {
      name: 'options.zh',
      type: 'boolean',
      description: 'Return a resolved component doc in Chinese.',
      default: 'false',
    },
  ],
  returns: [
    {
      type: 'discover.list',
      description:
        'The configured external packages (name, category, components, version, description). When empty it carries meta.configured to distinguish "nothing configured" from "configured but nothing discovered".',
    },
    {
      type: 'discover.detail',
      description: 'A single package entry, for an @scope/name query.',
    },
    {
      type: 'discover.detail.doc',
      description:
        'The validated ComponentDoc for one external component: an @scope/name/Component query, or a free-text term that resolves to exactly one component.',
    },
    {
      type: 'discover.search',
      description:
        'The query echoed back plus the matching {package, component} pairs, when a free-text term matches several components.',
    },
  ],
  throws: [
    {
      code: 'ERR_INVALID_ARGUMENT',
      when: 'the query is a non-string value, or a free-text search is run with an empty query',
    },
    {
      code: 'ERR_UNKNOWN_PACKAGE',
      when: 'the @scope/name package is not among the configured packages',
    },
    {
      code: 'ERR_UNKNOWN_COMPONENT',
      when: 'the component is not found in the named @scope/name package',
    },
    {
      code: 'ERR_NOT_FOUND',
      when: 'a free-text term matches no component in any package',
    },
    {
      code: 'ERR_INVALID_DOC',
      when: "the resolved component's docs fail to load or are malformed",
    },
  ],
  examples: [
    {label: 'List packages', code: 'const {data} = await discover();'},
    {label: 'Browse a package', code: "await discover('@acme/ui');"},
    {label: 'Show a component doc', code: "await discover('@acme/ui/Button');"},
    {label: 'Free-text search', code: "await discover('button');"},
  ],
  command: 'discover',
  related: ['component', 'search', 'template'],
};
