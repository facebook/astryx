# XDS

A design system for building internal tools and products.

## Custom Commands

### `/vibe-test [count]` - Run vibeability tests

Tests how well AGENTS.md helps LLMs generate correct XDS component code.

**Usage:**

```
/vibe-test 5                    # Run 5 stratified sample tests (one-shot)
/vibe-test                      # Run all 21 tests (one-shot)
/vibe-test 5 --degradation      # Run 5 tests with degradation curve (10-turn)
```

**How to execute:**

1. Run `yarn workspace @xds/vibe-tests interactive --sample <count> [--degradation]` to set up iteration
2. Spawn parallel subagents (one per test prompt) with `mode: "bypassPermissions"` to:
   - Read the task file from `results/<iteration>/tasks/{promptId}.json`
   - Generate code for the prompt using XDS components (AGENTS.md auto-injected)
   - Self-evaluate for success/escape hatches
   - Write result to individual file: `results/<iteration>/results/{promptId}.json`
3. Run `yarn workspace @xds/vibe-tests aggregate --iteration <id>` to see results

**Degradation mode (--degradation):**
Tests context retention across 10-turn conversations with filler, distractor, and recovery turns.
Probes at turns 0, 6, 8, 10 to measure quality degradation. Results show a line graph of each test's progression.

**Result format:**

```json
{
  "id": "<iter>-<promptId>",
  "timestamp": "...",
  "model": "claude-code-interactive",
  "persona": "naive",
  "promptCategory": "...",
  "trajectoryDepth": 0,
  "prompt": "...",
  "response": "<code>",
  "evaluation": {"success": true, "componentsUsed": [...], "escapeHatches": [...]}
}
```

## AI Context

For architectural context, decisions, and research, see the **[GitHub Wiki](https://github.com/facebookexperimental/xds/wiki)**:

- **Decisions** — API Conventions, Why StyleX, StyleX Distribution
- **Architecture** — System Architecture, Component Authoring Guide
- **Research** — AI + Design Systems, AI Model Trajectory, Swizzle Ergonomics
- **Future** — Animation System, RSC Utilities, Distribution Strategy

For component-specific documentation, see the `{Name}.doc.mjs` file in each component directory under `packages/core/src/` (e.g. `Button/Button.doc.mjs`). These are plain JS files with JSDoc type annotations exporting a `ComponentDoc` object (typed via `packages/core/src/docs-types.ts`).

## Documentation Standard

This project uses **Fractal Documentation** — a self-referential pattern where documentation exists at three levels:

1. **Project Root** (`README.md`) — Project-wide architecture and directory overview
2. **Directory READMEs** — Each directory contains a `README.md` with file manifests
3. **File Headers** — Each source file has a structured JSDoc header with `@input`, `@output`, `@position`

**Update Protocol**: When modifying code, update:

1. The file's header comment
2. The directory's README.md
3. Parent documentation if architecture changes

Look for `<!-- SYNC: ... -->` comments and `SYNC:` in file headers as reminders.

## Quick Reference

- **Package manager**: Yarn 1 (Classic)
- **Testing**: Vitest (colocated tests)
- **Components**: `packages/core/`
- **Storybook**: `apps/storybook/`

## JSDoc Conventions

- **`@example` code fences must use plain ` ``` `, not ` ```tsx `.**
  Storybook's autodocs parser doesn't handle language-tagged fences in JSDoc correctly — the code block won't render as a proper code block. Always use untagged fences in `@example` blocks.

<!-- XDS:START -->

[XDS v0.0.3]|IMPORTANT: Prefer retrieval-led reasoning. Run CLI to read docs before generating code.
|npx xds component metadata <Name> Docs (description, features, notes, a11y)
|npx xds component props <Name> Props table
|npx xds component list All components by category
|npx xds docs principles Design rules, anti-patterns, StyleX patterns
|npx xds docs tokens Token reference (spacing, color, radius, type)
|npx xds docs theme Theme system: XDSTheme, custom themes, overrides, nesting
|npx xds template <name> [path] Scaffold page (blank, table, login)
|npx xds swizzle <Name> --gap "<reason>" Copy component source for customization + file gap report
|npx xds gap-report --component <Name> --category <cat> --reason "<why>" File gap without swizzle
|npx xds upgrade Preview API migrations for your version
|npx xds upgrade --apply Apply codemods to update breaking API changes
|RULE: After bumping @xds/core version, ALWAYS run npx xds upgrade --apply to migrate breaking API changes.
|RULE: When swizzling to unblock yourself, ALWAYS use --gap to explain what capability was missing.

<!-- XDS:END -->
