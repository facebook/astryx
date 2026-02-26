# Distribution Strategy

> **Status: Partially implemented.** The CLI (`npx xds`) and npm package structure (`@xds/core`) exist today. Starter templates and recipe distribution are planned. The AI assistant rules section reflects the landscape as of early 2026 — this area is evolving rapidly.

*Exploration, January 2026*

## Context

Research into how to distribute various XDS artifacts: AI assistant skills/rules, code snippets, component recipes, and starter templates. Goal: make XDS easy to adopt across different tooling ecosystems.

---

## 1. AI Assistant Skills/Rules

> **Note (Feb 2026):** The AI coding assistant landscape has shifted significantly since this section was written. New tools, formats, and distribution mechanisms are emerging rapidly. The specific tools mentioned below (PRPM, Cursor rules format, Claude skills structure) may have changed. The general strategy — ship rules alongside the npm package — remains sound, but specific implementation details should be re-evaluated when this work begins.

How to distribute Cursor rules, Claude Code commands, and similar AI configurations.

| Method | How It Works | Pros | Cons |
|--------|--------------|------|------|
| **PRPM** | Package manager for Cursor rules via npm. `prpm install xds-rules` | Cross-platform (Cursor, Claude, Windsurf), versioned, CLI install | External dependency, community-run |
| **npm package** | Ship rules in npm package, postinstall copies to `.cursor/rules/` | Bundled with library, versioned with components | Manual setup, may conflict |
| **Repo distribution** | Include `.cursor/rules/` and `.claude/commands/` in XDS repo | Zero setup for monorepo users | Doesn't work for npm consumers |
| **Claude Code skills** | Ship skills in `~/.claude/skills/` structure | Auto-activating, trigger-based | Manual install, no package manager yet |

**Recommendation**: Ship rules/skills in npm package + provide PRPM package for standalone install.

---

## 2. Code Snippets/Templates

| Method | How It Works | Pros | Cons | Status |
|--------|--------------|------|------|--------|
| **VS Code extension** | Publish `.code-snippets` as extension | Auto-updates, marketplace discovery | Maintenance overhead, VS Code only | 🔮 Planned |
| **Repo snippets** | Include `.vscode/xds.code-snippets` in XDS repo | Zero config for repo users | Doesn't travel with npm package | 🔮 Planned |

**Recommendation**: Include snippets in repo, document manual copy for npm users.

---

## 3. Component Recipes (Composed Patterns)

| Method | How It Works | Pros | Cons | Status |
|--------|--------------|------|------|--------|
| **shadcn-style CLI** | `npx xds add form-with-validation` copies source to project | Full ownership, customizable, AI-friendly | Maintenance of CLI, versioning complexity | ✅ CLI exists (partial) |
| **npm subpackages** | `@xds/recipes` package with pre-composed patterns | Standard npm workflow | Less customizable, bundle size | 🔮 Planned |
| **Storybook recipes** | Document recipes in Storybook with copy button | Visual docs, no CLI needed | Manual copy-paste | 🔮 Planned |

**Recommendation**: shadcn-style CLI for recipes. See [[Swizzle Ergonomics]] for more on this philosophy.

---

## 4. Starter Templates

| Method | How It Works | Pros | Cons | Status |
|--------|--------------|------|------|--------|
| **`create-xds` CLI** | `npx create-xds my-app` scaffolds full project | Familiar pattern (CRA, Vite), batteries-included | Maintenance of templates | 🔮 Planned |
| **GitHub template repos** | "Use this template" button on GitHub | Zero tooling, GitHub-native | No customization prompts | 🔮 Planned |

**Recommendation**: `create-xds` CLI with prompts for variants (Next.js, Vite, etc.) + GitHub template repos as fallback.

---

## Distribution Channels

| Artifact | Primary Channel | Secondary Channel | Status |
|----------|-----------------|-------------------|--------|
| Components | npm (`@xds/core`) | — | ✅ Implemented |
| Recipes | CLI (`npx xds add`) | Docs site | ✅ CLI exists, recipes in progress |
| Starters | CLI (`npx create-xds`) | GitHub templates | 🔮 Planned |
| AI rules | npm + PRPM | Repo inclusion | 🔮 Planned |
| Snippets | Repo `.vscode/` | Docs (manual copy) | 🔮 Planned |

---

## Sources

- [PRPM: Package Manager for Cursor Rules](https://forum.cursor.com/t/prpm-a-package-manager-for-cursor-rules-1800-cursor-rules-installable-via-the-cli/139557)
- [shadcn/ui CLI Documentation](https://ui.shadcn.com/docs)
