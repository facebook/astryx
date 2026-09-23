---
schema_version: 1
template_version: 1
kind: system-spec
id: spec:AST-038
authority: draft
archive_reason: null
superseded_by: null
approved_by: null
approved_at: null
phase: proposed
owners: [cixzhang]
affects_architecture: [architecture:layer-runtime]
affects_families: []
affects_contributing: []
affects_consumer_docs: [Layer, useLayer, Dialog]
---

# Layer inherited-text boundary system spec

## Intent

People opening a dialog, menu, tooltip, or other floating reading surface must
not receive centered, italic, uppercase, indented, or unwrappable body text merely
because its trigger lives in a formatted paragraph, heading, table cell, or code
region. A layer starts a new reading task while retaining the surrounding theme
and language context. Native top-layer promotion changes painting, not CSS
inheritance, so the boundary must be explicit.

This is a **draft proposal**, not an approved decision or permission to ship.
[Implementation PR #6457](https://github.com/facebook/astryx/pull/6457) is blocked
on approval of this contract. Its architecture projection and experimental
browser evidence do not establish authority for the proposed defaults.

### Ownership

AST-038 owns the closed inherited-text baseline, participation rule, precedence,
and compatibility decision. It is distinct from
[AST-003](../AST-003/spec.md), whose Non-goals explicitly exclude visual treatment.
AST-003 remains the owner of accepted hosting and interaction changes; this spec
neither duplicates those requirements nor makes its unimplemented changes current.

[Layer runtime](../../architecture/layer-runtime.md) describes shipped hosting
mechanisms and will project the approved text boundary when implemented. Its
existing approval cannot authorize this new cross-component styling decision.
[Component style authoring](../../architecture/component-style-authoring.md),
[theme application](../../architecture/theme-application.md), and
[public component API](../../architecture/public-component-api.md) continue to
own lowering, live theme context, and existing override seams respectively.
Current records and open work for the affected layer paths, `layerTextReset`,
`inherited text`, and `AST-038` were checked; the overlapping implementation is
PR #6457, not an independent approved contract.

## Non-goals

- Changing hosting, portals, positioning, modal semantics, focus, dismissal,
  selection, scrolling, motion, or which layers appear above native dialogs.
- Standardizing foregrounds, backgrounds, geometry, component type roles, or
  deliberate typography inside a layer; changing global document resets or
  non-Astryx elements; neutralizing ancestor text-decoration propagation.
- New component props, reset opt-outs, public reset utilities, theme targets,
  tokens, wrappers, or runtime style-copying. An existing explicit styling seam
  remains the way to request deliberate formatting.
- New accessibility contracts, visual harness products, or test infrastructure.
  Verification proves this styling contract; it does not authorize workflow
  additions or modifications, or changes to unrelated integration evaluators.
- Equivalent internal implementations remain valid. Private module names and
  sharing mechanisms belong in architecture or implementation, not this contract.

## Requirements

### Closed baseline

**FR1 — Neutral reading baseline.** Every participating content boundary MUST
establish exactly these inherited-property defaults before component and caller
styles. Unlisted properties are not reset by this contract.

| Property          | Baseline                   | Reason                                                        |
| ----------------- | -------------------------- | ------------------------------------------------------------- |
| `font-family`     | `var(--font-family-body)`  | Do not borrow a code or heading face.                         |
| `font-size`       | `var(--text-body-size)`    | Start ordinary content in the active theme's body role.       |
| `line-height`     | `var(--text-body-leading)` | Preserve the theme's body reading rhythm.                     |
| `font-weight`     | `var(--text-body-weight)`  | Do not borrow trigger emphasis.                               |
| `font-style`      | `normal`                   | An emphasized ancestor must not italicize the task.           |
| `text-align`      | `start`                    | Start at the reading edge, including RTL.                     |
| `text-align-last` | `auto`                     | Do not inherit last-line justification.                       |
| `text-indent`     | `0`                        | Do not inherit paragraph or icon-replacement indents.         |
| `text-transform`  | `none`                     | Preserve authored case.                                       |
| `letter-spacing`  | `normal`                   | Do not inherit heading tracking.                              |
| `word-spacing`    | `normal`                   | Do not distort reading or intrinsic size.                     |
| `text-shadow`     | `none`                     | Do not borrow decorative text shadows.                        |
| `white-space`     | `normal`                   | Permit ordinary wrapping under preformatted/nowrap ancestors. |
| `word-break`      | `normal`                   | Leave exceptional word breaking to the content owner.         |
| `overflow-wrap`   | `normal`                   | Leave long-token wrapping to the content owner.               |
| `hyphens`         | `manual`                   | Do not inherit automatic hyphenation.                         |

**FR2 — Theme and writing context survive.** The boundary MUST preserve
`direction`, `writing-mode`, `text-orientation`, language, CSS custom properties,
`color-scheme`, font feature/variation settings, and accessibility preferences.
Theme body tokens MUST remain live when a local theme changes. This does not
promise more context recovery than the existing hosting contract provides.

**FR3 — Surface and interaction ownership survive.** Color/background pairs,
geometry, display, positioning, animation, opacity, visibility, cursor,
`pointer-events`, `touch-action`, and `user-select` MUST retain their existing
owners. Inverted Tooltip and Toast colors, Lightbox captions, and click-through
notification/non-modal hosts must not be changed by the text baseline. The
[container-padding boundary](../../architecture/container-padding.md) is separate.
`text-decoration` is not inherited; descendant `none` cannot remove decoration
propagated from an ancestor and is not part of FR1.

### Participation ledger

**FR4 — A reading surface, not a dismissal role.** Inclusion requires a
content-bearing Astryx surface presented outside its owner's normal flow through
Layer, native Dialog, or an equivalent layer host. Modal, non-modal, fallback, and
inline-preview presentations of the same surface MUST share the baseline.
Compositions receive it at their existing content boundary, not their trigger.
A nested layer establishes its own boundary.

| Surface family                 | Participating paths                                                                                                                                                                                                                                                                                         | Why / done criteria                                                                                                      |
| ------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| Layer-backed content           | Context/anchor, context/custom, and fixed Layer; Popover/usePopover; Tooltip/useTooltip; HoverCard/useHoverCard; ContextMenu; DropdownMenu submenus                                                                                                                                                         | The common boundary neutralizes ambient formatting in every renderer without changing geometry or hosting.               |
| Popover compositions           | DropdownMenu, MoreMenu, NavHeadingMenu, TabMenu, TopNav menus, collapsed SideNav items and heading menus, BreadcrumbItem menus; Selector/MultiSelector/ComplexSelector, Typeahead/BaseTypeahead, date inputs, PowerSearch, ChatComposerInput menus, Table filtering; Lab TourStep, ChatEmojiPicker, InfoTip | Inherit the common reset; no duplicate reset or trigger/API changes.                                                     |
| Layer utility surfaces         | Keyboard hints, Carousel controls, Tokenizer overflow, chart/radial tooltips, ListInput/TransferList drag previews                                                                                                                                                                                          | Shared host supplies the baseline; authored hint/chart nowrap and component typography still win.                        |
| Dialog family                  | Modal and inline Dialog, AlertDialog, imperative Dialog/AlertDialog, CommandPalette                                                                                                                                                                                                                         | Native and preview paths agree; component and caller styling stays stronger.                                             |
| Independent viewers/navigation | Lightbox, MobileNav including AppShell, Lab Drawer in modal and non-modal modes                                                                                                                                                                                                                             | Each independent root participates; media/caption treatment and interaction stay unchanged.                              |
| Sheets                         | Standalone and switched BottomSheet, including adaptive menu/input presentations                                                                                                                                                                                                                            | The painted content panel owns the boundary, not its transparent shell or each child.                                    |
| Notifications                  | Promoted and non-top-layer ToastViewport; LayerProvider and imperative fallback                                                                                                                                                                                                                             | The viewport supplies default/custom toast text without resetting page children or changing colors and pointer behavior. |

Consumers of Tooltip/HoverCard (including Button, Link, Text, Timestamp, Avatar,
StatusDot, and field explanations) require no independent trigger change.
Exclusions: in-flow ChatComposerDrawer, Overlay/OverlayScrim, local chart
crosshairs and zoom controls, empty Tour highlight/scrim, and portal-only Token
or Stepper mounts. The Tour Popover callout participates. Moving DOM alone does
not turn ordinary content into a reading layer.

### Precedence and compatibility

**FR5 — Explicit styling wins.** Apply the baseline on the content-bearing root
only, before component styles and supported theme/consumer overrides. Never
reset descendants. Deliberate headings, code, centered captions, bold emphasis,
nowrap hints, and Tooltip/Toast word-breaking rules MUST remain effective.
Existing `xstyle`, `className`, and `style` precedence MUST not be reordered.

**FR6 — No new choice or public surface.** There is no reset opt-out prop, public
reset helper/export, new theme target, or token. Callers that intentionally relied
on inherited formatting must express it on an existing root styling seam or on
their content (including an explicit `inherit` where supported). This is a visible
compatibility change for those callers and must be stated in consumer guidance
and release notes. Normal theme-body content must not acquire an unrelated visual
change; selected component type roles remain component-owned.

### Implementation requirements

- **IR1 — Bounded styling, not a sandbox.** Use supported component-local CSS
  declarations. Do not use `all`, the `font` shorthand, universal/descendant
  resets, global `[popover]`/`dialog` selectors, or copying computed ancestor styles.
- **IR2 — Minimum boundary wiring.** Share the baseline internally where package
  boundaries permit; ensure equivalent declarations at independent roots without
  creating public API solely to share styles. Do not change runtime effects,
  wrappers, portals, interaction logic, or composed callsites unnecessarily.
- **IR3 — Scope and authority stay separate.** The implementation remains blocked
  while this spec is draft. After approval, architecture and concise consumer
  documentation project this decision; they do not repeat an independent policy.
  Verification must not be used to broaden implementation scope.

### Platform support

- Supported feature/engine floor: the existing
  [browser support policy](../../../packages/cli/assets/docs/browser-support.doc.mjs)
  applies; this spec raises no engine floor. Native hosting still follows its
  own support contract.
- Unsupported behavior: the existing display fallback must retain the same text
  baseline. It is not upgraded to native top-layer, positioning, or dismissal
  equivalence by this change.
- Browser evidence: actual CSS inheritance, theme cascade, wrapping, and pixels
  require real Chromium; emitted declarations in a DOM unit environment are not
  sufficient visual proof. No Safari-specific claim is made from Chromium output.

## Current-state impact

After approval and implementation, `architecture:layer-runtime` will project the
baseline ownership and link this spec. Layer, useLayer, and Dialog consumer
guidance will explain intentional formatting at the root/content, and the
changeset will describe the compatibility impact. No family membership,
contributor policy, theme-application semantics, or AST-003 claim changes.

## Verification

| Contract     | Verification                                                                                               | Representative states                                                                                                                           | Mutation or failure expectation                                                                                                                                              |
| ------------ | ---------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| FR1, FR4     | Focused unit assertions on rendered component roots, with a literal oracle independent of the shared reset | Both Layer renderers, Dialog native/inline, independent native roots, sheets standalone/switched, Toast promoted/hosted, Drawer modal/non-modal | Remove each root's adoption or a declared baseline property: that root/property assertion fails.                                                                             |
| FR2, FR5     | Unit override controls plus real-browser cascade evidence                                                  | Nested/light/dark themes, LTR/RTL and vertical writing, live body tokens; authored child emphasis/code and direct root overrides                | A broad reset, descendant rule, frozen tokens, or reversed precedence fails the preserved-context/style control.                                                             |
| FR1, FR6     | Real-browser before/after pixels retained with the implementation PR                                       | Normal theme-body DOM and a deliberately hostile centered/italic/uppercase/indented/spaced/shadowed/preformatted ancestor; parent and submenu   | Restoring inherited alignment produces visibly centered hostile text; normal baseline remains unchanged. Label a mutation as a regression control, not as historical source. |
| FR3, FR4     | Existing component behavior tests and browser inspection                                                   | Positioning, focus/dismissal, caption and inverted colors, click-through viewport/non-modal host                                                | Removed or reordered component styles fail existing controls; no broader interaction contract is inferred.                                                                   |
| FR6, IR1–IR3 | Diff review, existing lint/type/build/knowledge checks                                                     | Export map and barrels, reset declarations, architecture projection, changeset                                                                  | New public reset API, broad selectors, workflow changes, or an approval claim without owner approval fails review.                                                           |

Keep focused regression tests at established component/unit seams. Browser
screenshots and their provenance belong in PR evidence; this styling decision
does not require a dedicated accessibility spec, committed story matrix, or new
workflow/artifact wiring. Test success is evidence, not owner approval.

## Decision log

### DEC-1 — Proposed neutral reading boundary

**Reference:** `spec:AST-038/DEC-1`
**Decider:** Pending owner approval.

Propose the FR1 list at all FR4 boundaries, with FR2/FR3 preservation and FR5
precedence. This makes the same reading task independent of incidental trigger
formatting without erasing its theme or intentional content styling.

Rejected: Dialog-only treatment (other layers still inherit); resetting all CSS
(destroys unrelated style/context); resetting document-wide dialog/popover
selectors (changes non-Astryx UI); preserving all ambient typography (retains the
reported failure); an opt-out prop or public reset utility (adds a permanent
caller choice where existing styling seams suffice).

## Open questions

- **OQ1 — Approve the exact FR1 baseline, participation, and compatibility
  contract?** (`human-design`) The proposed property list and no-new-API decision
  remain unapproved. The implementation must not land before explicit approval
  and promotion of this record to `current`.
