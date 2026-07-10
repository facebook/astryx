---
applyTo: "packages/**"
---

# Package review instructions

These paths ship as published `@astryxdesign/*` packages, so review them
against Astryx's API guidance and component review protocol.

## API guidance (the review protocol)

The authoritative rules live in the Contributing wiki — apply them and cite the
specific rule when something conflicts:

- **[API Conventions](https://github.com/facebook/astryx/wiki/API-Conventions)** —
  naming (`<Namespace><Variant><Type><Postfixes>`, unprefixed: `Button`, not
  `AstryxButton`), prop patterns, and composition rules. Key principles to
  enforce:
  - **Guidance over enforcement** — components provide capability, not design
    guardrails; if a consumer passes a prop value, render it.
  - **Prop independence** — one prop must not suppress another prop's output;
    variants affect styling, never whether sibling props appear (narrow physical
    exceptions like `isTruncated`/`maxLines`).
  - **Orthogonal axes** — each prop controls one dimension of variation; if you
    can't name the axis without describing a use case, it's a design recipe, not
    a primitive.
  - **Composition vs config** — utility primitives may expose granular knobs;
    high-level compositions (`AppShell`, `Table`, `CommandPalette`) customize
    through composition (slots, children, render props), not prop explosion.
  - **Match existing siblings** — mirror the API shape of comparable components;
    don't invent a new convention when one already exists.
- **[Component Specification Protocol](https://github.com/facebook/astryx/wiki/Component-Specification-Protocol)** —
  the process new components must follow.
- **[API Arbitration](https://github.com/facebook/astryx/wiki/API-Arbitration)** —
  how API design questions get resolved.

## Mechanical checklist

- **Full component surface.** A component under `packages/*/src/<Name>/` should
  ship `<Name>.tsx`, a colocated `<Name>.test.tsx`, `<Name>.doc.mjs`, a
  Storybook story, and an `index.ts` export. Flag missing pieces.
- **`forwardRef` + `displayName`**, `export interface <Name>Props`, and exported
  types alongside the component.
- **Never hand-edit the `"exports"` field in a package `package.json`.** It is
  auto-generated from `src/` by `scripts/sync-exports.js` and committed on
  `main`. Editing it by hand is a review-reject.
- **StyleX only** — no raw CSS, no JS workarounds for CSS StyleX supports;
  verify against `internal/stylex-capabilities/CAPABILITIES.md`. Guard `:hover`
  with `@media (hover: hover)`. Use component-scoped `stylex.defineMarker()` for
  form controls — never `stylex.defaultMarker()`.
- **Semantic tokens only** — no hardcoded color/spacing/radius/shadow;
  theme-agnostic output.
- **Navigation** uses `useLinkComponent()`, never a hardcoded `<a>`.
- **Docs in sync** — JSDoc file headers, `SYNC:` reminders, and `.doc.mjs`.
  `@example` fences in JSDoc must be plain ` ``` ` (never language-tagged), or
  Storybook autodocs won't render them.
- **Changeset** present for consumer-visible changes, with `[category]` +
  `@handle`, patch-only pre-1.0.

## Judgment

Conventions passing is necessary, not sufficient. Also flag: state expressed by
unmounting focusable elements (toggle visibility so focus/a11y survive),
`useEffect` deriving secondary state (derive during render / `useMemo`),
unnecessary `useState`, and excessive comments. Behavioral or agent-facing
changes should come with vibe-test evidence.
