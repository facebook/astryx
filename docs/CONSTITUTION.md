# JEDI Platform Constitution

The decision filter for every architectural choice in the JEDI Foundation Program.

## Principles

1. **Tokens before components** — The design language precedes UI. No component ships without token backing.

2. **Composition over configuration** — Build up from layout primitives. Do not configure wrappers around upstream code.

3. **Public APIs are contracts** — Breaking changes require deliberate governance, ADR documentation, and version consideration.

4. **Zero runtime Astryx dependencies** — Upstream is reference only. No `@astryxdesign/*` imports in any JEDI package.

5. **Documentation is part of the product** — Every capability ships with knowledge artifacts, not just code.

6. **Accessibility is non-negotiable** — Accessibility is designed in from the first interactive primitive, not bolted on at v1.0.

7. **Applications own business logic and editorial content** — Portfolio editorial components (FlagshipHero, EvidenceModule, etc.) never enter JEDI packages.

## Design Language ≠ Design System

- **Design Language** — Color, typography, spacing, elevation, motion (expressed through tokens).
- **Platform Foundation** — Tokens, themes, styling infrastructure.
- **Design System** — Components, patterns, documentation packages.
- **Applications** — Portfolio, docs, demos.

Tokens are the language the design system speaks. They are not the design system itself.

## Architecture Decision Rule

> **No architectural decision may be implemented without first identifying the capability it enables and the public API it affects.**

Order enforced:

```text
Capability → Architecture → API → Implementation
```

## Engineering Pillars

Every sprint must satisfy all three:

| Pillar | Question |
|--------|----------|
| Capability | Can JEDI do it? |
| Quality | Can JEDI do it reliably? |
| Knowledge | Can someone understand and extend it? |

## Upstream

> Astryx becomes a reference, never a requirement.

See [upstream/UPSTREAM.md](./upstream/UPSTREAM.md).
