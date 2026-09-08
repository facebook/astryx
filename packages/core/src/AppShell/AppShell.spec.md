---
schema_version: 3
template_version: 4
kind: component
id: component:AppShell
authority: draft
archive_reason: null
superseded_by: null
approved_by: null
approved_at: null
owners: [cixzhang]
review_triggers: [behavior, layout, accessibility, public-api]
verified_by: [packages/core/src/AppShell/AppShell.test.tsx]
modules: []
families: [family:layout-regions]
design_specs: []
architecture:
  [
    architecture:public-component-api,
    architecture:react-component-runtime,
    architecture:component-style-authoring,
  ]
contributing: []
system_specs: [spec:AST-012]
---

# AppShell component contract

## Intent

AppShell owns the outer page frame and its responsive navigation handoff. People
should see a generated mobile navigation affordance only when its AppShell-owned
drawer observation container has literal rendered output; an empty control must not
lead to an empty drawer.

This record makes AppShell's generated mobile-navigation availability explicit.
General responsive mechanisms, consumer styling, Layout regions, and fully custom
mobile navigation retain their current owners.

## Compatibility and migration

- Released default preserved: no. Current released behavior treats a non-null nav
  slot value as available even when its component renders no drawer output.
- Compatibility class: proposed historical restoration of literal rendered-output
  eligibility; valid rendered nav layouts and fully custom `mobileNav` remain
  unchanged.
- Controlled/uncontrolled behavior: current mobile drawer ownership is unchanged.
- Migration decision: callers relying on a non-rendering slot to create a generated
  affordance would lose that empty affordance; implementation follows only after
  current owner approval.

## Ownership boundary

**Owns**

- whether AppShell's generated mobile navigation is available;
- whether an automatic mobile toggle is shown;
- how TopNav and SideNav content is handed into the generated drawer; and
- synchronization between actual rendered nav content and the generated affordance.

**Does not own / non-goals**

- arbitrary application breakpoint policy or a universal responsive system;
- TopNav and SideNav's internal item semantics;
- a consumer-supplied `mobileNav` ReactNode, whose content is caller-owned;
- general CSS-versus-JavaScript responsive guidance; or
- Layout's region sizing and scroll ownership.

## Public concepts

| Concept          | Closed values or states                               | Meaning                                                                                                                      | Default                                              | Owner                                       | Stability                          |
| ---------------- | ----------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------- | ------------------------------------------- | ---------------------------------- |
| drawer output    | rendered, empty                                       | whether an AppShell-owned generated-drawer observation container currently has an element child or non-whitespace text child | empty without rendered TopNav/SideNav output         | `component:AppShell`                        | proposed restoration               |
| mobile nav mode  | disabled, generated, configured content, fully custom | who supplies and owns mobile drawer content                                                                                  | generated only when eligible drawer output exists    | `component:AppShell` or caller              | stable modes; proposed eligibility |
| automatic toggle | enabled, suppressed                                   | whether AppShell supplies the generated affordance                                                                           | enabled below breakpoint for eligible generated mode | `component:AppShell`                        | proposed eligibility               |
| breakpoint state | above, below, disabled                                | whether generated responsive substitution is active                                                                          | `md` in generated mode                               | `spec:AST-012/FR8` and `component:AppShell` | stable syntax                      |

## Behavioral and layout contract

**Rendered eligible drawer output** is a literal predicate: the AppShell-owned
observation container for generated TopNav/SideNav drawer content currently has at
least one element child or non-whitespace text child. It does not classify whether
that output is semantically useful, navigable, or from a particular React component
type.

| ID  | Candidate invariant                                                                                                                                                                                                                                                                    | Basis                                                     | Draft review state |
| --- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------- | ------------------ |
| FR1 | AppShell MUST expose its generated toggle and drawer only below the effective breakpoint and only while rendered eligible drawer output exists.                                                                                                                                        | historical rendered-output behavior; proposed restoration | human decision     |
| FR2 | A non-null slot value is insufficient by itself. A TopNav or SideNav component that mounts but produces no eligible drawer output MUST be treated as empty.                                                                                                                            | literal rendered-output proposal                          | human decision     |
| FR3 | When eligible drawer output disappears, AppShell MUST remove or disable its generated toggle and MUST NOT open an empty drawer.                                                                                                                                                        | user-reachability outcome                                 | human decision     |
| FR4 | When eligible drawer output appears, AppShell MUST enable the generated affordance without requiring the caller to replace or reconstruct the slot prop.                                                                                                                               | dynamic rendered-output proposal                          | human decision     |
| FR5 | `mobileNav={false}` MUST disable generated mobile navigation. Configured `hasToggle: false` MUST suppress AppShell's automatic toggle without invalidating a separately owned external control path.                                                                                   | documented API behavior                                   | settled            |
| FR6 | Config `content` MAY replace generated drawer content only while eligible TopNav/SideNav drawer output exists; it MUST NOT independently create a generated affordance. A fully custom `mobileNav` ReactNode always renders under caller ownership and bypasses generated eligibility. | narrow historical-restoration boundary                    | human decision     |
| FR7 | Heading or chrome that remains visible in the mobile top bar MUST NOT by itself count unless it produces literal output inside the generated drawer observation container.                                                                                                             | literal output rather than semantic classification        | human decision     |
| FR8 | Availability, toggle state, `aria-controls`, and the drawer actually controlled MUST agree for each generated state.                                                                                                                                                                   | current accessibility wiring                              | settled            |

### Allowed variation

- **AV1 — Presence mechanism.** AppShell may use registration, rendered DOM
  observation, context, or another bounded mechanism. The literal rendered-output
  predicate is the proposed outcome; the mechanism is not.
- **AV2 — Content source.** TopNav or SideNav may supply generated drawer output.
  Config content may replace that output only after generated eligibility exists.
- **AV3 — Custom mode.** A fully custom `mobileNav` renders independently of
  AppShell's generated-content rules.
- **AV4 — Breakpoint authority.** Effective breakpoint names, theme lookup,
  equality, and SSR precedence follow `spec:AST-012/FR8`. This component owns only
  whether the generated affordance is active above or below that effective value.

### Representative states

| State                                                                | Required invariant                                   | Allowed variation                        |
| -------------------------------------------------------------------- | ---------------------------------------------------- | ---------------------------------------- |
| above effective breakpoint                                           | no generated toggle or drawer                        | inline nav may render                    |
| below breakpoint with literal SideNav drawer output                  | generated toggle and matching drawer are available   | TopNav may also contribute output        |
| below breakpoint with heading-only TopNav and empty drawer container | no generated drawer toggle                           | mobile top-bar heading remains visible   |
| below breakpoint with absent nav slots                               | no generated toggle or empty drawer                  | main content remains unchanged           |
| slot component returns null                                          | treated as empty until literal drawer output appears | component identity remains mounted       |
| eligible output appears or disappears without slot replacement       | availability updates to match output                 | presence mechanism                       |
| `hasToggle: false`                                                   | no automatic toggle                                  | external control may own opening         |
| config content without eligible nav output                           | no generated affordance                              | caller may use fully custom mode instead |
| config content with eligible nav output                              | configured drawer is available                       | content replaces generated drawer body   |
| fully custom mobileNav                                               | caller's node always renders under caller ownership  | generated mode is bypassed               |

## Accessibility contract

- **AR1 — Every generated toggle controls rendered output.** A visible toggle MUST
  have an accessible name and `aria-controls` pointing to the drawer that contains
  the eligible rendered output.
- **AR2 — Empty controls are absent.** AppShell MUST NOT expose a focusable generated
  toggle whose controlled drawer observation container is empty.
- **AR3 — State agrees.** `aria-expanded`, generated availability, and drawer open
  state MUST describe the same controlled surface.

## Design relationships

Content/affordance correspondence does not prescribe toggle styling, mobile-bar
layout, drawer representation, or breakpoint choice. Those remain with AppShell's
component design, theming, and responsive implementation owners.

## Proposed change from current released behavior

Current released behavior treats a non-null TopNav or SideNav slot value as enough
to enable generated mobile navigation, even when the mounted component produces no
drawer output. This draft proposes restoring literal observation of generated drawer
output. It intentionally does not introduce semantic classification of nav zones or
make config `content` independently eligible.

## Family and system relationships

- `family:layout-regions` owns Layout region composition and leaves responsive
  substitution to AppShell or the caller.
- `spec:AST-012/FR8` owns effective named-breakpoint lookup, equality, and SSR
  precedence; AppShell consumes that result.
- `architecture:component-style-authoring` owns CSS-first presentation guidance,
  not whether this generated semantic affordance exists.
- `architecture:react-component-runtime` owns lifecycle/resource safety for any
  rendered-output tracking mechanism.
- This component owns generated mobile-nav output/affordance correspondence.

## Verification map

| Contract      | Verification                                 | Representative states                                                                                      | Mutation or failure expectation                                                                                                     | Audit section                |
| ------------- | -------------------------------------------- | ---------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------- | ---------------------------- |
| FR1–FR4, AR2  | AppShell generated-nav output-presence tests | above/below breakpoint; rendered; absent; component returns null; output appears/disappears                | non-null slot identity creates an empty toggle, above-breakpoint generated UI remains, or dynamic output leaves stale availability  | audit:AppShell/responsive    |
| FR5–FR7       | mode and toggle tests                        | false; hasToggle false; config content with/without eligible output; heading-only TopNav; custom ReactNode | config content independently creates generated eligibility, custom content is suppressed, or heading chrome creates an empty drawer | audit:AppShell/public-api    |
| FR8, AR1, AR3 | keyboard and ARIA wiring tests               | closed/open generated drawer; external control                                                             | toggle points at a different drawer or exposed state disagrees with actual availability                                             | audit:AppShell/accessibility |

## Decision log

None until OQ1 is settled.

## Open questions

- **OQ1 — Generated-content eligibility.** Should AppShell restore literal rendered-
  output detection as proposed here, or define new semantic eligible source zones and
  make config `content` independently enable the drawer? (`human-api`)

## Content boundary

This file does not duplicate AppShell's prop table, breakpoint implementation,
Layout contract, custom mobile navigation behavior, audit results, or remediation
plan. Consumer syntax remains in `AppShell.doc.mjs`; source and regression changes
follow separately after approval.
