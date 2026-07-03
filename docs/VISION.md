# JEDI

JEDI is a modern React platform for documentation-heavy, information-dense applications.

Its purpose is to provide a stable foundation for products that prioritize knowledge, structure, accessibility, and long-term maintainability.

## Core principles

- **Platform, not application** — JEDI ships infrastructure; applications own content and storytelling.
- **Public APIs over implementation details** — Consumers import `@jedi/*`; never `@jedi/internal/*` or upstream packages directly.
- **Composition over configuration** — Prefer composable primitives over monolithic page components.
- **Documentation-first** — Platforms that cannot be documented cannot be adopted.
- **Accessibility by default** — Not a feature flag; baked into components and tokens.
- **Token-driven** — Visual decisions flow through `@jedi/tokens` and `@jedi/themes`.
- **Replaceable foundations** — Upstream dependencies (Astryx) are JEDI-internal; applications depend only on JEDI.

## Decision lens

When unsure whether something belongs in JEDI or in an application, ask:

> **Does this make JEDI a better platform?**

If yes → JEDI.

> **Does this only make one application better?**

If yes → the application.

## Relationship to the ecosystem

JEDI is the **software platform** layer. It does not own professional experience, employer case studies, or publication content.

| Concept            | Role                                                                             |
| ------------------ | -------------------------------------------------------------------------------- |
| **Experience**     | Projects, leadership, research, continuous learning — raw source material        |
| **Principles**     | Synthesis lens (not a product) — token-driven systems, governance, accessibility |
| **JEDI**           | UI platform — _how do I build software?_                                         |
| **The UX Company** | Publication — _how do I communicate and explore ideas?_                          |
| **Portfolio**      | Convergence point — reference application consuming JEDI                         |
| **Astryx**         | Upstream foundation (JEDI-internal)                                              |

Experience synthesizes into Principles. Principles inform JEDI and The UX Company as siblings. The portfolio is where they meet. Applications consume JEDI — never upstream packages directly.

## v0.1 success criteria

JEDI v0.1 is complete when:

- [ ] Applications import **only** `@jedi/*` public APIs
- [ ] No application imports `@astryxdesign/*`
- [ ] Theme switching works through JEDI
- [ ] Tokens flow through JEDI
- [ ] JEDI versions independently (semver `0.1.x`)
- [ ] A second demo application could be created without changing JEDI internals
- [ ] Public APIs are documented and stable within the `0.1.x` series

See [docs/adrs/](adrs/) for platform architecture decisions.
