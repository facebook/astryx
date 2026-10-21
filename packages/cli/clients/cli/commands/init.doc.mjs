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
    "steps. --features and --all print only the chosen features' guidance (no " +
    'getting-started steps); the theme feature also writes an annotated theme template. ' +
    'Outside a project it writes the same files but prints no step that sets up a project: ' +
    'no getting-started steps, and no step that adds a theme to an app. ' +
        '--user writes the computer-level agent text instead (see the flag), in any folder, and touches nothing in the folder. ' +
    'The CLI installed for the computer also keeps that text current in the background, unless --user --remove-agents turned it off; ' +
    'package install scripts, project setup, and upgrade never write it.',
  fn: 'init',
  options: [
    {
      flag: '--features <list>',
      param: 'options.features',
      description:
        'Comma-separated features: agents (agent docs), theme (writes theme.template.ts), template (prints the page-building commands; writes no file). ' +
        'An unknown feature exits 1 with ERR_UNKNOWN_FEATURE. Refused with --all or --remove-agents',
    },
    {
      flag: '--all',
      param: 'options.all',
      description:
        'Install all features (agents, theme, template); refused with --features. Prints their guidance instead of the getting-started steps',
    },
    {
      flag: '--remove-agents',
      param: 'options.removeAgents',
      description:
        'Remove the managed block from AGENTS.md, CLAUDE.md, .claude/CLAUDE.md, .cursorrules, .hermes.md and HERMES.md ' +
        "(deleting AGENTS.md or .claude/CLAUDE.md when only init's heading is left) and do nothing else. " +
        '--features, --all, --agent and --agent-docs-path are refused; a file written with --agent-docs-path keeps its block',
    },
    {
      flag: '--user',
      param: 'options.user',
      description:
        'Write or refresh the computer-level agent text instead of setting up the folder: one skill file, ~/.agents/skills/astryx/SKILL.md, which most coding agents read, ' +
        'linked into the skill folders of agents that read only their own (~/.claude/skills always; Kiro, Windsurf, Letta, Xcode\'s coding assistant, and ~/.config/agents/skills when that folder exists): a folder symlink with a relative target, a junction on Windows, or a copy where neither can be made. Continue, whose scanner skips links, gets a managed copy, refreshed with the file. ' +
        "It tells agents anywhere on the computer that Astryx is there, when it is relevant, and to start with `astryx search`. " +
        'Records the links it made in astryx/settings.json in the per-user configuration folder, so removal removes exactly those; the CLI installed for the computer refreshes the file in the background after each upgrade. ' +
        'Works in any folder. A file without the Astryx markers, one edited since Astryx wrote it, or a symlink, is kept as it is, and so is anything at a link target that Astryx did not create. ' +
        'Warns, and still writes, when no `astryx` command on the computer runs the Astryx CLI. ' +
        'With --remove-agents it removes the file, the links, and the copy instead and records that the text is turned off. --features, --all, --agent and --agent-docs-path are refused',
    },
    {
      flag: '--agent <tool>',
      param: 'options.agent',
      choices: ['claude', 'cursor', 'codex', 'hermes', 'muse', 'all'],
      description:
        'Target AI tool for agent docs: claude (CLAUDE.md or .claude/CLAUDE.md, else creates .claude/CLAUDE.md), cursor (.cursorrules if present, else AGENTS.md), ' +
        'codex and muse (AGENTS.md), hermes (.hermes.md or HERMES.md if present, else AGENTS.md), all (every existing agent doc, else AGENTS.md and .claude/CLAUDE.md). ' +
        'An unknown tool exits 1 with ERR_UNKNOWN_AGENT. ' +
                'Used only when agent docs are installed (the default, --all, or --features agents); --agent-docs-path takes precedence.',
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
    {label: 'Agent text for the whole computer', cli: 'astryx init --user'},
    {label: 'Remove the computer-level agent text and turn it off', cli: 'astryx init --user --remove-agents'},
  ],
  outsideProject: 'own',
  exitCodes: [
    {
      code: 0,
      when: 'success, including agent docs that could not be written for a reason other than a path escape (reported as docsError)',
    },
    {
      code: 1,
            when: 'an unknown --agent (ERR_UNKNOWN_AGENT) or feature, an --agent-docs-path outside the project, --remove-agents combined with install options, --user combined with --features, --all, --agent or --agent-docs-path, or --all with --features (ERR_INVALID_ARGUMENT)',
    },
  ],
  related: ['doctor', 'upgrade', 'build', 'theme'],
  notes: [
    {
      type: 'prose',
      text: "In global mode: outside a project, init writes the agent docs (AGENTS.md) into the folder and prints no getting-started steps. `init --user` writes the agent guide for your computer, in any folder, and is never handed to a project's own CLI. In a project, the project's version of Astryx runs it, whichever astryx command you start. See {@link namespace:global} and {@link generic:computer-agent-guide}.",
    },
  ],
};
