---
applyTo: 'packages/**'
---

# Package review instructions

These paths ship as published `@astryxdesign/*` packages, so review them against
Astryx's API guidance and component review protocol.

**Read first, and don't restate here:**

- [Component Audit Rubric](https://github.com/facebook/astryx/wiki/Component-Audit-Rubric)
  — the bar: every rule as a numbered check with its severity and exceptions,
  the bar per change type, and the trigger table mapping what a diff touches to
  the checks it earns. Cite check ids in findings.
- [`copilot-instructions.md`](../copilot-instructions.md) — severity, the review
  signal line, summary-vs-inline, the labels, same bar for every author.
- [CONTRIBUTING → Code Style](../../CONTRIBUTING.md#code-style) — what this repo
  enforces mechanically: TS strict, ref-as-prop, `'use client'`, JSDoc
  `@example` fences.

What follows is what is specific to **published package code** and lives
nowhere else.

## Step 0 — Triage first: categorize, assess risk, pick a path

Before reviewing in depth, do a fast triage. It decides _how hard_ to look and
in what order, so effort lands where the risk is — and so the risk checks
(especially breaking changes) happen **up front**, not as an afterthought.

This is the triage the rubric points at; it is stated here and only here. The
**bar** each change type has to clear is in
[the rubric's bar per change type](https://github.com/facebook/astryx/wiki/Component-Audit-Rubric#reviewing-a-change),
and the **specific checks** a diff earns come from the rubric's trigger table.
Triage sets depth; those two set content.

**1. Categorize the PR** (by what it changes, not just the title prefix):

| Category                | Signals                                                                                   |
| ----------------------- | ----------------------------------------------------------------------------------------- |
| **test / docs / chore** | only `*.test.tsx`, `*.doc.mjs`, stories, CI, build config — no shipped runtime/API change |
| **bug fix**             | behavior change to existing code, no new public surface                                   |
| **new API surface**     | new component, new prop/variant, new exported hook/type, changed signature                |
| **refactor / internal** | behavior-preserving restructure, shared-util migration                                    |

**2. Assess risk — the two questions that gate everything:**

- **Is it a breaking change?** Scan for: a removed/renamed public export, prop,
  or variant; a **new required** field on a public type/context/props; a changed
  default; a changed function signature; or changed DOM/class/ARIA output
  consumers may depend on. (The tell for an _accidental_ breaking change:
  unrelated tests/examples/call sites had to be edited — see the silent-breaking
  rule in Judgment.) A real breaking change must be **intentional and signalled
  with a `[breaking]` changeset category**, and for a removed/renamed/changed
  public API in a **published** package, a **codemod** under `astryx upgrade`.
  Flag a breaking change with no `[breaking]` changeset (and no codemod where one
  is warranted) as blocking. **`lab` is exempt**: it is private and never
  published, so it has no consumers to migrate and is allowed to break freely —
  never ask for a codemod for a lab-only change, and promoting a component out of
  lab into core is additive from the published side.
- **What's the blast radius?** A core primitive many components build on, or a
  shared type/context, is higher-stakes than a leaf component or a docsite tweak.

**3. Pick the review path** (depth follows category × risk):

- **Fast path** — docs/chore, or a small behavior-only bug fix with a
  regression test, no breaking change, low blast radius. Verify accuracy (does
  the referenced API exist / does the fix match the described bug), confirm the
  test/changeset, and approve. Don't manufacture findings on a clean small PR.
  **A standalone test PR is not automatically fast-path** — it still has to clear
  the test-quality bar under "Calibrate to the PR type".
- **Standard path** — a normal bug fix or a contained prop/behavior change. Run
  the checks the diff triggers, plus Judgment below.
- **Deep path** — new API surface, a breaking change, a plugin/hook that extends
  a host, or a high-blast-radius core change. Run every automatable check **and**
  route the API-design decision to a human (see "When to flag for engineering /
  human judgment"); note it should be spec'd + vibe-tested. Do not verdict the
  API yourself.

> **Hard stop — new props / API changes from a contributor need human judgment.**
> If a PR adds a **new prop** or otherwise changes API surface (a new component,
> variant, exported hook/type, or a changed/removed signature) and the author is
> in the **contributor bucket** (not in `.github/ENGOWNERS` or
> `.github/DESIGNOWNERS`), the AI reviewer must **not** approve or merge it —
> even if it's clean, additive, and passing CI. Flag it as **⚠️ Needs
> human/maintainer judgment on the API surface** and leave the approve/merge
> decision to a human. "Additive and non-breaking" is _not_ sufficient to
> auto-approve API surface — whether the API _should exist_ and take this shape
> is a human call. Behavior-only fixes, tests, docs, and chores from
> contributors can still take the fast/standard path.

State the category, the risk, the path, and the checks you ran at the top of the
review, e.g. `Triage: bug fix · non-breaking · low blast radius → fast path ·
checks: §1 A4/A5, §7 C1`.

## What counts as high-risk in this scope

The shared review-signal model lives in `copilot-instructions.md`. Within
`packages/**`, a change is **high-risk** when it involves any of:

- **Public API change** — a new/changed/removed export, prop, variant, hook,
  type, or signature; a changed default; changed DOM/class/ARIA output.
- **New component or module** — a net-new component directory, especially added
  directly to `core` (skipped `lab`) — see Lifecycle & promotion.
- **New package** — a net-new `@astryxdesign/*` package. Always human-judgment.
- **Suspected regression** — an unintended behavior/logic change or a silent
  breaking change to a shared type/context (see Judgment).

Anything else in this scope is low-risk for signal purposes. The one explicitly
low-risk _area_ inside `packages/**` is **`packages/themes/**`** (theme values);
a theme-only change does not trip the high-risk gate — though still apply the
design blast-radius check in Judgment, since a token change can regress
everywhere it composites.

## Calibrate to the PR type

Once triaged, weight the review by what the PR is trying to do. The evidence
each type owes is in
[the rubric's bar per change type](https://github.com/facebook/astryx/wiki/Component-Audit-Rubric#reviewing-a-change);
these are the package-specific reading notes on top of it.

- **Bug fixes** — the red→green evidence belongs **in the PR description**. Flag
  a bug-fix PR that changes behavior without it and ask; a fix with no
  regression test can silently break again.
- **Tests** — a test PR must earn its merge by testing the **contract, not the
  implementation**. A passing test that exists is necessary but _not_ sufficient
  to approve. The one-line test: _does this protect a promise a consumer relies
  on, or does it just mirror the code?_ If it would break on a harmless refactor
  yet survive a real bug, it's slop — request changes (kindly), naming the
  specific assertions to cut or refocus.
  - **✅ Worth testing** — the public behavioral contract (state transitions,
    controlled/uncontrolled, callbacks fire with the right args, documented edge
    cases: empty / boundary / overflow); each meaningful branch of a pure
    function; the accessibility contract (roles, ARIA wiring, keyboard
    interaction — first-class for a design system); and regression tests pinned
    to a real reported bug (red → green).
  - **🚫 Test slop — don't merge as-is** — asserting internal state, private
    helpers, or DOM/class structure that isn't a public contract
    (change-detector tests); snapshot dumps with no behavioral assertion;
    re-testing React or the library ("useState updates", "prop passed through"
    with no logic between); trivial padding ("renders without crashing" as the
    _only_ assertion, or `it.each` explosions with no distinct risk per case);
    and computed style/token/pixel assertions (that's brittle design territory).
- **Docs** — validate against reality: does the documentation match the
  code/API/behavior **on this branch**? When a claim is a matter of best practice
  or judgment rather than fact, call it out for a maintainer rather than
  asserting it's right or wrong.
- **New features / new components** — whether this is the _right way to expose
  the functionality_ is a human judgment call. **Do not render a verdict on the
  API design.** Run the mechanical, convention, and convergence checks, then
  explicitly flag that maintainers should review the API surface (and that new
  surface should be spec'd and vibe-tested).

## When to flag for engineering / human judgment

Many Astryx contributions come from designers building with an AI assistant.
The assistant is good at composition and convention, but some changes cross into
territory where **engineering review and human judgment are required** — and the
review should **say so explicitly** rather than quietly approving. If you find
yourself uncertain, that uncertainty is itself the signal: name it.

Add an explicit **"⚠️ Needs engineering / human judgment"** note when the change
involves any of:

- **New public API surface or an API-shape decision** — a new component, a new
  prop/variant, or changing an existing prop's contract.
- **New runtime complexity** — effects, refs, observers
  (`MutationObserver`/`ResizeObserver`/`IntersectionObserver`), imperative DOM
  work, event listeners, timers, async coordination, or anything touching a hot
  path. Designers should not land this class of change without an engineer
  confirming it's the right mechanism.
- **Accessibility semantics** — ARIA roles/states, focus management, keyboard
  interaction, live regions/announcements. Getting these subtly wrong is worse
  than omitting them.
- **State, data flow, or lifecycle** — anything beyond presentational styling:
  controlled/uncontrolled state, deriving state, memoization, render behavior.
- **Escape hatches / breaking the system** — raw CSS, non-token values,
  `swizzle`d source, or overriding a system default; these need a documented
  rationale an engineer signs off on.
- **Anything the change _asserts_ works but can't be verified from the diff** —
  performance claims, cross-browser/RTL/theme behavior, SSR/hydration.

Pure presentational work well within the system — composing existing components,
using tokens and documented props, adding a story or realistic mock data — does
**not** need this flag. Reserve it for the cases above so it stays meaningful.

When you raise it, be specific: name _what_ in the diff needs the deeper look and
_why_ (e.g. "the `ResizeObserver` in `X.tsx` is a runtime-complexity + perf
decision — an engineer should confirm a container query wouldn't do"), so the
designer knows exactly what to hand off.

## API guidance

The rules themselves are on the wiki — apply them and cite the specific rule
when something conflicts:

- **[API Conventions](https://github.com/facebook/astryx/wiki/API-Conventions)** —
  naming (`<Namespace><Variant><Type><Postfixes>`, unprefixed: `Button`, not
  `AstryxButton`), the prop-surface contract, and the principles a review leans
  on most: guidance over enforcement, prop independence, orthogonal axes,
  composition over config for high-level components, and matching existing
  siblings.
- **[Component Specification Protocol](https://github.com/facebook/astryx/wiki/Component-Specification-Protocol)** —
  the evidence-backed 9-phase process new components must follow.
- **[API Arbitration](https://github.com/facebook/astryx/wiki/API-Arbitration)** —
  where naming and shape disputes get resolved instead of in the PR.

### Adding a new prop — converge, don't diverge

When a diff **adds a new prop** (or a new variant/enum value), don't evaluate it
in isolation. Check whether other components already express the same
capability, and push to converge:

- **Search for prior art.** Look for an existing prop with the same _axis of
  variation_ under a different name (`size` vs `scale`, `isLoading` vs `busy`,
  `tone` vs `variant` vs `color`, `density` vs `compact`). Check sibling
  components in the same family first, then the wider system.
- **Prefer the established name and value shape** — reuse the existing prop
  name, type, default, and vocabulary. Flag a new prop that reinvents an
  existing one under a different name or value shape.
- **Flag near-duplicates that should unify.** If the new prop and an existing one
  are ~80% the same intent, the right outcome is often one shared prop across
  both, not two subtly-different ones.
- **When no prior art exists,** it is genuinely new API surface — hold it to the
  API Conventions principles, and note that it should be spec'd and vibe-tested
  rather than settled in the PR.

### Plugins & hooks that extend a host component

Some components expose a plugin/hook surface (e.g. `Table` with `useTable*`
plugins). These extend a host, so review them for consistency _with that host_,
not in isolation — recurring issues seen in real review:

- **Mirror the host's API shape, in and out.** A plugin should accept and return
  the same shapes the host already uses. If `Table` accepts `idKey` (a key that
  may be a string _or_ a getter, so callers avoid writing callbacks), a plugin
  should accept the same rather than forcing a bespoke callback — and should
  **name its outputs to match the host's props** so they compose directly.
  Prefer `const {idKey} = usePlugin(); <Table idKey={idKey} />` over exporting
  `getRowKey` that the caller has to remember maps to `idKey`. Flag renamed or
  reshaped equivalents.
- **Semantic values first, arbitrary as the escape hatch.** When a plugin/prop
  takes a visual value (color, status, tone), the first-class API is the
  system's **semantic tokens** (`color: 'accent'` / `'success'`), not raw values.
  Arbitrary values are fine as an escape hatch, but flag an API where the
  raw/arbitrary form is the primary one.
- **Decide host-level vs plugin-level deliberately** — especially for
  accessibility. If an option affects host semantics (e.g. a row `startFrom`
  index that changes `aria-rowindex`), it likely belongs on the **host** so the
  semantics are correct even when nothing visible renders.

### Hook stability & reuse of existing data

For hooks (plugins or otherwise), watch two things that bit real Table PRs:

- **Dependency-set stability.** A hook whose memoized output depends on a
  frequently-changing value (e.g. the whole `data` array) will re-compute and
  hand consumers a new reference on every update, destabilizing everything
  downstream. Flag dependency sets that make the return value churn.
- **Don't re-derive what's already available.** If the host or the DOM already
  exposes a value, read it instead of recomputing. Real case: a row-index plugin
  looped over `data` to compute indices the table row already carried as
  `aria-rowindex` — the loop (and the extra API surface) was avoidable.

## Design review

Some package changes are also _design_ changes. The design rules are
**[Design Conventions](https://github.com/facebook/astryx/wiki/Design-Conventions)**
— spacing and the 4px grid, concentric radius, vertical rhythm, elevation,
typography, color and contrast, motion, and the approved state
representations. Apply that page; don't re-derive it here.

**When it applies.** Treat a change as design-affecting when it touches any of:
`.stylex.ts` files or `stylex.*` styling; token usage (color, spacing, radius,
shadow, typography, motion, elevation/z-index); a new component, variant, or
`size`/`density` prop; visual state handling (rest/hover/focus/active/disabled/
loading, selected, or `status`); layout/structure, borders, or overlays/popovers.
Pure logic, types, tests, or docs with no visual effect do **not** need a design
pass — say so and move on.

**How to run it.** Score the objectively-checkable items (tokens, grid,
concentric radius, contrast, z-index, motion properties) as pass/fail; treat
proportions, density, and composition as judgment, and judge those from
**rendered screenshots**, not from reading CSS. This mirrors Hardening Layer 3 —
where a review resolves a genuinely new design question, note that it should be
recorded back into the Design Conventions page rather than decided ad hoc in the
PR.

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
`packages/core/src/<Name>/` with no prior presence in `packages/lab/src/`.** A
lab→core _promotion_ — a delete under `packages/lab/src/**` paired with the add
in core — is the healthy path; the concern is the _net-new_ component that was
never in lab. Ask the author to confirm it went through lab, or that it meets
the core bar lab does not guarantee (full keyboard + a11y, a theming story with
`themeProps`, spec compliance, a complete surface).

**Require a linked spec issue.** A new component's PR description must link to a
tracking issue that clearly ran the
[Component Specification Protocol](https://github.com/facebook/astryx/wiki/Component-Specification-Protocol).
Flag a new-component PR with **no linked spec issue**, or one linking a bare
"add X" feature request with none of the protocol's evidence, and ask for the
spec before the API is reviewed on its merits. The spec is the contract.

Small additions and deliberately spec-approved direct-to-core work do happen —
this isn't an automatic rejection — but call it out so a human confirms it was
intentional.

### New package (net-new `@astryxdesign/*`)

A brand-new package is a bigger commitment than a new component — a published
surface the project maintains and versions indefinitely. **Flag a diff that adds
a new top-level `packages/<name>/` directory.** Always route to human/maintainer
judgment regardless of author, and confirm:

- **The package should exist as its own package** (vs. living in an existing
  one) — a deliberate, maintainer-level decision.
- **Publish posture is intentional** — `private: true` + `astryx.canaryOnly` for
  staging vs. a stable public package; `"exports"` generated by
  `scripts/sync-exports.js`, not hand-written; versioning joins the `fixed`
  group.
- **A tracking/spec issue is linked** establishing the need and scope.

Never approve a net-new package on convention-cleanliness alone.

### New template added already-visible (not `hidden`)

CLI templates/blocks are authored **hidden** and revealed only after they clear
the template design bar — see
[`templates.instructions.md`](./templates.instructions.md) for the full rule.
Flag a diff that adds a _new_ template/block whose `.doc.mjs` is not
`hidden: true`.

## Mechanical checklist

The design-system rules (StyleX-only, semantic tokens, no style-only wrappers,
the shared a11y primitives, `useLinkComponent()`) are numbered checks on the
[Component Audit Rubric](https://github.com/facebook/astryx/wiki/Component-Audit-Rubric);
what this repo enforces mechanically is in
[CONTRIBUTING → Code Style](../../CONTRIBUTING.md#code-style). What is specific
to a published package:

- **Full component surface.** A component under `packages/*/src/<Name>/` should
  ship `<Name>.tsx`, a colocated `<Name>.test.tsx`, `<Name>.doc.mjs`, and an
  `index.ts` export, plus a Storybook story at
  `apps/storybook/stories/<Name>.stories.tsx` (stories are not colocated —
  `apps/storybook/.storybook/main.ts` only discovers
  `../stories/**/*.stories.@(js|jsx|mjs|ts|tsx)`). Flag missing pieces.
- **`export interface <Name>Props`** extending `BaseProps`, with types exported
  alongside the component.
- **Never hand-edit the `"exports"` field in a package `package.json`.** It is
  auto-generated from `src/` by `scripts/sync-exports.js` and committed on
  `main`. Editing it by hand is a review-reject.
- **Docs in sync** — JSDoc file headers, `SYNC:` reminders, and `.doc.mjs`.
  `@example` fences in JSDoc must be plain ` ``` ` (never language-tagged), or
  Storybook autodocs won't render them.

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
  belongs in an **event handler / callback**, a **ref**, or plain **derivation
  during render / `useMemo`**. Use React's own guidance as the bar:
  [You Might Not Need an Effect](https://react.dev/learn/you-might-not-need-an-effect)
  and [Synchronizing with Effects](https://react.dev/learn/synchronizing-with-effects).
  Genuine Effects synchronize with an _external_ system (subscriptions, the DOM,
  network, non-React widgets) — those are fine; call out the ones that don't.
- **Overly complex behavior for a simple need.** Flag heavy runtime machinery
  added where a simpler, declarative solution exists — the classic being a
  `MutationObserver` / `ResizeObserver` / `IntersectionObserver`, imperative DOM
  measurement, event listeners, or a `useEffect` sync loop introduced to achieve
  something CSS (or a token/prop) already does. Watch for observers or
  measurement in hot paths (per-row, per-keystroke, per-frame, large lists), and
  for reintroducing work the platform handles natively
  (`:hover`/`@media (hover: hover)`, `@container`, `:nth-child`,
  `@starting-style`, `position-try`, `stylex.when.*`).
- **Silent breaking changes to shared types/context.** Adding a **required**
  field to a shared type, context value, or component API is a breaking change
  for every existing consumer — even when the PR's own feature doesn't need them
  to change. The **tell**: unrelated tests, examples, or call sites had to be
  updated just to satisfy the new field. Flag it and ask whether the field should
  be **optional** (applied internally with a default) instead. (Real case: a new
  required `aria-controls` id on a mobile-nav context forced edits to surfaces
  that didn't otherwise need it.)
- **Unintended behavior/logic change.** Compare what the diff _actually changes_
  against what the PR says it does. Flag behavior the author likely didn't mean
  to touch — a value, default, condition, or output that changed as a side effect
  of the intended edit and that the description never mentions. This is different
  from scope contamination (unrelated _files_ bundled in); here the collateral
  change is _inside_ the area the author was working on, so it's easy to miss.
  Watch especially for:
  - **Design/token changes — judge by presentation impact, not the token type.**
    Reason about **how it renders and where that could break**: does it alter
    contrast, legibility, or emphasis? Does it change how a value _composites_
    over other surfaces or in a different theme/mode? Does it shift layout,
    spacing rhythm, or elevation order? Does it hold in both light and dark, and
    against every surface the token appears on? The canonical trap: a color that
    reads fine in isolation but was relied on to layer over other content, so the
    change silently degrades every place it composites. (One real instance: a
    theme edit that made a color opaque when other UI depended on it being
    translucent — fine where the author looked, broken where they didn't.)
  - **Changed defaults / conditionals** — a default prop value, a comparison
    (`>=` vs `>`), an early-return, or a guard that changed as a byproduct.
  - **Generated-output drift** — a regenerated theme CSS / registry / token file
    whose diff contains changes beyond the intended one.
    Surface these as a question — "this also changes X (was `a`, now `b`) — does
    that hold everywhere it's used?" — so the author can confirm or revert.
- **Other smells.** State expressed by unmounting focusable elements (toggle
  visibility so focus/a11y survive), unnecessary `useState` (prefer derived
  values or refs, especially from interaction handlers), and excessive comments.

Behavioral or agent-facing changes should come with vibe-test evidence.
