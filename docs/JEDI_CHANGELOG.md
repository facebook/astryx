# JEDI Changelog

Public package identity: `@jedi/*`. GitHub Packages distribution: `@jon4ohio/jedi-*`.

## 0.1.0 — 2026-07-03

### Added

- `@jedi/core` — `JediProviders`, theme mode resolution (dark → gothic, light → neutral)
- `@jedi/react` — Button, Badge, Link, Card, TopNav, Switch, Breadcrumbs re-exports
- `@jedi/themes` — reset, base, gothic, neutral CSS entrypoints
- `@jedi/tokens` — compatibility bridge (`--bg`, `--fg`, etc. → Astryx tokens)
- `docs/VISION.md`, `docs/PUBLIC_API.md`, JEDI ADRs 001–003
- GitHub Packages publish workflow (`.github/workflows/jedi-publish.yml`)

### Notes

- First public release for Portfolio V2.0 preservation-first migration.
- Consumers install via npm aliases: `"@jedi/core": "npm:@jon4ohio/jedi-core@0.1.0"`.
