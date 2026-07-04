# JEDI Foundation Program

A capability-driven design platform — not an Astryx derivative.

## Architecture

```
Design Language → Platform Foundation → Design System → Applications
```

## Packages

| Package | Capability |
|---------|------------|
| `@jedi/tokens` | Design Language |
| `@jedi/themes` | Theme Engine |
| `@jedi/stylex` | Styling Infrastructure (StyleX) |
| `@jedi/foundation` | Layout System |
| `@jedi/react` | Interactive Components |
| `@jedi/icons` | Icons |
| `@jedi/patterns` | Application Patterns |
| `@jedi/docs` | Documentation Components |
| `@jedi/a11y` | Accessibility |
| `@jedi/motion` | Motion |

## Development

```bash
pnpm install
pnpm verify    # test + build + boundaries + metrics
pnpm dev:examples
```

## Governance

- [CONSTITUTION.md](./docs/CONSTITUTION.md)
- [ARCHITECTURE.md](./docs/ARCHITECTURE.md)
- [ARCHITECTURE-FREEZE.md](./docs/ARCHITECTURE-FREEZE.md)
- [PLATFORM-HEALTH.md](./docs/PLATFORM-HEALTH.md)
- [APPS.md](./docs/APPS.md)
- [LIFECYCLE.md](./docs/LIFECYCLE.md)
- [CAPABILITY-MATRIX.md](./docs/CAPABILITY-MATRIX.md)
- [ACCEPTANCE.md](./docs/ACCEPTANCE.md)
- [UPSTREAM.md](./docs/upstream/UPSTREAM.md)

## Branch Strategy

- `legacy-wrapper` — frozen Astryx wrapper era
- `foundation-program` — active platform development
