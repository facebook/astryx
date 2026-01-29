# XDS

A design system for building internal tools and products.

## Custom Commands

### `/vibe-test [count]` - Run vibeability tests

Tests how well the AI skill doc helps generate correct XDS component code.

**Usage:**

```
/vibe-test 5      # Run 5 stratified sample tests
/vibe-test        # Run all 21 tests
```

**How to execute:**

1. Run `yarn workspace @xds/vibe-tests interactive --sample <count>` to set up iteration
2. Spawn parallel subagents (one per test prompt) to:
   - Read the skill doc at `packages/core/xds.md`
   - Generate code for the prompt using XDS components
   - Self-evaluate for success/escape hatches
   - Append result to `results/<iteration>/runs.jsonl`
3. Run `yarn workspace @xds/vibe-tests aggregate --iteration <id>` to see results

**Result format in runs.jsonl:**

```json
{"id":"<iter>-<promptId>","timestamp":"...","model":"claude-code-interactive","persona":"naive","promptCategory":"...","prompt":"...","response":"<code>","evaluation":{"success":true,"componentsUsed":[...],"escapeHatches":[...]}}
```

## AI Context

For architectural context and decisions, see `.context/`:

- `.context/decisions/` — Architecture Decision Records
- `.context/explorations/` — Research and brainstorms
- `.context/proposals/` — Feature proposals

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
