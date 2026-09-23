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

# Layer inherited-text and grouping boundary system spec

## Intent

People opening a dialog, menu, tooltip, or other floating reading surface must
not receive centered, italic, uppercase, indented, or unwrappable body text merely
because its trigger lives in a formatted paragraph, heading, table cell, or code
region. A layer starts a new reading task while retaining the surrounding theme
and language context. Native top-layer promotion changes painting, not CSS
inheritance, so the boundary must be explicit. Nor is the layer another member
of an ancestor visual group: buttons and inputs inside it must not inherit that
group's connected borders, sizing, disabled state, labels, or selection ownership.
The trigger remains a group member; the newly opened task does not.

This is a **draft proposal**, not an approved decision or permission to ship.
[Implementation PR #6457](https://github.com/facebook/astryx/pull/6457) is blocked
on approval of this contract. Its architecture projection and experimental
browser evidence do not establish authority for the proposed defaults.

### Ownership

AST-038 owns the closed inherited-text baseline, the ancestor visual-group
boundary, participation rule, precedence, and compatibility decision. It is distinct from
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

- Redesigning hosting, portals, positioning, modal semantics, focus, dismissal,
  selection, scrolling, motion, or which layers appear above native dialogs.
  Stopping accidental ancestor-group membership is in scope; replacing a
  component's own selection or interaction protocol is not.
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
styles. Unlisted inherited text properties are not reset by FR1.

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
`direction`, `writing-mode`, `text-orientation`, language, theme/custom-property
values, `color-scheme`, font feature/variation settings, and accessibility
preferences. Only an identified group-owned structural value falls under FR7;
that exception does not authorize clearing custom properties by prefix or resetting
semantic theme tokens.
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

### Ancestor grouping boundary

**FR7 — A layer is not an ancestor group's member.** ButtonGroup/InputGroup
membership MUST end at the trigger/control boundary. Layer content must not gain
ancestor-group size, orientation, connected corner/border/separator treatment,
disabled state, label/description association, or shared state merely from DOM or
React ancestry. Equivalent visual-group mechanisms follow the same ownership
rule, whether implemented with context, selectors/markers, or group-owned private
custom properties. A CSS text reset alone does not satisfy this requirement.

**FR8 — Preserve local and deliberate ownership.** A group established _inside_
a layer MUST continue to govern its members. Explicit child props continue to
work. The layer keeps theme, direction, writing mode, and language; it must not
clear all React context or indiscriminately reset geometry. Group-owned separators
and radii stop because the child is not a member, not because every descendant's
border/radius is overwritten. A button or input used as the trigger remains grouped.

A component's explicit surface contract is not accidental ancestry: menu sizing
explicitly derived from the trigger and the menu/submenu close chain remain with
the menu owner. Chart data, selection stores used by a filter/editor, form models,
Layer depth/dismissal, Link providers, and Theme/i18n are not erased wholesale.
Do not infer that every context with "group" in its name is disposable.

### Grouping evidence and scope ledger

The audit inspected grouping providers/consumers on the proposed text-only
implementation, with source cross-checks against base
`1d940e032cab3c45d404a40f0ce8502db5b98059`. ToggleButton's newer action handling
was inspected separately and retains the same group membership path.
Read-only static-render probes used the text-only implementation at
`12991d841df03c6455ba669a026373d55c68bc45` plus its scope-removal working changes.
Static rendering proves the stated props/associations, **not browser geometry**.
No group-boundary implementation is included or authorized while this spec is draft.

| Owner / evidence seam                                                                                                                                                                                                                                                                                                                                                                              | Actual mechanism and observation                                                                                                                                                                                                                                                                                                                                                                                                         | Proposed boundary / verification                                                                                                                                                                                                                                                                   |
| -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [ButtonGroup](../../../packages/core/src/ButtonGroup/ButtonGroup.tsx), [Button](../../../packages/core/src/Button/Button.tsx)                                                                                                                                                                                                                                                                      | React context supplies orientation/disabled; shared SizeContext supplies size. Button applies its own sibling-sensitive radius/separator rules and suppresses standalone elevation/press treatment. Static-render probes under inline Dialog and fixed Layer produced an inner button with `disabled` and `data-size="lg"` from the outer group. No group ancestor marker or group-specific inherited CSS variable supplies these rules. | Stop outer membership/size at layer content; preserve the grouped trigger and an inner ButtonGroup. Check disabled state, size, corners, separator, and standalone elevation.                                                                                                                      |
| [InputGroup](../../../packages/core/src/InputGroup/InputGroup.tsx), [groupStyles](../../../packages/core/src/InputGroup/groupStyles.ts), [TextInput](../../../packages/core/src/TextInput/TextInput.tsx)                                                                                                                                                                                           | Context carries membership and label/description IDs; SizeContext carries size. Consumers apply 100% height/flex, negative border overlap, sibling corners, and skip their normal Field wrapper. Both probes gave inner TextInput `lg` and an accessible label composed from **outer and inner** labels. The context has no disabled/status boolean: do not invent a blanket state reset.                                                | Stop the outer group's presentation and associations. Preserve inner labels, explicit status/disabled props, and newly established InputGroups. Read-only source confirms the same consumer path in NumberInput, TimeInput, DateInput/native/touch fields, Typeahead, Selector, and MultiSelector. |
| [AvatarGroup context](../../../packages/core/src/AvatarGroup/AvatarGroupContext.ts), [Avatar](../../../packages/core/src/Avatar/Avatar.tsx)                                                                                                                                                                                                                                                        | Context carries size/shape/overlap; Avatar adds ring/negative overlap and changes its tooltip tab stop. Both probes produced `lg`/`square` inside the layer without local group ownership.                                                                                                                                                                                                                                               | Equivalent visual-group leakage; proposed isolation includes size/shape/ring/overlap and default standalone behavior. Geometry still needs browser proof.                                                                                                                                          |
| [ToggleButtonGroup](../../../packages/core/src/ToggleButton/ToggleButtonGroup.tsx), [ToggleButton](../../../packages/core/src/ToggleButton/ToggleButton.tsx)                                                                                                                                                                                                                                       | Context carries selected values, toggle callback, size, and disabled state. Both probes produced a pressed `lg` inner toggle from the ancestor group. Source routes activation to that group's callback when `value` is present.                                                                                                                                                                                                         | A standalone toggle in the new task must not join the outer selection owner accidentally. Verify its own callback/pressed state; a locally created group remains functional.                                                                                                                       |
| [SizeContext](../../../packages/core/src/SizeContext/SizeContext.ts)                                                                                                                                                                                                                                                                                                                               | `sizeProp ?? inherited ?? default`; providers include ButtonGroup/InputGroup and Toolbar/SideNav. The value has no provenance distinguishing an explicit general SizeProvider from a group-supplied default.                                                                                                                                                                                                                             | Group-provided defaults must stop. The treatment of a general provider above a layer is the open compatibility decision OQ2, not permission to silently reset every provider.                                                                                                                      |
| [Collapsible group contexts](../../../packages/core/src/Collapsible/CollapsibleGroupContext.tsx)                                                                                                                                                                                                                                                                                                   | Separate state and presentation contexts. Collapsible already clears presentation around its children; state remains deliberately separate.                                                                                                                                                                                                                                                                                              | Preserve that existing guard. Verify any bypass route before changing it; do not treat the state context as merely a divider style.                                                                                                                                                                |
| [ListContext](../../../packages/core/src/List/ListContext.tsx), [MetadataListContext](../../../packages/core/src/MetadataList/MetadataListContext.tsx)                                                                                                                                                                                                                                             | Source consumers inherit density/dividers/list markers and metadata orientation/label layout, respectively; no generic layer guard was found. No pixel or interaction reproduction is claimed for these paths.                                                                                                                                                                                                                           | Equivalent presentation candidates: confirm a supported independent-layer composition before adding implementation work. Existing groups inside a layer remain owners.                                                                                                                             |
| [RadioList](../../../packages/core/src/RadioList/RadioList.tsx), [CheckboxList](../../../packages/core/src/CheckboxList/CheckboxListContext.tsx), [SegmentedControl](../../../packages/core/src/SegmentedControl/SegmentedControlContext.ts), [TabList](../../../packages/core/src/TabList/TabListContext.ts), [menu radio group](../../../packages/core/src/DropdownMenu/DropdownMenuContext.tsx) | These contexts own collection values, callbacks, availability, roles/names, and sometimes sizing. Several child APIs require their provider and throw without it. Source reachability is not evidence that every cross-layer composition is supported or accidental.                                                                                                                                                                     | Do not blanket-null collection protocols. Establish whether the layer is an independent group or an explicitly owned child surface, then test against that component's contract; unresolved membership is OQ3.                                                                                     |

ButtonGroup's roving-focus boundary already excludes nested groups/popovers;
Button/InputGroup trailing-edge selectors skip `[popover]`/`template` siblings.
They protect the **outer trigger's** membership, not descendant controls inside
the popup. Keep those
fixes. Source searches also inspected FormLayout, Table/Stepper, and navigation
contexts/markers: their layout/data/interaction protocols are not automatically
new visual-group reset targets. SegmentedControl also uses inherited private
`--_segmented-control-radius`/`--_segmented-control-padding` values for item
corners; Tab/TabMenu consume `--_tab-indicator-bottom` from strip/container
geometry. AvatarGroupOverflow's private overlap value is authored on its own
root. These are concrete structural channels to inspect, not reasons to erase
every custom property. RadioList indicator and Tab hover/active markers style
local interaction feedback. Scoped indicator/row markers are not group context
barriers; no observed marker leak is claimed without a matching descendant and
browser-state reproduction.

### Existing normalization: consolidate only equivalents

**FR9 — Prior fixes are evidence, not a deletion list.** A normalization may move
into the shared boundary only when its value, target, cascade precedence, and
supported states are equivalent. Local type roles, wrapping, colors, geometry,
and ownership guards MUST remain component-owned when that equivalence is absent.

| Existing code                                                                                                                                          | Finding and disposition                                                                                                                                                                                                                                                                                           |
| ------------------------------------------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [useLayer](../../../packages/core/src/Layer/useLayer.tsx) base typography                                                                              | Existing body family/size/leading are the one equivalent baseline moved into the private shared reset by the text-only implementation. No token/value or precedence change for those three declarations is intended.                                                                                              |
| [Tooltip](../../../packages/core/src/Tooltip/useTooltip.tsx) painted surface                                                                           | Explicit body type, inverted colors, and content `wordBreak: break-word` are deliberate. Keep them; moving inner declarations outward can change supported overrides even where values match.                                                                                                                     |
| [Toast](../../../packages/core/src/Toast/Toast.tsx)                                                                                                    | Uses body **defaults** for size/leading, surface inversion, and content `overflowWrap: anywhere`. This is not equivalent to replacing them with inherited live body variables. Keep them.                                                                                                                         |
| [Lightbox](../../../packages/core/src/Lightbox/Lightbox.tsx), menu rows, keyboard hints, chart/radial tooltips                                         | Centered large captions, menu label/supporting type and start alignment, smaller nowrap keyboard hints, and compact chart wrapping remain intentional local presentation. Do not delete them as redundant resets.                                                                                                 |
| [useLayer portal writing context](../../../packages/core/src/Layer/useLayer.tsx), [padding reset](../../../packages/core/src/Layout/padding.stylex.ts) | Corrective portals preserve lost direction/writing mode without snapshotting tokens. The existing padding boundary resets its own structural variables. Preserve both; neither is a generic group or text barrier.                                                                                                |
| Button/InputGroup end-cap rules and Collapsible/BottomSheetSwitcher context guards                                                                     | Already solve distinct membership/ownership problems. Preserve them; the text boundary does not replace sibling classification, nested presentation isolation, or sheet registration scope.                                                                                                                       |
| `all: unset` on Item/TreeListItem/Collapsible/Stepper/Token/Thumbnail/ChatComposer controls                                                            | Local UA/control resets, not layer-root inheritance fixes. No new `all`/`unset`/`revert` layer reset is proposed. ToastViewport's `inset: unset` is geometry; menuWidth's `unset`/`revert` strings are caller-supplied width keywords routed to inline-size rather than `min()`, not a general inheritance reset. |

The audit found no existing general ButtonGroup/InputGroup context barrier in
Layer or the independent native roots. React portals preserve context, and
native top-layer painting does not break selector ancestry. The grouped-control
leaks above therefore survive the proposed text-only reset.

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
- **IR4 — Target proven membership paths.** Group isolation must be private,
  ownership-aware, and consistent across FR4 content roots. No general provider
  clearing, DOM wrapper, global CSS reset, or public boundary API is implied.
  Implement a ledger entry only after its supported composition and expected
  local/outer ownership are established. Keep intentional surface protocols.

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

Keep focused regression tests at established component/unit seams. For FR7/FR8,
assert independent controls' disabled/pressed state, size, labels/descriptions,
and callbacks under hostile outer groups; include native/inline Dialog,
inline/correctively-portaled context Layer, fixed Layer, and independent roots.
Control cases must keep the outer trigger grouped, an inner group working, and
explicit size/state props and menu/submenu protocols unchanged. Real-browser
checks must establish connected corners, separators, overlap, and standalone
appearance; static rendering cannot prove those claims. Removing one membership
barrier must restore the matching leak, while clearing a local/intentional
provider must fail a preservation control. FR9 requires checking preserved local
type/wrapping and existing group-tail/keyboard guards against their current tests.

Browser
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

### DEC-2 — Proposed visual-group ownership boundary

**Reference:** `spec:AST-038/DEC-2`
**Decider:** Pending owner approval.

Propose FR7–FR9: the trigger belongs to its surrounding group, the independent
layer task does not, and groups established inside the task work normally.
ButtonGroup/InputGroup leaks are not only text styling: they change availability,
control geometry, and label associations. AvatarGroup and ToggleButtonGroup
provide equivalent concrete evidence. Preserve explicit surface protocols rather
than blindly removing every context. No grouping behavior has been implemented.

Rejected: text CSS alone (does not stop context membership); portals alone
(preserve React context and introduce unrelated hosting changes); wiping all
providers/custom properties (breaks theme, data, and deliberately shared surface
protocols); resetting descendant borders/radii (destroys valid inner groups).
Existing guards and local typography are not deleted merely because a shared
boundary exists.

## Open questions

- **OQ1 — Approve the exact baseline and group-boundary contract?**
  (`human-design`) FR1–FR9, the participation ledger, and no-new-API decision
  remain draft. Approval must resolve the compatibility choices below before
  grouping implementation resumes; the text implementation also remains blocked.
- **OQ2 — Does a general SizeProvider above a layer stop there too?**
  (`human-design`) Group-origin size must stop, but the current shared context
  does not identify its origin. Proposed default: all ambient container size
  stops at the new task; explicit control props or a provider inside it win.
  Preserving a deliberately broad provider instead needs private provenance, not
  an assumption that theme tokens and container size are the same thing.
- **OQ3 — Which collection-owned child surfaces intentionally keep membership?**
  (`human-design`) Proposed rule: independent layer tasks cannot join outer
  visual/selection groups; only explicit owner protocols retain context (for
  example menu close/sizing and chart data). The collection candidates in the
  ledger need their supported compositions classified before code changes;
  source reachability alone is not approval to break required-provider APIs.

Owner review should resolve these one at a time. Neither successful checks nor
historical browser evidence promotes this record to `current`.
