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
          text: 'Tell your AI to install the CLI and set itself up:',
        },
        {
          type: 'code',
          lang: 'text',
          label: 'Paste this into your AI',
          code: 'Install @xds/cli and run `npx xds agent-docs` to set up your XDS context. Read the generated file.',
        },
        {
          type: 'prose',
          text: 'That\'s it. The agent-docs command generates everything your AI needs \u2014 component index, behavioral rules, CLI reference \u2014 pulled from your installed version. After a version bump, run it again to update in place.',
        },
        {
          type: 'prose',
          text: 'If you prefer to target a specific file format:',
        },
        {
          type: 'code',
          lang: 'bash',
          label: 'Manual options',
          code: `npx xds agent-docs --agent claude    # CLAUDE.md
npx xds agent-docs --agent cursor    # .cursorrules
npx xds agent-docs --agent codex     # AGENTS.md (Copilot, Codex, etc.)`,
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
          text: 'Paste this into your AI before writing any XDS code. These three questions have a 0% pass rate without docs \u2014 models confidently guess wrong on all of them. If your AI can\'t answer them, it\'ll know to install the agent docs first.',
        },
        {
          type: 'code',
          lang: 'text',
          label: 'Paste this into your AI',
          code: `Before writing any XDS code, check your knowledge:

1. What is the correct import path for XDSButton?
2. How do you make an XDSDialog non-dismissible?
3. What prop does XDSSelector use for its items?

If you don't know all three, run \`npx xds init --features agents\` to generate agent docs, then read the generated file.`,
        },
      ],
    },
    {
      title: 'The npm run xds Pattern',
      content: [
        {
          type: 'prose',
          text: 'AI agents frequently invoke the CLI with incorrect paths (e.g. node_modules/@xds/cli/bin/docs.mjs instead of xds.mjs), leading to silent failures. Adding an npm script alias with the correct path eliminates this entirely.',
        },
        {
          type: 'code',
          lang: 'json',
          label: 'package.json',
          code: `"scripts": {
  "xds": "node node_modules/@xds/cli/bin/xds.mjs"
}`,
        },
        {
          type: 'prose',
          text: 'With this alias, agents use `npm run xds -- component --list` instead of guessing the binary path. The `--` separator is standard npm convention for passing flags to scripts.',
        },
        {
          type: 'code',
          lang: 'bash',
          label: 'Reliable CLI invocation',
          code: `npm run xds -- component --list
npm run xds -- component Dialog --dense
npm run xds -- docs styling --dense
npm run xds -- docs tokens --dense`,
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
