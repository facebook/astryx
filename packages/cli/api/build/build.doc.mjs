// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file FunctionDoc for `build()` / `astryx build`. Colocated with the API
 * function it documents; the shape source of truth stays in `build.type.mjs`.
 * @position packages/cli/api/build — function documentation
 */

/** @type {import('@astryxdesign/cli/authoring').FunctionDoc} */
export const doc = {
  type: 'function',
  kind: 'api',
  name: 'build',
  displayName: 'build()',
  summary:
    'Page-building assistant: the how-to-build playbook, or a composition kit for an idea.',
  description:
    'The "assemble a page" entry point. Called with no query it returns the ' +
    'playbook signal that the renderer expands into the how-to-build-a-page ' +
    'workflow. Called with a query it runs the unified search and groups the ' +
    'hits into a composition KIT: the closest page templates, drop-in blocks, ' +
    'and idea-specific components/hooks, plus the always-on frame + foundation.',
  importPath: '@astryxdesign/cli/api',
  signature:
    'build(query?: string, options?: BuildOptions): Promise<BuildHelpResponse | BuildKitResponse>',
  keywords: ['build', 'compose', 'assemble', 'page', 'kit', 'scaffold'],
  params: [
    {
      name: 'query',
      type: 'string',
      description:
        'What you\'re building (e.g. "analytics dashboard"). Omit for the how-to-build playbook.',
    },
    {
      name: 'options.cwd',
      type: 'string',
      description:
        'Directory to resolve @astryxdesign/core and templates from.',
    },
    {
      name: 'options.type',
      type: "'component' | 'hook' | 'doc' | 'template'",
      description: 'Restrict the underlying search to a single domain.',
    },
    {
      name: 'options.limit',
      type: 'number',
      description:
        'Max results pulled from search before grouping into the kit.',
      default: '60',
    },
  ],
  returns: [
    {
      type: 'build.help',
      description:
        'Emitted when the query is omitted: a pure marker (`data.playbook: true`) that the command renderer expands into the page-building workflow prose.',
    },
    {
      type: 'build.kit',
      description:
        'The grouped composition kit: the echoed query, hasResults/directMatch flags, the closest page templates (≤3), drop-in block patterns (≤5), idea-specific components/hooks (≤6), and the always-on frame + foundation component-name arrays.',
    },
  ],
  throws: [
    {
      code: 'ERR_INVALID_ARGUMENT',
      when: 'options.type is not a known domain, or options.limit is not a positive integer',
    },
  ],
  examples: [
    {label: 'Get the playbook', code: 'const r = await build();'},
    {label: 'Compose a page', code: "await build('analytics dashboard');"},
    {
      label: 'Restrict + limit',
      code: "await build('pricing', {type: 'template', limit: 10});",
    },
  ],
  command: 'build',
  related: ['search', 'template', 'component', 'hook', 'init'],
};
