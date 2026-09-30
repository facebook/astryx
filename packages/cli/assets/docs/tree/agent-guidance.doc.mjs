// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file `astryx docs cli/integrations/agent-guidance`: add short lines of
 * guidance that apps put in front of their AI agents, within the limits.
 */

/** @type {import('@astryxdesign/cli/authoring').ReferenceDoc} */
export const docs = {
  type: 'generic',
  name: 'agent-guidance',
  placement: {parent: 'namespace:contribute', slot: 'guides', order: 60},
  title: 'Agent guidance',
  category: 'guide',
  keywords: ['agent docs', 'agents.md'],
  description:
    'Add a few lines of guidance that apps put in front of the AI agents working in their code.',
  sections: [
    {
      id: 'add-a-guidance-line',
      title: 'Add a line of guidance',
      content: [
        {
          type: 'prose',
          text: '`integration add agent-doc` adds one line for AI agents that work in apps using your package. Apps show it in their agent file, such as `AGENTS.md`.',
        },
        {
          type: 'code',
          lang: 'bash',
          code: "npx astryx integration add agent-doc 'Use AcmeCarousel for rotating content.'",
        },
        {
          type: 'prose',
          text: 'The line lands in `agentDocs.append` in your manifest:',
        },
        {
          type: 'code',
          lang: 'js',
          code: `// astryx.integration.mjs
export default {
  components: './components',
  agentDocs: {
    append: ['Use AcmeCarousel for rotating content.'],
  },
};`,
        },
        {
          type: 'prose',
          text: 'Adding the same line again changes nothing. To reword or remove a line, edit `agentDocs.append` by hand.',
        },
      ],
    },
    {
      id: 'keep-within-the-limits',
      title: 'Keep within the limits',
      content: [
        {
          type: 'prose',
          text: "Every line costs space in each app's agent file, so the CLI keeps guidance short and few. Put detail in your docs instead.",
        },
        {
          type: 'table',
          headers: ['Limit', 'What happens past it'],
          rows: [
            [
              '8 lines per package',
              '`integration add` fails: `append may contain at most 8 lines`.',
            ],
            [
              '240 characters per line',
              '`integration add` fails: `must contain at most 240 Unicode code points`.',
            ],
            [
              '32 lines per app, from all its packages',
              '`init` writes no agent block and prints `Could not install agent docs.`',
            ],
          ],
        },
        {
          type: 'prose',
          text: 'A line is one line of plain text. Line breaks, control characters, spaces at either end, and managed-block markers such as `<!-- ASTRYX:START -->` are rejected.',
        },
      ],
    },
    {
      id: 'see-what-agents-read',
      title: 'See what agents read',
      content: [
        {
          type: 'prose',
          text: "An app's `astryx init` writes your lines at the end of its managed agent block, each labeled with your package name. The CLI owns the heading, the labels, and the markers.",
        },
        {
          type: 'code',
          lang: 'bash',
          code: 'npx astryx init --features agents',
        },
        {
          type: 'code',
          lang: 'text',
          code: `INTEGRATIONS:
- \`@acme/astryx-widgets\`: Use AcmeCarousel for rotating content.
<!-- ASTRYX:END -->`,
        },
        {
          type: 'prose',
          text: 'The block collects lines from every integration the app has installed, with or without an `astryx.config` entry.',
        },
      ],
    },
    {
      id: 'refresh-the-block',
      title: 'Refresh the block in an app',
      content: [
        {
          type: 'prose',
          text: 'The block changes only when the app runs `init`, or `upgrade --from <version> --apply`. After an app installs a version of your package with new lines, it runs one of them.',
        },
        {
          type: 'code',
          lang: 'bash',
          code: `npx astryx init --features agents
# Or: --from takes the Core version the app had before
npx astryx upgrade --from 0.7.0 --apply`,
        },
        {
          type: 'code',
          lang: 'text',
          code: '[ok] Agent docs refreshed -> AGENTS.md',
        },
        {
          type: 'prose',
          text: '`upgrade --apply` prints that line; `init` prints `[ok] AI agent docs installed -> AGENTS.md`. Without `--apply`, `upgrade` only reports `Agent docs differ from the installed Astryx and integration configuration.` It refreshes the block even when Core did not change. See {@link command:upgrade}.',
        },
      ],
    },
  ],
};
