# XDS

A design system for building internal tools and products.

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
- **Monorepo tool**: Turborepo
- **Testing**: Vitest (colocated tests)
- **Components**: `packages/core/`
- **Storybook**: `apps/storybook/`
