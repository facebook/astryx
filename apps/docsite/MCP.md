# XDS MCP Server

The XDS docsite includes a [Model Context Protocol](https://modelcontextprotocol.io/) server that exposes component documentation, reference guides, templates, and code examples to AI agents.

## Connecting

Add XDS to your MCP client configuration:

### Claude Desktop / Cursor / Windsurf

```json
{
  "mcpServers": {
    "xds": {
      "url": "https://xds.vercel.app/mcp"
    }
  }
}
```

### VS Code (Copilot)

In `.vscode/mcp.json`:

```json
{
  "servers": {
    "xds": {
      "type": "http",
      "url": "https://xds.vercel.app/mcp"
    }
  }
}
```

## Available Tools

| Tool | Description |
|------|-------------|
| `list_components` | List all XDS components with optional group/search filtering |
| `get_component` | Full docs for a component — props, usage, theming, accessibility |
| `get_docs` | Reference documentation (spacing, color, typography, theming, etc.) |
| `list_templates` | Browse available page templates (dashboard, AI chat, settings, etc.) |
| `get_block_source` | TSX source for example blocks showing real component composition |
| `search` | Cross-resource search across components, docs, templates, and blocks |

## Examples

Ask your AI assistant:

- "What props does XDSButton accept?"
- "Show me how to use Dialog with a form"
- "What spacing tokens are available?"
- "Find a template for a dashboard layout"
- "Show me examples of Table with sorting"

## Comparison with XDS CLI

The MCP server provides **read-only access** to the same data the CLI uses.

| Feature | CLI | MCP |
|---------|-----|-----|
| Component docs | ✅ | ✅ |
| Props / usage / theming | ✅ | ✅ |
| Reference docs | ✅ | ✅ |
| Templates & blocks | ✅ | ✅ |
| Code search (source) | ✅ | ✅ (via `get_component` with `section: 'source'` planned) |
| Scaffolding (copy template) | ✅ | ❌ |
| Codemods (migrations) | ✅ | ❌ |
| Package discovery | ✅ | ❌ (needs local project context) |
| Works without install | ❌ | ✅ |
| Works in Cursor/Windsurf | Via terminal | ✅ Native |
| Works offline | ✅ | ❌ |

## Development

The MCP server is a Next.js route handler in `src/app/[transport]/route.ts`. It reads from the same generated registries the docsite UI uses — data is extracted at build time from `.doc.mjs` files across the monorepo.

To run locally:

```bash
cd apps/docsite
yarn dev
# MCP endpoint: http://localhost:3000/mcp
```
