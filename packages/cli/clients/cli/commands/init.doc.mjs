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
  namespace: 'cli/commands',
  summary: 'Initialize the design system in your project',
  description:
    'Non-interactive project setup (no prompts, so it behaves the same for humans, ' +
    'agents, and CI). By default it installs the AGENTS.md/CLAUDE.md agent-docs, ' +
    'including guidance from configured integrations, and prints getting-started ' +
    'guidance; features/--all add theme and page-building ' +
    'guidance and write an annotated theme template.',
  fn: 'init',
  options: [
    {
      flag: '--features <list>',
      param: 'options.features',
      description:
        'Comma-separated features to install (agents, theme, template). An unknown feature exits 1 with ERR_UNKNOWN_FEATURE. ' +
        'Ignored with --all or --remove-agents',
    },
    {
      flag: '--all',
      param: 'options.all',
      description: 'Install all features (agents, theme, template); overrides --features',
    },
    {
      flag: '--remove-agents',
      param: 'options.removeAgents',
      description:
        'Remove the managed block from AGENTS.md, CLAUDE.md, .claude/CLAUDE.md, .cursorrules, .hermes.md and HERMES.md ' +
        "(deleting AGENTS.md or .claude/CLAUDE.md when only init's heading is left) and do nothing else. " +
        '--features, --all, --agent and --agent-docs-path are ignored; a file written with --agent-docs-path keeps its block',
    },
    {
      flag: '--agent <tool>',
      param: 'options.agent',
      choices: ['claude', 'cursor', 'codex', 'hermes', 'muse', 'all'],
      description:
        'Target AI tool for agent docs: claude, cursor, codex, hermes, muse, all. An unknown tool exits 1 with ERR_UNKNOWN_AGENT. ' +
        'Used only when agent docs are installed (the default, --all, or --features agents); --agent-docs-path takes precedence',
    },
    {
      flag: '--agent-docs-path <path...>',
      param: 'options.agentDocsPath',
      description:
        'Explicit file path(s) for agent docs, inside the project; takes precedence over --agent. ' +
        'If any path is outside the project, no agent docs are written and the command exits 1. ' +
        'Used only when agent docs are installed',
    },
  ],
  examples: [
    {label: 'Default setup', cli: 'astryx init'},
    {label: 'All features, no prompts', cli: 'astryx init --all'},
    {label: 'Machine-readable receipt', cli: 'astryx init --json'},
  ],
  exitCodes: [
    {
      code: 0,
      when: 'success, including agent docs that could not be written for a reason other than a path escape (reported as docsError)',
    },
    {
      code: 1,
      when: 'an unknown --agent or feature, or an --agent-docs-path outside the project',
    },
  ],
  related: ['doctor', 'upgrade', 'build', 'theme'],
};
