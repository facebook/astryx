// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @type {import('../../core/src/docs-types').ReferenceDoc} */

export const docs = {
  name: 'working-with-ai',
  title: 'Working with AI',
  category: 'guide',
  description:
    'How to set up AI coding tools to generate correct component code.',

  sections: [
    {
      title: 'Overview',
      content: [
        {
          type: 'prose',
          text: 'The design system is built to be AI-friendly: consistent naming, predictable prop patterns, and a CLI that feeds structured documentation directly into AI context windows. But models still need the right context to avoid falling back to generic React patterns or inventing props.',
        },
        {
          type: 'prose',
          text: 'The CLI includes a built-in agent docs system that generates context files for your AI tool of choice. One command sets up everything your AI needs to write correct component code.',
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
          code: 'Install @astryxdesign/cli and run `npx @astryxdesign/cli init --features agents` to set up your Astryx context. Read the generated file.',
        },
        {
          type: 'prose',
          text: 'That\'s it. The `init --features agents` command generates everything your AI needs (component index, behavioral rules, CLI reference) pulled from your installed version. After a version bump, run it again to update in place.',
        },
        {
          type: 'prose',
          text: 'By default this creates `AGENTS.md` (the tool-agnostic standard most agents read). To target a specific tool\'s file instead:',
        },
        {
          type: 'code',
          lang: 'bash',
          label: 'Manual options',
          code: `npx @astryxdesign/cli init --features agents --agent claude    # .claude/CLAUDE.md
npx @astryxdesign/cli init --features agents --agent cursor    # .cursorrules
npx @astryxdesign/cli init --features agents --agent codex     # AGENTS.md (Copilot, Codex, etc.)`,
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
            '`astryx template --list`: find a related page pattern to use as reference',
            '`astryx template <name> --skeleton`: study the layout structure',
            '`astryx component <Name>`: read props and examples for every component used',
          ],
        },
        {
          type: 'prose',
          text: 'It also includes rules that prevent common mistakes (no raw divs, no style={{}}, use tokens not magic values) and a CLI quick reference. After setup, you shouldn\'t need to manually correct your AI on these conventions; the agent docs handle it at the system level.',
        },
      ],
    },
    {
      title: 'Cursor Setup',
      content: [
        {
          type: 'prose',
          text: 'Cursor project rules aren\'t always picked up; it selects which rules to apply based on relevance. For reliable inclusion, install the design system context as a User Rule instead. User Rules live at ~/.cursor/rules/ and apply across all projects.',
        },
        {
          type: 'code',
          lang: 'bash',
          label: 'Install as a Cursor user rule',
          code: `mkdir -p ~/.cursor/rules
npx @astryxdesign/cli init --features agents --agent-docs-path ~/.cursor/rules/xds.mdc`,
        },
      ],
    },
    {
      title: 'Checking Your Setup',
      content: [
        {
          type: 'prose',
          text: 'Paste this into your AI before writing any component code. These three questions have a 0% pass rate without docs; models confidently guess wrong on all of them. If your AI can\'t answer them, it\'ll know to install the agent docs first.',
        },
        {
          type: 'code',
          lang: 'text',
          label: 'Paste this into your AI',
          code: `Before writing any Astryx code, check your knowledge:

1. What is the correct import path for Button?
2. How do you make an Dialog non-dismissible?
3. What prop does Selector use for its items?

If you don't know all three, run \`npx @astryxdesign/cli init --features agents\` to generate agent docs, then read the generated file.`,
        },
      ],
    },
    {
      title: 'The astryx Pattern',
      content: [
        {
          type: 'prose',
          text: 'AI agents frequently invoke the CLI with incorrect paths (e.g. node_modules/@astryxdesign/cli/bin/docs.mjs instead of astryx.mjs), leading to silent failures. Adding an npm script alias with the correct path eliminates this entirely.',
        },
        {
          type: 'code',
          lang: 'json',
          label: 'package.json',
          code: `"scripts": {
  "astryx": "node node_modules/@astryxdesign/cli/bin/astryx.mjs"
}`,
        },
        {
          type: 'prose',
          text: 'With this alias, agents use `astryx component --list` instead of guessing the binary path. The `--` separator is standard npm convention for passing flags to scripts.',
        },
        {
          type: 'code',
          lang: 'bash',
          label: 'Reliable CLI invocation',
          code: `astryx component --list
astryx component Dialog --dense
astryx docs styling --dense
astryx docs tokens --dense`,
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
          code: `astryx component Dialog --dense
astryx docs styling --dense
astryx docs tokens --dense`,
        },
      ],
    },
    {
      title: 'MCP Server',
      content: [
        {
          type: 'prose',
          text: 'Astryx ships a Model Context Protocol (MCP) server that any MCP-compatible AI tool can connect to. Instead of manually pasting CLI output, the AI can query the Astryx design system directly, searching for components, reading full documentation, and pulling code examples on demand.',
        },
        {
          type: 'prose',
          text: 'The MCP server exposes two tools: search(query) for discovering components, doc topics, and templates; and get(name) for retrieving full documentation with props, usage, and examples.',
        },
        {
          type: 'prose',
          text: 'Add the server to your MCP config file. This works with any MCP-compatible tool: Claude Desktop (claude_desktop_config.json), Cursor (.cursor/mcp.json), Windsurf (.windsurf/mcp.json), Cline, and others.',
        },
        {
          type: 'code',
          lang: 'json',
          label: 'MCP config (same for all tools)',
          code: `{
  "mcpServers": {
    "xds": {
      "type": "url",
      "url": "https://astryx.atmeta.com/mcp"
    }
  }
}`,
        },
        {
          type: 'prose',
          text: 'Once connected, your AI tool can search for components by natural language (e.g. "dropdown menu", "success message") and retrieve full documentation without any manual CLI invocation. The server uses the same keyword index from component docs, so search quality improves automatically as component documentation is updated.',
        },
      ],
    },
  ],
};
