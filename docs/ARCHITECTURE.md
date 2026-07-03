# JEDI Platform Architecture

Architecture is **frozen**. Changes require a new ADR.

## Layer Model

```text
Design Language        →  @jedi/tokens
Platform Foundation    →  @jedi/themes, @jedi/stylex, @jedi/motion, @jedi/a11y
Design System          →  @jedi/foundation, @jedi/react, @jedi/icons, @jedi/patterns, @jedi/docs
Applications           →  apps/examples, apps/docs-app, apps/playground
```

## Allowed Dependency Graph

The boundary checker enforces this graph. The graph is defined here — not inferred from the checker.

```text
@jedi/tokens
        ↓
@jedi/themes    @jedi/stylex    @jedi/motion    @jedi/a11y
        ↓
@jedi/foundation
        ↓
@jedi/react        ← @jedi/icons
        ↓
@jedi/patterns
        ↓
@jedi/docs
```

### Allowed `@jedi/*` dependencies per package

| Package | May depend on |
|---------|---------------|
| `@jedi/tokens` | — |
| `@jedi/themes` | `tokens` |
| `@jedi/stylex` | `tokens` |
| `@jedi/motion` | `tokens` |
| `@jedi/a11y` | `tokens` |
| `@jedi/foundation` | `stylex`, `tokens` |
| `@jedi/icons` | — |
| `@jedi/react` | `foundation`, `icons`, `stylex`, `tokens` |
| `@jedi/patterns` | `foundation`, `react`, `stylex` |
| `@jedi/docs` | `foundation`, `react`, `stylex`, `tokens` |

### Rules

- No backward edges (e.g. `tokens` must not import `foundation`)
- No circular `@jedi/*` dependency chains
- `@jedi/icons` may only be consumed by `@jedi/react`
- No `@astryxdesign/*` runtime dependencies in any package
- Each package exports only its own public capability (no re-exporting sibling package internals)

## Public API Rule

Every package's entry point (`src/index.ts` or `src/index.tsx`) exports only that package's capability.

| Package | Public surface |
|---------|----------------|
| `@jedi/tokens` | Token tiers, CSS var generation, theme contracts |
| `@jedi/themes` | Theme creation, application, mode toggle |
| `@jedi/stylex` | Styling helpers, tokenVar, design token shortcuts |
| `@jedi/foundation` | Layout primitives (Box, Flex, Stack, Grid, Surface) |
| `@jedi/react` | Interactive components; icon re-exports for composite DX |
| `@jedi/icons` | SVG icon components |
| `@jedi/patterns` | Application layout patterns |
| `@jedi/docs` | Documentation components (TokenViewer uses tokens internally — not re-exported) |
| `@jedi/a11y` | Accessibility utilities |
| `@jedi/motion` | Motion tokens and keyframes |

## Enforcement

```bash
node internal/check-boundaries.mjs
```

## References

- [CONSTITUTION.md](./CONSTITUTION.md)
- [ADR-001-token-architecture.md](./adrs/ADR-001-token-architecture.md)
- [ADR-002-layer-boundaries.md](./adrs/ADR-002-layer-boundaries.md)
- [LIFECYCLE.md](./LIFECYCLE.md)
