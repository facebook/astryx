// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file `astryx docs work-with-agents`: set up coding agents so they use Astryx the way its docs describe.
 */

/** @type {import('@astryxdesign/cli/authoring').NamespaceDoc} */
export const docs = {
  type: 'namespace',
  name: 'work-with-agents',
  title: 'Work with agents',
  summary: 'Make coding agents build with Astryx correctly.',
  keywords: [
    'agent',
    'AI',
    'AGENTS.md',
    'CLAUDE.md',
    'agent docs',
    'skill',
    'prompt',
  ],
  slots: {
    guides: {
      title: 'Guides',
      accepts: {
        kinds: ['generic', 'namespace'],
      },
    },
  },
  blocks: [
    {
      type: 'prose',
      text: '`astryx init` writes a short block into AGENTS.md or CLAUDE.md: the CSS setup, the build → template → component workflow, and the rules an agent follows. {@link generic:agent-setup} covers each tool, MCP, and short output; {@link generic:computer-agent-guide} covers the one skill file for every agent on a computer.',
    },
    {
      type: 'prose',
      text: 'An agent then runs `astryx build "<idea>"` for a starting template and `astryx component <Name> --dense` before it edits a component.',
    },
  ],
};
