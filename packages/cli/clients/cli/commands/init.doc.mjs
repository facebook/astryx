// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file CommandDoc for `astryx init`. The terminal binding of the `init()`
 * function (referenced via `fn`); its args/flags map to that function's params
 * so a converter can build Commander config + --help from one source of truth.
 * @position packages/cli/clients/cli/commands — command documentation
 */

/** @type {import('@astryxdesign/cli/authoring').CommandDoc} */
export const doc = {
  type: 'command',
  name: 'init',
  displayName: 'astryx init',
  namespace: 'cli',
  summary: 'Initialize the design system in your project',
  description:
    'Non-interactive project setup (no prompts, so it behaves the same for humans, ' +
    'agents, and CI). By default it installs the AGENTS.md/CLAUDE.md agent-docs and ' +
    'prints getting-started guidance; features/--all add theme and page-building ' +
    'guidance and can scaffold a starter template.',
  fn: 'init',
  options: [
    {
      flag: '--features <list>',
      param: 'options.features',
      description:
        'Comma-separated features to install (agents, theme, template)',
    },
    {
      flag: '--all',
      param: 'options.all',
      description: 'Install all features, no prompts',
    },
    {
      flag: '--remove-agents',
      param: 'options.removeAgents',
      description: 'Remove AI agent docs from all agent doc files',
    },
    {
      flag: '--agent <tool>',
      param: 'options.agent',
      choices: ['claude', 'cursor', 'codex', 'hermes', 'all'],
      description:
        'Target AI tool for agent docs: claude, cursor, codex, hermes, all',
    },
    {
      flag: '--agent-docs-path <path...>',
      param: 'options.agentDocsPath',
      description: 'Explicit file path(s) for agent docs',
    },
  ],
  examples: [
    {label: 'Default setup', cli: 'astryx init'},
    {label: 'All features, no prompts', cli: 'astryx init --all'},
  ],
  exitCodes: [
    {code: 0, when: 'success'},
    {
      code: 1,
      when: 'unknown --agent, an unknown feature or template, or a starter template would overwrite an existing page',
    },
  ],
  related: ['doctor', 'upgrade', 'build', 'theme'],
};
