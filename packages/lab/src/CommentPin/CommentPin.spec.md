---
schema_version: 3
template_version: 7
kind: component
id: component:CommentPin
authority: draft
archive_reason: null
superseded_by: null
approved_by: null
approved_at: null
owners: [cixzhang, imdreamrunner]
review_triggers:
  [
    public-api,
    behavior,
    layout,
    theming,
    accessibility,
    interaction,
    testing,
    visual,
  ]
verified_by:
  [
    packages/lab/src/CommentPin/CommentPin.test.tsx,
    apps/storybook/stories/CommentPin.stories.tsx,
    packages/lab/blocks/CommentPinShowcase.tsx,
    scripts/check-knowledge.mjs,
  ]
modules: []
families: []
design_specs: []
architecture:
  [
    architecture:component-test-sufficiency,
    architecture:component-theming-surface,
    architecture:interaction-modality,
    architecture:public-component-api,
    architecture:theme-tokens,
  ]
contributing: []
system_specs: [spec:AST-002]
---

# CommentPin component contract

## Contract at a glance

| Area                    | Contract                                                                                                                                                                                                                                                                                                                                                                                |
| ----------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Public contract         | `@astryxdesign/lab` exports one `CommentPin` button, its props, and its participant data type.                                                                                                                                                                                                                                                                                          |
| Behavior                | A marker renders the first participant for one thread. A marker representing multiple threads renders its distinct participants as an AvatarGroup of at most three circles (two Avatars plus a +N overflow beyond three) and the total thread count. Whenever any represented thread is unread, an accent badge with the unread count replaces the total on single and grouped markers. |
| End-user impact         | Annotation anchors identify people rather than positions in an ordinal sequence. Grouped anchors keep a bounded set of participant identities while exposing the number of threads they open, and unread activity stays visible as a count.                                                                                                                                             |
| Builder impact          | Callers provide every distinct participant in order, the total and unread thread counts, an accessible action label, activation behavior, and controlled selected/dimmed/resolved/disabled state.                                                                                                                                                                                       |
| Compatibility/readiness | Additive experimental Lab component. Its API and visual treatment remain draft until product use and visual evidence settle them.                                                                                                                                                                                                                                                       |
| Review checks           | Reject ordinal identity, pin-owned clustering or coordinates, center-anchored placement, interactive descendant avatars, more than three participant circles, an unread count hidden behind the total, generated application copy, hidden thread-count semantics, dimming that disables sibling selection, or selected/resolved paint that obscures participant identity.               |
| Governing rules         | `architecture:public-component-api`, `architecture:component-theming-surface`, `architecture:interaction-modality`, `architecture:component-test-sufficiency`, and `spec:AST-002`.                                                                                                                                                                                                      |

This table is a review projection; the body below is authoritative.

## Intent

CommentPin is the compact interactive surface for opening one anchored
annotation thread or a caller-defined group of threads. It preserves a human
identity cue at the anchor while remaining usable over content or in a content
margin.

## Compatibility and migration

- Released default preserved: `not yet released`
- Compatibility class: additive experimental Lab API
- Controlled/uncontrolled behavior: selected, dimmed, resolved, and disabled
  states and the unread count are caller-controlled; the component owns no
  selection or read state
- Migration decision: none; callers replace bespoke annotation-pin visuals after
  the Lab contract is accepted

Consumer migration instructions belong in consumer docs and release notes.

## Ownership boundary

**Owns**

- One button surface, its single/grouped visual transformation, and its
  selected, dimmed, resolved, disabled, hover, press, and focus-visible
  presentation.
- Rendering ordered participant data through `Avatar`, or for a group through
  `AvatarGroup` with a non-interactive `AvatarGroupOverflow`, without making
  descendants interactive.
- Showing the unread thread count in an accent badge whenever it is above
  zero, otherwise the total represented thread count when that total is
  greater than one.
- The stable `comment-pin` theming target and state reflection.

**Does not own / non-goals**

- Thread data, unread tracking, authorization, loading, transport, selection
  state, or the panel opened by activation — owned by the product callsite.
- Clustering, participant ordering, anchor identity, coordinates, collision
  handling, image transforms, margin layout, or connector lines — owned by the
  product callsite.
- Avatar loading/fallback, shape, and identity paint — delegated to
  `component:Avatar`; overflow indicator paint — delegated to
  `component:AvatarGroup`.
- Ordinal numbering of annotations. Thread count is a quantity for a grouped
  marker, never the marker's identity.

## Public concepts

Consumer prop syntax and examples remain in `CommentPin.doc.mjs`.

| Concept                  | Closed values or states                        | Meaning                                                                                            | Availability by variant/orientation/state | Default                  | Owner                               | Stability        | Invalid-value behavior                                                                                                      |
| ------------------------ | ---------------------------------------------- | -------------------------------------------------------------------------------------------------- | ----------------------------------------- | ------------------------ | ----------------------------------- | ---------------- | --------------------------------------------------------------------------------------------------------------------------- |
| participants             | non-empty ordered participant tuple            | every distinct identity in the thread or group, lead first; groups display at most three circles   | every pin                                 | required non-empty tuple | product supplies; component renders | experimental Lab | TypeScript rejects an empty tuple; untyped empty input falls back to a decorative anonymous Avatar and warns in development |
| represented thread total | positive integer                               | number of threads opened by the marker; values above one select grouped presentation               | every marker                              | `1`                      | product                             | experimental Lab | non-finite, fractional, or values below one resolve to one and warn in development                                          |
| unread thread total      | non-negative integer no greater than the total | number of represented threads with unread activity; above zero, an accent badge replaces the total | every marker                              | `0`                      | product                             | experimental Lab | non-finite, fractional, or negative values are ignored; values above the total are capped; both warn in development         |
| selected state           | selected, not selected                         | whether this pin is the active annotation target                                                   | enabled and disabled                      | not selected             | product                             | experimental Lab | closed boolean                                                                                                              |
| dimmed state             | dimmed, not dimmed                             | whether another pin is selected; lowers prominence without disabling activation                    | non-selected pins                         | not dimmed               | product                             | experimental Lab | closed boolean; selected paint wins when both are true                                                                      |
| resolved state           | resolved, unresolved                           | whether the represented thread set is considered resolved                                          | every marker                              | unresolved               | product                             | experimental Lab | closed boolean                                                                                                              |
| disabled state           | disabled, enabled                              | whether the marker can activate                                                                    | every marker                              | enabled                  | product                             | experimental Lab | closed boolean                                                                                                              |
| accessible action name   | non-empty caller-authored string               | names the action and supplies the marker tooltip without generating application-specific copy      | every marker                              | required                 | product                             | experimental Lab | TypeScript requires a string; blank content remains a caller error                                                          |
| DOM extension            | supported button `BaseProps`, styling, and ref | positions the marker and wires product-owned interaction without giving the component coordinates  | every marker                              | no additional inputs     | `architecture:public-component-api` | experimental Lab | unsupported native props remain unavailable                                                                                 |

## Behavioral and layout contract

Draft requirements identify their basis so observed code is not mistaken for an
intentional decision. A `current` contract contains no unresolved rows.

| ID   | Candidate invariant                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      | Basis                                                   | Draft review state                                          |
| ---- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------- | ----------------------------------------------------------- |
| FR1  | CommentPin MUST render one button and MUST NOT accept, derive, or mutate anchor coordinates, grouping membership, thread selection, or collision layout.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 | product ownership boundary                              | product direction; pending owner approval                   |
| FR2  | With one represented thread, the marker MUST render only the first participant Avatar and MUST NOT use an ordinal number as identity.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    | product direction                                       | product direction; pending owner approval                   |
| FR3  | With more than one represented thread, the marker MUST render its distinct participants as an AvatarGroup of at most three circles — every participant when three or fewer are distinct, otherwise the first two followed by a non-interactive `+N` AvatarGroupOverflow circle counting the rest — followed by the exact represented thread total unless FR10 applies.                                                                                                                                                                                                                                                                                                   | product direction                                       | product direction; pending owner approval                   |
| FR4  | Participant Avatars and the overflow circle MUST use their core components' fallback and paint, MUST suppress tooltips and interaction, and MUST remain decorative descendants of the marker button.                                                                                                                                                                                                                                                                                                                                                                                                                                                                     | Avatar composition and valid interaction tree           | candidate implementation                                    |
| FR5  | `isSelected`, `isDimmed`, `isResolved`, and `isDisabled` MUST remain independent caller-controlled states. Selected presentation MUST draw a solid 2px accent outline outside the pin as a box-shadow ring over a transparent border, with no accent fill and no layout shift, MUST preserve the resting medium elevation and Avatar legibility, MUST remain distinct from the shared focus outline positioned farther outside, MUST retain a visible forced-colors fallback, and MUST win over dimming; dimmed presentation MUST lower non-selected pins' prominence without disabling activation; resolved presentation MUST reduce prominence without hiding the pin. | migration use cases and visual direction                | candidate implementation; rendered visual review pending    |
| FR6  | The marker root MUST combine `xstyle`, `className`, and `style`, forward neutral button DOM/event props and its ref, and keep component-owned type, label, selected semantics, disabled state, target, and reflected states authoritative.                                                                                                                                                                                                                                                                                                                                                                                                                               | public component API architecture                       | candidate implementation                                    |
| FR7  | Hover paint MUST be guarded by hover capability, touch press feedback MUST use the shared press model, and keyboard focus MUST use the shared focus-visible treatment.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   | interaction-modality architecture                       | candidate implementation                                    |
| FR8  | The root MUST keep a speech-bubble silhouette with a fixed 4px logical bottom-start corner and full-radius logical start-start, start-end, and end-end corners in every visual state, in LTR and RTL. The 4px corner MUST NOT follow a theme radius override.                                                                                                                                                                                                                                                                                                                                                                                                            | product visual direction and logical-layout requirement | candidate implementation; rendered visual review pending    |
| FR9  | The root's transform origin and documented absolute-placement convention MUST use the logical bottom-start corner. A host maps its anchor point to that corner by translating the pin upward by its full height and MUST NOT center the pin over the point.                                                                                                                                                                                                                                                                                                                                                                                                              | product placement direction                             | candidate implementation; rendered placement review pending |
| FR10 | When `unreadCount` resolves above zero, the marker MUST show that number in an accent badge in place of the thread total, on single and grouped markers alike; the badge MUST keep a visible forced-colors treatment and MUST remain decorative.                                                                                                                                                                                                                                                                                                                                                                                                                         | product direction                                       | product direction; rendered visual review pending           |

### Allowed variation

- **AV1 — Participant identity.** Names and image sources vary; Avatar owns
  image loading, fallback initials, and anonymous fallback.
- **AV2 — Product placement.** Callers position the root over content or in a
  content margin through layout composition and supported styling inputs. An
  absolute anchor coordinate maps to the logical bottom-start corner rather
  than the pin's center.
- **AV3 — Thread grouping.** Callers may use any clustering policy and
  participant ordering while the marker's visual transformation remains fixed.
- **AV4 — Theme output.** Themes may repaint the admitted root target and its
  reflected states without changing behavior or descendant Avatar ownership.

### Representative states

| State                    | Required invariant                                                                      | Allowed variation                                            |
| ------------------------ | --------------------------------------------------------------------------------------- | ------------------------------------------------------------ |
| Single                   | first participant Avatar; no visible count unless unread                                | identity, selected/dimmed/resolved/disabled state, placement |
| Grouped, one identity    | one Avatar plus total thread count                                                      | count and states                                             |
| Grouped, two or three    | every distinct participant Avatar plus total thread count                               | ordered identities, count, and states                        |
| Grouped, more than three | first two distinct Avatars, a `+N` overflow circle, and total thread count              | ordered identities, overflow count, and states               |
| Unread                   | accent badge with the unread count replaces the total on single and grouped markers     | unread count and other states                                |
| Selected                 | active accent treatment preserves Avatar and count legibility and wins over dimming     | theme paint                                                  |
| Dimmed                   | lower opacity identifies a non-selected sibling without disabling activation            | resolved and disabled may also apply                         |
| Resolved                 | lower-prominence treatment preserves activation and identity                            | selected, dimmed, and disabled may also apply                |
| Disabled                 | native disabled button does not activate and is removed from the sequential focus order | selected/resolved representation remains visible             |

### Transformation and precedence order

- **ORD1 — Count normalization.** Validate `threadCount`; an invalid value
  resolves to one, then a value above one selects grouped presentation.
  Validate `unreadCount` next; an invalid value is ignored and a value above
  the resolved total is capped to it.
- **ORD2 — Participants.** Preserve caller order and remove duplicate IDs. A
  single marker takes the first participant; a grouped marker shows every
  distinct participant when three or fewer remain, otherwise the first two plus
  an overflow count of the rest.
- **ORD3 — Count display.** A resolved unread count above zero replaces the
  thread total; otherwise a grouped marker shows the total.
- **ORD4 — Paint.** Base surface, resolved treatment, dimmed treatment, selected
  treatment, then disabled treatment compose in that order. Selected identity
  remains fully prominent, and disabled interaction always wins.

### Performance and resources

- **PR1 — Bounded anatomy.** Rendering work is bounded to at most three
  participant circles (Avatars plus overflow indicator) and one count element
  regardless of the number of represented threads or supplied participants.
- **PR2 — Shared interaction resources.** Touch feedback uses the shared
  document-level press controller and adds no marker-local listener, observer,
  timer, or state.

Current measurements belong in the audit record; this subsection owns only
durable constraints and their verification target.

## Accessibility contract

- **AR1 — Action.** The root is one native `button type="button"` named by the
  required `label`; `isDisabled` uses native disabled behavior.
- **AR2 — Selection.** `isSelected` is exposed through `aria-pressed`, one solid
  2px accent outline outside the pin, and a forced-colors Highlight treatment;
  the outline hugs the pin while the shared focus-visible outline sits farther
  outside, so the two states remain distinguishable.
  Hosts clear the selection when the selected pin is activated again.
- **AR3 — Decorative descendants.** Participant Avatars, the overflow circle,
  the visible thread total, and the unread badge are hidden from assistive
  technology because the caller-authored button label owns the complete action
  name.
- **AR4 — Tooltip.** The action label is available visually on pointer hover and
  keyboard focus; activation remains the primary touch behavior.
- **AR5 — State naming.** Callers include resolved, grouped, or unread context
  in `label` when it changes the action's meaning; the component does not mint
  application-specific or locale-sensitive copy.
- **AR6 — Dimmed siblings.** `isDimmed` changes presentation only. It MUST NOT
  set disabled or aria-disabled because a non-selected pin remains an available
  target for switching selection.

## Design relationships

| Anatomy or state                | Design requirement                                                                                                                                                                             | Representation authority                       | Hierarchy role          | Component contract |
| ------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------- | ----------------------- | ------------------ |
| Marker surface                  | Compact floating surface distinguishes the action from underlying content                                                                                                                      | candidate implementation pending visual review | prominent anchor        | FR1, FR5, FR7      |
| Representative avatars          | Human identity remains the primary recognition cue; groups cap at three circles                                                                                                                | human-selected product direction               | primary content         | FR2–FR4            |
| Overflow indicator              | A `+N` circle summarizes participants beyond the first two without growing the pin past three circles                                                                                          | human-selected product direction               | supporting content      | FR3, FR4, AR3      |
| Group count                     | Count communicates quantity without becoming ordinal identity                                                                                                                                  | human-selected product direction               | supporting content      | FR3, AR3           |
| Unread badge                    | Accent badge keeps unread activity visible and outranks the thread total                                                                                                                       | human-selected product direction               | supporting state signal | FR10, AR3          |
| Selected/dimmed/resolved states | Selected draws one solid 2px accent outline outside the pin with no fill, distinct from the farther-out focus outline; non-selected siblings dim without disabling; resolved lowers prominence | human-selected product direction               | supporting state signal | FR5, AR2, AR6      |
| Speech-bubble corner            | Logical bottom-start stays fixed at 4px and mirrors in RTL; the other three logical corners stay fully rounded                                                                                 | human-selected product direction               | silhouette cue          | FR8                |
| Placement origin                | Absolute host coordinates map to logical bottom-start, never the center                                                                                                                        | human-selected product direction               | spatial anchor          | FR9                |

### Design decisions

<!-- design-decisions:v1 -->

| ID  | Decision                                                                                                                                                                                                                              | Intent or reason                                                                                                                                                                                 | Applies to                                 | Allowed variation                                                                               |
| --- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------ | ----------------------------------------------------------------------------------------------- |
| DD1 | Participant Avatars, not ordinal numbers, identify comment pins.                                                                                                                                                                      | Ordinal identity becomes hard to scan and manage as annotation volume grows.                                                                                                                     | single and grouped markers                 | identity data and Avatar fallback may vary                                                      |
| DD2 | A grouped marker shows at most three participant circles — two Avatars plus a `+N` overflow when more than three people participate — and separately shows the thread total.                                                          | Identity and quantity answer different questions; capping the facepile keeps grouped pins compact and scannable as participation grows.                                                          | grouped markers                            | caller chooses participant order and grouping policy                                            |
| DD3 | Selected paint is one solid 2px accent outline outside the pin, drawn as a box-shadow ring over a transparent border; it preserves the pin's medium elevation and adds no accent fill; the shared focus outline sits farther outside. | A single 2px outline reads as selection rather than input chrome, shifts no layout, preserves the Avatar area, and remains distinct from keyboard focus.                                         | selected and selected-plus-focused states  | theme accent and elevation tokens may vary; the outline width, placement, and separation do not |
| DD4 | The logical bottom-start corner is a fixed 4px logical longhand; the other three logical corners use the full-radius token.                                                                                                           | A theme may enlarge `--radius-inner`, so a literal keeps the speech-bubble cue exactly 4px, and explicit logical longhands avoid shorthand cascade collisions and mirror in RTL by construction. | every pin and visual state                 | the three rounded corners follow the theme; the 4px anchor corner does not vary                 |
| DD5 | Absolute anchor coordinates map to the pin's logical bottom-start corner, not its center.                                                                                                                                             | The speech-bubble corner stays attached to the annotated point while the body grows toward block-start and inline-end.                                                                           | pins positioned over content or in margins | host coordinates and transforms may vary; the anchor corner does not                            |
| DD6 | When a pin is selected, sibling pins use controlled dimming and remain enabled.                                                                                                                                                       | The active target gains visual focus without preventing a viewer from switching directly to another pin.                                                                                         | sets of pins with one active target        | host chooses which siblings belong to the focused set; selected always wins over dimming        |
| DD7 | Unread threads show their count in an accent badge that replaces the thread total.                                                                                                                                                    | Unread activity is the actionable signal, so it outranks quantity whenever present, including on single-thread pins.                                                                             | single and grouped markers                 | theme accent may vary; the replacement precedence does not                                      |

### Theming anatomy

<!-- anatomy-theming:v1 -->

```json
{
  "Marker surface": {"target": "comment-pin"},
  "Representative avatars": {
    "delegatesTo": {"owner": "component:Avatar", "target": "avatar"}
  },
  "Overflow indicator": {
    "delegatesTo": {
      "owner": "component:AvatarGroup",
      "target": "avatar-group-overflow"
    }
  },
  "Group count": {"inherits": "comment-pin"},
  "Unread badge": {"inherits": "comment-pin"}
}
```

## Family and system relationships

- `architecture:public-component-api` owns DOM reachability, prop semantics,
  styling composition, handler forwarding, and React 19 refs.
- `architecture:component-theming-surface` owns the one root painting target,
  reflected states, and delegated Avatar ownership.
- `architecture:interaction-modality` owns hover capability, touch press, and
  focus-visible behavior.
- `architecture:component-test-sufficiency` owns representative-state and
  mutation-sensitive regression evidence.
- `architecture:theme-tokens` owns the semantic color, radius, spacing,
  typography, motion, and shadow vocabulary used by the baseline paint.
- `spec:AST-002` owns admission of the public Lab surface and invalid-input
  behavior.

## Verification map

| Contract                     | Verification                                                                       | Representative states                                                                                                               | Mutation or failure expectation                                                                                                                                                                | Audit section                  |
| ---------------------------- | ---------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------ |
| FR1–FR4, FR10, PR1, AR1, AR3 | `CommentPin.test.tsx`                                                              | single, grouped within three, grouped overflow, unread single and grouped, invalid unread, duplicate identities, empty participants | extra anatomy, more than three circles, a wrong overflow count, an unread count hidden behind the total, ordinal identity, lost count, or interactive/avatar semantics fail focused assertions | `audit:CommentPin/behavior`    |
| FR5, FR8, FR9, AR2, AR5, AR6 | focused tests plus Storybook state matrix, placement example, and docsite showcase | selected, selected+focused, dimmed, forced colors, resolved, disabled, LTR/RTL silhouette and placement                             | missing state reflection, disabled dimmed siblings, merged selection/focus cues, or centered/non-mirroring placement fails semantic/source assertions or rendered review                       | `audit:CommentPin/states`      |
| FR6                          | focused passthrough, ref, stable-target, and state-reflection tests                | custom DOM/style inputs and every state                                                                                             | dropped inputs/ref or overwritten component-owned semantics fail focused assertions                                                                                                            | `audit:CommentPin/api-theming` |
| FR7, PR2, AR4                | focus, hover-capability source inspection, tooltip test, build scan                | pointer, keyboard, touch model                                                                                                      | unguarded hover, missing focus treatment, or local press machinery fails source/test/build checks                                                                                              | `audit:CommentPin/interaction` |
| Documentation and surface    | component docs, block metadata, root export, Storybook, and knowledge check        | public examples and component discovery                                                                                             | missing or stale discoverability, syntax, boundaries, or relationships fail repository checks                                                                                                  | `audit:CommentPin/docs`        |

## Decision log

None. This record remains draft; its candidate requirements and local design
intent await component-owner and visual review.

## Open questions

- **OQ1 — Does the selected/resolved state treatment preserve enough contrast on
  representative images and every theme while remaining distinct over both
  image content and page margins?** (`human-design`)

## Content boundary

This file does not duplicate consumer prop tables/examples, current audit
results, implementation steps, product grouping algorithms, coordinate systems,
or family/system rules. It links to their owners.
