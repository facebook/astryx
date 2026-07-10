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

## Design review

Some package changes are also *design* changes. When a diff affects how a
component **looks or behaves visually**, review it against
**[Design Conventions](https://github.com/facebook/astryx/wiki/Design-Conventions)** —
the design-side sibling of API Conventions — in addition to the checks below.

**When to apply (detect a design review is needed).** Treat a change as
design-affecting when it touches any of: `.stylex.ts` files or `stylex.*`
styling; token usage (color, spacing, radius, shadow, typography, motion,
elevation/z-index); a new component, variant, or `size`/`density` prop; visual
state handling (rest/hover/focus/active/disabled/loading, selected, or
`status`); layout/structure, borders, or overlays/popovers. Pure logic, types,
tests, or docs with no visual effect do **not** need a design pass — say so and
move on.

When it does apply, evaluate against the Design Conventions foundations and
flag the concrete "smells" that page names:

- **Tokens, not raw values** — every visual value references a token; a raw
  color/space/radius/shadow in core is fixed by using the right token, never by
  swapping one raw value for another.
- **Spacing (relationship hierarchy)** — 4px grid; gaps step up with grouping
  (`label→input < fields < groups < sections`); flag monotonous spacing,
  inverted nesting (child gap wider than parent), off-grid values, nested cards.
- **Concentric radius** — `r_inner ≈ r_outer − gap`; radius from a role token;
  flag non-concentric nesting, thick accent borders / side-tab stripes on
  rounded corners.
- **Vertical rhythm (size/density)** — fixed-height (`size`) and variable-height
  (`density`) controls tuned together to share a baseline; ~44px hit area
  without inflating the visual; flag off-scale heights (not 28/32/36) and
  cramped padding.
- **Elevation** — shadow tier matches stacking order (base < dropdown < sticky <
  overlay/modal < toast < tooltip); popovers escape `overflow:hidden`; flag
  arbitrary z-index and hairline-border-plus-diffuse-shadow or colored glows.
- **Typography** — role tokens; hierarchy ≥1.25 size ratio; body ≥12px; leading
  ≥1.3; flag flat hierarchy, all-caps/justified/gradient body, lines >~75ch.
- **Color** — every fg/bg pair passes WCAG AA in light *and* dark; interaction
  tints are alpha overlays (not opaque); status pairs color with an icon (never
  color alone); one clear primary action; no pure `#000`/`#fff`.
- **Motion** — duration matches the change's weight; only `transform`/`opacity`
  animate (never layout props); `--ease-standard`, no bounce/elastic; honor
  `prefers-reduced-motion`.
- **State representation** — reuse an existing approved representation for a
  state before inventing a new one; every relevant state (rest/hover/focus/
  active/disabled/loading/status/selected) is designed.

Run the objectively-checkable items (tokens, grid, concentric radius, contrast,
z-index, motion properties) as pass/fail; treat proportions, density, and
composition as judgment. This mirrors Hardening Layer 3 — where a review
resolves a genuinely new design question, note that it should be recorded back
into the Design Conventions page rather than decided ad hoc in the PR.

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

Conventions passing is necessary, not sufficient. Weigh the **end-user
experience** of the change, not just whether it compiles and follows the rules.
When something would degrade real usage even though it passes the mechanical
checks, flag it.

- **Accessibility & alerting.** Scrutinize anything that announces, focuses, or
  interrupts — live regions (`role="alert"`/`aria-live`), toasts, focus moves,
  and notification triggers. Look for ways the mechanism could:
  - **Double-fire** — re-run on re-render, fire once per item in a loop, or
    re-announce unchanged content (a common `useEffect`-without-correct-deps
    bug). Assistive tech will read it twice.
  - **Interrupt or bury** — steal focus mid-interaction, stack overlapping
    announcements, or clobber a more important message. `assertive` regions
    especially should be rare and deliberate.
  - **Worsen the experience it's trying to help** — e.g. announcing on every
    keystroke, or moving focus in a way that traps or disorients.
  Prefer announcing on a real state transition, debouncing/coalescing where the
  content is noisy, and reserving `assertive` for genuinely urgent messages.
- **`useEffect` is a smell.** Treat a new/changed Effect as something to justify,
  not accept by default. Most UI logic doesn't need one — look for whether it
  belongs in an **event handler / callback** (logic that responds to a user
  action), a **ref** (imperative work that shouldn't trigger re-render), or
  plain **derivation during render / `useMemo`** (values computed from props or
  state). Use React's own guidance as the bar:
  [You Might Not Need an Effect](https://react.dev/learn/you-might-not-need-an-effect)
  and [Synchronizing with Effects](https://react.dev/learn/synchronizing-with-effects).
  Genuine Effects synchronize with an *external* system (subscriptions, the DOM,
  network, non-React widgets) — those are fine; call out the ones that don't.
- **Other smells.** State expressed by unmounting focusable elements (toggle
  visibility so focus/a11y survive), unnecessary `useState` (prefer derived
  values or refs, especially from interaction handlers), and excessive comments.

Behavioral or agent-facing changes should come with vibe-test evidence.
