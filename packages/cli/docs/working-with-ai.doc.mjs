/** @type {import('../../core/src/docs-types').ReferenceDoc} */

export const docs = {
  name: 'working-with-ai',
  title: 'Working with AI',
  category: 'guide',
  description:
    'How to set up AI coding tools to generate correct XDS component code.',

  sections: [
    {
      title: 'Overview',
      content: [
        {
          type: 'prose',
          text: 'XDS is designed to be AI-friendly \u2014 consistent naming, predictable prop patterns, and a CLI that feeds structured documentation directly into AI context windows. But models still need the right context to avoid falling back to generic React patterns or inventing props.',
        },
        {
          type: 'prose',
          text: 'The XDS CLI includes a built-in agent docs system that generates context files for your AI tool of choice. One command sets up everything your AI needs to write correct XDS code.',
        },
      ],
    },
    {
      title: 'Quick Start',
      content: [
        {
          type: 'prose',
          text: 'Install the CLI and run init. It generates an AGENTS.md (or CLAUDE.md, .cursorrules) with a compressed component index, behavioral rules, and CLI reference \u2014 all pulled from your installed version.',
        },
        {
          type: 'code',
          lang: 'bash',
          label: 'Set up agent context',
          code: `# Interactive setup \u2014 picks your AI tool
npx xds init

# Or target a specific tool directly
npx xds agent-docs --agent claude    # CLAUDE.md
npx xds agent-docs --agent cursor    # .cursorrules
npx xds agent-docs --agent codex     # AGENTS.md (Copilot, Codex, etc.)
npx xds agent-docs --agent all       # all detected files`,
        },
        {
          type: 'prose',
          text: 'After a version bump, run `npx xds agent-docs` again to update the generated block in place.',
        },
      ],
    },
    {
      title: 'What Gets Generated',
      content: [
        {
          type: 'prose',
          text: 'The generated context teaches your AI a 3-step workflow before writing any UI code:',
        },
        {
          type: 'list',
          style: 'ordered',
          items: [
            '`npx xds template --list` \u2014 find a related page pattern to use as reference',
            '`npx xds template <name> --skeleton` \u2014 study the layout structure',
            '`npx xds component <Name>` \u2014 read props and examples for every component used',
          ],
        },
        {
          type: 'prose',
          text: 'It also includes rules that prevent common mistakes (no raw divs, no style={{}}, use tokens not magic values) and a CLI quick reference. After setup, you shouldn\'t need to manually correct your AI on XDS conventions \u2014 the agent docs handle it at the system level.',
        },
      ],
    },
    {
      title: 'Cursor Setup',
      content: [
        {
          type: 'prose',
          text: 'Cursor project rules aren\'t always picked up \u2014 it selects which rules to apply based on relevance. For reliable inclusion, install XDS context as a User Rule instead. User Rules live at ~/.cursor/rules/ and apply across all projects.',
        },
        {
          type: 'code',
          lang: 'bash',
          label: 'Install as a Cursor user rule',
          code: `mkdir -p ~/.cursor/rules
npx xds agent-docs --agent-docs-path ~/.cursor/rules/xds.mdc`,
        },
      ],
    },
    {
      title: 'Checking Your Setup',
      content: [
        {
          type: 'prose',
          text: 'Paste this prompt into your AI to verify it has XDS context loaded and can self-correct:',
        },
        {
          type: 'code',
          lang: 'text',
          label: 'Diagnostic prompt',
          code: `Run \`npx xds component Button --props\` and compare the output to your knowledge of XDS. Are you aware of the XDS design system conventions? If not, run \`npx xds agent-docs\` to install context, then read the generated file.`,
        },
        {
          type: 'prose',
          text: 'A properly configured AI will already know the conventions and confirm them against the CLI output. An unconfigured one will discover the gap and fix itself by running the install command.',
        },
      ],
    },
    {
      title: 'The --dense Flag',
      content: [
        {
          type: 'prose',
          text: 'Every CLI command supports --dense, which outputs a token-efficient format designed for AI context windows. Use it when pasting CLI output into a web-based AI tool like ChatGPT or Claude.',
        },
        {
          type: 'code',
          lang: 'bash',
          label: 'Dense output for pasting into AI conversations',
          code: `npx xds component Dialog --dense
npx xds docs styling --dense
npx xds docs tokens --dense`,
        },
      ],
    },
  ],
};
