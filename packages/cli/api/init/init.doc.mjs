// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file FunctionDoc for `init()` / `astryx init`. Colocated with the API
 * function it documents; the shape source of truth stays in `init.type.mjs`.
 * @position packages/cli/api/init — function documentation
 */

/** @type {import('@astryxdesign/cli/authoring').FunctionDoc} */
export const doc = {
  type: 'function',
  kind: 'api',
  name: 'init',
  displayName: 'init()',
  summary:
    'Non-interactive project setup: install agent docs and point at the theme + build workflows.',
  description:
    'Sets a project up with NO prompts, so it behaves identically for humans, ' +
    'agents, CI, and piped I/O. By default it installs the AGENTS.md/CLAUDE.md ' +
    'agent-docs cheat sheet and prints getting-started guidance; `features` / ' +
    '`all` add theme and page-building guidance and can scaffold a starter ' +
    'template. With `removeAgents` it removes the managed agent-docs block ' +
    'instead of installing.',
  importPath: '@astryxdesign/cli/api',
  signature:
    'init(options?: InitOptions, ctx?: {cwd?: string}): Promise<InitRunResponse | InitRemoveResponse>',
  keywords: ['init', 'setup', 'install', 'scaffold', 'agents', 'bootstrap'],
  params: [
    {
      name: 'options.features',
      type: 'string',
      description:
        'Comma-separated features to install: agents (agent docs), theme (writes the annotated theme.template.ts), template (page-template guidance).',
    },
    {
      name: 'options.all',
      type: 'boolean',
      description: 'Install all features (agents, theme, template).',
    },
    {
      name: 'options.removeAgents',
      type: 'boolean',
      description: 'Remove the managed agent-docs block instead of installing.',
    },
    {
      name: 'options.agent',
      type: 'string',
      description: 'Agent preset: claude, cursor, codex, hermes, all.',
    },
    {
      name: 'options.agentDocsPath',
      type: 'string | string[]',
      description: 'Explicit agent-docs file path(s) to write.',
    },
    {
      name: 'options.templateName',
      type: 'string',
      description:
        'Scaffold a named page template (programmatic only; the CLI never sets it).',
    },
    {name: 'ctx.cwd', type: 'string', description: 'Directory to set up.'},
  ],
  returns: [
    {
      type: 'init.run',
      description:
        'The install receipt: the `mode` (`default` | `features`), the features run, agent-doc files written, any soft docsError, the theme-template outcome (`created` | `skipped` | `failed`) plus its path, the page-template outcome (`workflow` | `created` | `skipped`) plus its path, and whether the next-steps were emitted.',
    },
    {
      type: 'init.remove',
      description:
        'Confirmation that the managed agent-docs block was removed (`data.removed: true`), returned when `removeAgents` is set.',
    },
  ],
  throws: [
    {
      code: 'ERR_UNKNOWN_AGENT',
      when: '`agent` is not one of claude, cursor, codex, hermes, all',
    },
    {
      code: 'ERR_UNKNOWN_FEATURE',
      when: '`features` contains a name other than agents, theme, or template',
    },
    {
      code: 'ERR_UNKNOWN_TEMPLATE',
      when: '`templateName` matches no bundled template',
    },
    {
      code: 'ERR_FILE_EXISTS',
      when: 'scaffolding a template would overwrite an existing page.tsx',
    },
  ],
  examples: [
    {label: 'Default setup', code: 'const r = await init();'},
    {label: 'All features', code: 'await init({all: true});'},
    {label: 'Remove agent docs', code: 'await init({removeAgents: true});'},
  ],
  command: 'init',
  related: ['doctor', 'upgrade', 'build', 'theme'],
};
