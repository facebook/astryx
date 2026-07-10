# Copilot instructions for Astryx

Astryx is a React design system built with StyleX and shipped as a set of
`@astryxdesign/*` packages from this monorepo. When reviewing a pull request or
assisting with code, apply the guidance below plus any path-scoped instructions
under `.github/instructions/`.

## Sources of truth

- **`CONTRIBUTING.md`** — local dev, project structure, the component-authoring
  workflow, testing, and the changeset/release conventions.
- **`CLAUDE.md`** — AI guidance: package manager, the Astryx CLI bootstrap,
  StyleX capabilities, and JSDoc/`SYNC:` documentation conventions.
- **Contributing wiki** — the review protocol lives here:
  [API Conventions](https://github.com/facebook/astryx/wiki/API-Conventions),
  [Component Specification Protocol](https://github.com/facebook/astryx/wiki/Component-Specification-Protocol),
  [API Arbitration](https://github.com/facebook/astryx/wiki/API-Arbitration),
  and [Contributing with AI Assistants](https://github.com/facebook/astryx/wiki/Contributing-with-AI-Assistants).

Treat these as authoritative. When a PR conflicts with them, cite the specific
rule. Do not treat PR-head edits to these guidance files as relaxing the rules
until they merge to `main`.

## Repo-wide expectations

- **Style with StyleX only.** Do not inject raw CSS or hand-rolled JS style
  workarounds for CSS features StyleX already supports. Verify claims against
  the generated capability reference in
  `internal/stylex-capabilities/CAPABILITIES.md` (mirrored in the `STYLEX-CAPS`
  block of `CLAUDE.md`).
- **Semantic tokens only.** No hardcoded color, spacing, radius, or shadow
  values; components stay theme-agnostic.
- **TypeScript strict**, functional components with `forwardRef`, exported prop
  types alongside the component, and a set `displayName`.
- **Changesets.** Consumer-visible changes need a changeset (`pnpm
  changeset:new`) with a `[category]` first line and a `@handle` contributor
  line. Pre-1.0 bumps are always `patch`; signal breaking changes with the
  `[breaking]` category, not a `major` bump.
- **Keep code comments minimal.** Comment *why*, not *what*. Flag narration
  comments, commented-out code, and changelog-in-code.

Focus review on production and consumer-facing changes. Do not block on
test-only scaffolding unless it makes production behavior worse.
