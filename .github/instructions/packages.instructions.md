---
applyTo: "packages/**"
---

# Package review instructions

These paths ship as published `@astryxdesign/*` packages, so review them
against Astryx's API guidance and component review protocol.

## Calibrate to the PR type

Weight the review by what the PR is trying to do:

- **Bug fixes** — require **evidence in the description**. A fix should
  demonstrate the bug first (a failing test, a reproduction, or another
  detection method), apply the fix, then demonstrate success (the test now
  passes). Flag a bug-fix PR that changes behavior with no failing-test-then-
  passing evidence and ask for it — a fix without a regression test can silently
  break again.
- **Docs** — validate against reality. Check that the documentation is actually
  correct (matches the code/API/behavior on this branch). When a claim is a
  matter of best practice or judgment rather than fact, **call it out for a
  maintainer** rather than asserting it's right or wrong.
- **New features / new components** — whether this is the *right way to expose
  the functionality* is a human judgment call. **Do not render a verdict on the
  API design here.** You may still run the mechanical, convention, and
  convergence checks below, but explicitly **flag that maintainers should review
  the API surface carefully** (and that new surface should be spec'd and
  vibe-tested) rather than approving the design yourself.

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

### Adding a new prop — converge, don't diverge

When a diff **adds a new prop** (or a new variant/enum value) to a component,
don't evaluate it in isolation. First check whether other components already
express the same capability, and push to converge on the existing shape:

- **Search for prior art.** Look for existing components with a prop of similar
  *purpose* or *behavior* — the same axis of variation, even under a different
  name (e.g. `size` vs `scale`, `isLoading` vs `busy`, `tone` vs `variant` vs
  `color`, `density` vs `compact`). Comparable components should already be
  siblings in the same family; check those first, then the wider system.
- **Prefer the established name and value shape.** If the capability exists
  elsewhere, reuse that prop name, type, default, and value vocabulary. Flag a
  new prop that reinvents an existing one under a different name or a different
  value shape (booleans following `is`/`has`; validation via
  `status={type, message?}`), and suggest converging on the existing convention.
- **Flag near-duplicates that should unify.** If the new prop and an existing
  one are ~80% the same intent, call that out — the right outcome is often one
  shared prop across both components, not two subtly-different ones. Divergent
  sibling APIs are exactly the drift these conventions exist to prevent.
- **When no prior art exists,** the prop is genuinely new API surface — hold it
  to the API Conventions principles above (orthogonal axis, prop independence,
  guidance-over-enforcement) and note that new API should be spec'd and
  vibe-tested rather than settled in the PR (route naming disputes to
  [API Arbitration](https://github.com/facebook/astryx/wiki/API-Arbitration)).

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

## Lifecycle & promotion

Astryx components and templates move through a staging lifecycle
([Component Lifecycle](https://github.com/facebook/astryx/wiki/Component-Lifecycle),
[Component Hardening Protocol](https://github.com/facebook/astryx/wiki/Component-Hardening-Protocol)).
The thing to catch is **new work that skips staging** — landing directly in its
final, publicly-visible home without being hardened first. Flag these as
high-attention (post a note rather than hard-blocking — this is advisory).

### New component added directly to `core` (skipped `lab`)

`@astryxdesign/lab` is the canary-only staging area (`private: true` +
`astryx.canaryOnly`) where new components develop and harden;
`@astryxdesign/core` ships to stable consumers. The expected path is
**lab → core after hardening**.

**Flag a diff that adds a brand-new component directory under
`packages/core/src/<Name>/` with no prior presence in `packages/lab/src/`.**
That's a component skipping the staging step. (A lab→core *promotion* — a delete
under `packages/lab/src/**` paired with the add in core — is the healthy path
and is fine; the concern is the *net-new* component that was never in lab.)

When you see a net-new core component, ask the author to confirm either that it
went through lab, or that it genuinely meets the core bar that lab explicitly
does *not* guarantee:

- Full keyboard + a11y (ARIA contracts, focus, `:hover` guarded by
  `@media (hover: hover)`)
- Theming story + `themeProps`, semantic tokens throughout, status states
  (error/warning/success) where it's an input
- Spec compliance with an approved spec issue, and **vibe-tested** API
- Complete surface (see Mechanical checklist below)

Small additions and deliberately spec-approved direct-to-core work do happen —
this isn't an automatic rejection — but a new core component that skipped lab
should be called out so a human confirms it was intentional and hardened.

### New template added already-visible (not `hidden`)

CLI templates/blocks are authored **hidden** and revealed only after they clear
the template design bar. The CLI reads `hidden: true` and
`hiddenComponents: ['Name', ...]` from a template's `.doc.mjs`; hidden entries
are skipped from `--list`.

**Flag a diff that adds a *new* template/block whose `.doc.mjs` is not
`hidden: true`** (i.e. it's publicly listed from the moment it lands). A new
template appearing already-visible skipped the hidden-staging step and may not
be hardened yet. Ask the author to confirm it meets the template design bar
(component/token purity, layout, realistic mock data, and the design-judge
visual axes; target grade B or above — see
[Contributing Templates](https://github.com/facebook/astryx/wiki/Contributing-Templates)
and the Design review section above), or to add `hidden: true` until it does.

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
- **Overly complex behavior for a simple need.** Flag heavy runtime machinery
  added where a simpler, declarative solution exists — the classic being a
  `MutationObserver` / `ResizeObserver` / `IntersectionObserver`, imperative DOM
  measurement, event listeners, or a `useEffect` sync loop introduced to achieve
  something CSS (or a token/prop) already does. Watch for observers or
  measurement in hot paths (per-row, per-keystroke, per-frame, large lists) that
  risk performance regressions, and for reintroducing work the platform handles
  natively (`:hover`/`@media (hover: hover)`, `@container`, `:nth-child`,
  `@starting-style`, `position-try`, `stylex.when.*`). Ask: could this be a CSS
  key, a container query, or a prop instead of JS observing the DOM? Prefer the
  simpler mechanism; call out the complexity and the regression risk when the
  heavy approach isn't justified.
- **Other smells.** State expressed by unmounting focusable elements (toggle
  visibility so focus/a11y survive), unnecessary `useState` (prefer derived
  values or refs, especially from interaction handlers), and excessive comments.

Behavioral or agent-facing changes should come with vibe-test evidence.
