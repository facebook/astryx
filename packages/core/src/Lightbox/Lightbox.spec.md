---
schema_version: 3
template_version: 7
kind: component
id: component:Lightbox
authority: current
archive_reason: null
superseded_by: null
approved_by: imdreamrunner
approved_at: 2026-10-12
owners: [cixzhang]
review_triggers: [public-api, behavior, interaction, theming, accessibility]
verified_by:
  [
    packages/core/src/Lightbox/Lightbox.test.tsx,
    packages/core/src/theme/themingTargets.test.ts,
    scripts/check-knowledge.mjs,
  ]
modules: []
families: [family:overlay-dismissal]
design_specs: []
architecture:
  [
    architecture:component-theming-surface,
    architecture:interaction-modality,
    architecture:layer-runtime,
    architecture:public-component-api,
  ]
contributing: []
system_specs: []
---

# Lightbox component contract

## Contract at a glance

| Area                    | Contract                                                                                                                                                                                                                                                                                           |
| ----------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Public contract         | `media` on `Lightbox` and `useLightbox` accepts `LightboxItem \| LightboxItem[]`, where `LightboxItem` is `LightboxMedia \| LightboxCustomItem` and `LightboxCustomItem` is `{type: 'custom', content, label, caption?}`. Both types are exported beside `LightboxMedia`.                          |
| Behavior                | Media and custom items share one gallery index, Counter, navigation, dismissal, and scroll lock. A custom item renders caller content without zoom or pan, is named by its `label`, and keeps key events that start inside it. A consumer `onKeyDown` runs first and cancels shortcuts.            |
| End-user impact         | People page through live previews, embeds, or rich cards in the same full-screen viewer as images. Controls inside that content keep their arrow keys, and screen-reader users hear each custom item's label. Image and video viewing is unchanged.                                                |
| Builder impact          | Opt-in. A custom item supplies a `label`, sizes and styles its own content, and puts interactive controls in `content` rather than `caption`. Existing media callers change nothing.                                                                                                               |
| Compatibility/readiness | Additive and source-compatible; released media defaults are preserved. A consumer `onKeyDown` that prevents default on a shortcut key suppresses that shortcut (FR7). FR4–FR8 and AR1 are settled; their implementation is pending.                                                                |
| Review checks           | Reject a second prop or index space for custom content, renaming `media`, an optional or defaulted custom `label`, zoom or pan on a non-image item, a shortcut that acts on or prevents the default of a key event from inside custom content, or a shortcut that runs after a consumer cancelled. |
| Governing rules         | DEC-1–DEC-3 below; `architecture:public-component-api` INV7 and INV9; `family:overlay-dismissal` for Escape and platform close.                                                                                                                                                                    |

This table is a review projection; the body below is authoritative.

## Intent

Lightbox presents one active item in a full-viewport viewer and may add gallery
navigation, a caption, and a position counter. An item is an image, a video, or
caller-provided React content, so rich previews reuse the viewer's navigation,
dismissal, and scroll lock instead of building their own overlay.

## Compatibility and migration

- Released default preserved: `yes` — media items keep their shape, `type`
  default, rendering, zoom, naming, navigation, and dismissal
- Compatibility class: additive. `media` accepts custom items, and
  `LightboxItem` and `LightboxCustomItem` are new type exports. A consumer
  `onKeyDown` that prevents default on a gallery or zoom key suppresses that
  shortcut for every item kind (FR7)
- Controlled/uncontrolled behavior: unchanged; `index` and `onIndexChange`
  address media and custom items alike
- Migration decision: none required

Consumer migration instructions belong in consumer docs and release notes.

## Ownership boundary

**Owns**

- The Viewer overlay and its current `lightbox` target.
- The item model: the media and custom item kinds, their shared gallery index,
  and naming the dialog from the active item.
- Media presentation, optional Caption and Counter placement, gallery navigation,
  and image zoom and pan.
- The keyboard boundary between Lightbox shortcuts and custom content.

**Does not own / non-goals**

- The Close, Previous, and Next button surfaces — delegated to
  `component:Button` through IconButton.
- Caller-provided Caption content.
- A custom item's content: its layout, sizing, styling, semantics, and its own
  keyboard and pointer interaction — owned by the caller.
- New targets for Media, Caption, or Counter; none exist on current `main`.
- Shared layer hosting or dismissal policy, including Escape — owned by
  `architecture:layer-runtime` and `family:overlay-dismissal`.

## Public concepts

| Concept                   | Closed values or states                       | Meaning                                                                     | Availability by variant/orientation/state | Default                                     | Owner                              | Stability | Invalid-value behavior                |
| ------------------------- | --------------------------------------------- | --------------------------------------------------------------------------- | ----------------------------------------- | ------------------------------------------- | ---------------------------------- | --------- | ------------------------------------- |
| Item collection (`media`) | One item, or an ordered array of items        | The items the viewer presents; an array enables gallery mode                | `Lightbox` and `useLightbox`              | Required; no default                        | `component:Lightbox`               | Stable    | Types reject non-item values          |
| Item kind (`type`)        | `image`, `video`, `custom`                    | Selects media presentation or caller content                                | Every item; kinds may mix in one gallery  | `image` when omitted                        | `component:Lightbox`               | Stable    | Types reject other values             |
| Custom content            | Any React node in `content`                   | The caller's subtree presented as the active Media                          | `custom` items only                       | Required; no default                        | Caller                             | Stable    | Types require it                      |
| Item name                 | `alt` on media items; `label` on custom items | Names the dialog while the item is active and the item in gallery narration | Every item                                | A custom `label` has no default or fallback | `component:Lightbox`               | Stable    | Types require `label` on custom items |
| Caption                   | Absent, or any React node in `caption`        | Non-interactive context below the active item                               | Every item kind                           | Absent                                      | Caller content; Lightbox placement | Stable    | Not applicable                        |

`LightboxItem` and `LightboxCustomItem` are exported with `LightboxMedia` and
`LightboxMediaType` from the Lightbox entry point and the package root. Consumer
syntax and examples remain in `Lightbox.doc.mjs`.

## Behavioral and layout contract

| ID  | Candidate invariant                                                                                                                                                                                                                                                                   | Basis                                           | Draft review state              |
| --- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------- | ------------------------------- |
| FR1 | The viewer contains one active Media item and a Close button; galleries additionally contain Previous and Next buttons plus a Counter, and Caption renders only when supplied.                                                                                                        | Current source, docs, and tests                 | Settled                         |
| FR2 | Viewer overlay carries the current `lightbox` target. Media, Caption, and Counter carry no Lightbox public target.                                                                                                                                                                    | Current source and public docs                  | Settled                         |
| FR3 | Close, Previous, and Next button surfaces use Button's `button` target through IconButton rather than Lightbox-owned button targets.                                                                                                                                                  | Current source and target docs                  | Settled                         |
| FR4 | `media` MUST accept one item or an ordered array that mixes media and custom items in any order. Each item MUST occupy one position in the same gallery index, Counter, navigation, controlled `index`, dismissal, and scroll lock. `useLightbox` MUST accept the same `media` value. | DEC-1                                           | Settled; implementation pending |
| FR5 | The active custom item MUST render its `content` as Media and MUST NOT offer zoom, pan, or a zoom control.                                                                                                                                                                            | DEC-1                                           | Settled; implementation pending |
| FR6 | A key event whose target is inside the active custom item's content MUST NOT change the gallery index, zoom, or pan, and Lightbox MUST NOT prevent its default action. Shortcuts MUST still respond to key events outside that content.                                               | DEC-3                                           | Settled; implementation pending |
| FR7 | A consumer `onKeyDown` on Lightbox MUST receive each key event before Lightbox's gallery and zoom shortcuts. When it prevents the default action, Lightbox MUST NOT perform a shortcut for that event, for every item kind.                                                           | DEC-3; `architecture:public-component-api` INV7 | Settled; implementation pending |
| FR8 | A custom item's `caption` MUST render as Caption under FR1. Caption is non-interactive context outside FR6, so interactive controls belong in `content`.                                                                                                                              | DEC-1                                           | Settled; implementation pending |

### Allowed variation

- **AV1 — Item kind.** An item may be an image, a video, or custom content; zoom
  and pan are available only on image items.
- **AV2 — Gallery mode.** Previous, Next, and Counter are absent for a single
  item. Navigation button disabled state follows the current gallery boundary.
- **AV3 — Caption content.** Caller-provided Caption content may vary without
  becoming a Lightbox-owned target.
- **AV4 — Custom content.** Custom content may vary in size, structure, and
  interactivity; the caller sizes and styles it.

### Representative states

| State                     | Required invariant                                                                        | Allowed variation                             |
| ------------------------- | ----------------------------------------------------------------------------------------- | --------------------------------------------- |
| Single image              | Viewer overlay, Media, and Close button render.                                           | Caption and zoom may be absent or present.    |
| Gallery boundary          | Both navigation buttons and Counter remain rendered.                                      | Previous or Next is disabled at its boundary. |
| Video                     | Media renders native video controls without image zoom interaction.                       | Autoplay follows the existing consumer prop.  |
| Captioned media           | Caption follows the active Media inside the centered media group.                         | Caption content remains caller-provided.      |
| Custom item               | Media presents the caller's content with no zoom control; the dialog is named by `label`. | Content and Caption are caller-provided.      |
| Mixed gallery             | Counter and navigation span media and custom items in caller order.                       | Zoom appears only on image items.             |
| Key inside custom content | Gallery index, zoom, and pan stay unchanged, and the key's default action proceeds.       | The focused control inside the content.       |
| Consumer cancels a key    | No gallery or zoom shortcut runs for that event.                                          | Item kind.                                    |

### Transformation and precedence order

- **ORD1 — Key handling.** Consumer `onKeyDown`, then custom-content ownership
  (FR6), then Lightbox shortcuts. A prevented default ends the order before
  Lightbox shortcuts (FR7).
- No other index, zoom, pan, media, or styling precedence rule applies.

### Performance and resources

- No component-local performance or resource rule applies.

## Accessibility contract

- **AR1 — A custom item is named by its `label`.** While a custom item is
  active, the dialog's accessible name MUST be its `label`. Gallery navigation
  onto a custom item MUST announce its `label` where a media item's
  announcement uses `alt`. Lightbox supplies no fallback name for a custom item.

Semantics, focus order, and keyboard operation inside custom content belong to
the caller. Media-item naming and announcements, focus, button labels, and
dismissal are not contracted here.

## Design relationships

| Anatomy or state | Design requirement                                                   | Representation authority       | Hierarchy role    | Component contract |
| ---------------- | -------------------------------------------------------------------- | ------------------------------ | ----------------- | ------------------ |
| Viewer overlay   | Presents the full-viewport dialog and surrounding overlay treatment. | Current source and public docs | Supporting        | FR1, FR2           |
| Media            | Presents the active image, video, or custom content.                 | Current source and public docs | Prominent         | FR1, FR2, FR5      |
| Close button     | Provides the persistent viewer dismissal action.                     | `component:Button`             | Supporting        | FR1, FR3           |
| Previous button  | Moves gallery presentation to the preceding item.                    | `component:Button`             | Supporting        | FR1, FR3           |
| Next button      | Moves gallery presentation to the following item.                    | `component:Button`             | Supporting        | FR1, FR3           |
| Caption          | Presents caller-provided, non-interactive context below the Media.   | Current source and public docs | Context-dependent | FR1, FR2, FR8      |
| Counter          | Presents current gallery position and total.                         | Current source and tests       | Supporting        | FR1, FR2           |

Media, Caption, and Counter are stable visible parts, but no current public
target reaches them. Their `none` dispositions record factual reachability, not
a decision that they must remain unthemeable.

### Theming anatomy

<!-- anatomy-theming:v1 -->

```json
{
  "Viewer overlay": {"target": "lightbox"},
  "Media": {
    "none": {
      "reason": "reachability-gap: No current public target is applied to the active item"
    }
  },
  "Close button": {
    "delegatesTo": {"owner": "component:Button", "target": "button"}
  },
  "Previous button": {
    "delegatesTo": {"owner": "component:Button", "target": "button"}
  },
  "Next button": {
    "delegatesTo": {"owner": "component:Button", "target": "button"}
  },
  "Caption": {
    "none": {
      "reason": "reachability-gap: No current public target is applied to the caption container"
    }
  },
  "Counter": {
    "none": {
      "reason": "reachability-gap: No current public target is applied to the gallery counter"
    }
  }
}
```

## Family and system relationships

- `architecture:component-theming-surface` owns anatomy qualification, target
  mapping, delegation, and factual `none` dispositions.
- `architecture:layer-runtime` owns the current native-dialog host and shared
  layer plumbing; Lightbox retains its current media and local backdrop behavior.
- `family:overlay-dismissal` owns shared Escape and platform-close ordering and
  records Lightbox as a current adopter.
- `architecture:public-component-api` owns export reachability, the shared
  handler-cancellation contract that FR7 projects (INV7), released-API
  compatibility (INV9), and the consumer-doc projection of public literal
  choices.
- `architecture:interaction-modality` owns shared modality behavior; Lightbox
  adds no modality rule.

## Verification map

| Contract            | Verification                                                         | Representative states                                                                                       | Mutation or failure expectation                                                                                          | Audit section                  |
| ------------------- | -------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------ | ------------------------------ |
| FR1                 | `Lightbox.test.tsx` render, gallery, caption, media, and zoom suites | Single image, gallery edges, caption, video                                                                 | Removing a documented part fails existing role, content, media, or navigation assertions.                                | `audit:Lightbox/anatomy`       |
| FR2                 | Source inspection and `themingTargets.test.ts`                       | Viewer overlay, Media, Caption, and Counter                                                                 | Removing the root target or documenting an unshipped child target fails evidence or inventory.                           | `audit:Lightbox/theming`       |
| FR3                 | Source inspection plus Button and IconButton public composition      | Close and gallery navigation controls                                                                       | Re-owning a control surface requires the delegated owner and this map to change.                                         | `audit:Lightbox/theming`       |
| FR4, FR5, FR8       | `Lightbox.test.tsx` custom-item suites                               | Single custom item, mixed image/custom/video gallery, controlled index, captioned custom item               | A custom item leaves the shared index, renders an image or video element, exposes a zoom surface, or loses its Caption.  | `audit:Lightbox/anatomy`       |
| FR6, FR7, ORD1      | `Lightbox.test.tsx` keyboard suites                                  | Arrow keys from fields, editable regions, and nested widgets in custom content; viewer and button shortcuts | A key inside custom content navigates or is default-prevented, an outside key stops navigating, or a cancelled key runs. | `audit:Lightbox/accessibility` |
| AR1                 | `Lightbox.test.tsx` naming and announcement suites                   | Custom item active on open; navigation onto a custom item                                                   | The dialog name or the announcement uses anything other than `label` for a custom item.                                  | `audit:Lightbox/accessibility` |
| Theming anatomy map | `scripts/check-knowledge.mjs`                                        | Canonical anatomy and current target                                                                        | Missing, extra, prefixed, stale, or multiply assigned mappings fail repository validation.                               | `audit:Lightbox/theming`       |

## Decision log

### DEC-1 — Custom content is an item kind in `media`

**Reference:** `component:Lightbox/DEC-1`
**Decider:** `imdreamrunner`, `2026-10-12`

Lightbox hosts caller-provided React content as a third item kind,
`{type: 'custom', content, label, caption?}`, inside the existing `media`
collection. Custom items share the one gallery index with images and videos, so
mixed galleries, the controlled index, navigation, dismissal, and scroll lock
need no second API, and existing media callers keep their code. Zoom and pan stay
image-only because arbitrary content has no zoom meaning.

Rejected: a separate `content` or `children` prop, which creates a second index space, and renaming `media` to `items`, which breaks every caller without changing behavior.

### DEC-2 — A custom item carries a required `label`

**Reference:** `component:Lightbox/DEC-2`
**Decider:** `imdreamrunner`, `2026-10-12`

Custom content has no `alt`, and Lightbox cannot derive a name from an arbitrary
subtree. Every custom item therefore supplies `label`, which names the dialog
and gallery announcements (AR1).

Rejected: an optional `label` with a generic fallback, which leaves screen-reader users unable to tell custom items apart.

### DEC-3 — Custom content owns its keyboard events

**Reference:** `component:Lightbox/DEC-3`
**Decider:** `imdreamrunner`, `2026-10-12`

Text fields, sliders, and composite widgets inside custom content need their
arrow keys. Lightbox shortcuts apply only to key events outside that content
(FR6), and the public API promises that a consumer `onKeyDown` can cancel a
shortcut by preventing default (FR7).

Rejected: gallery arrows that act on every key event in the dialog, which breaks editing and widgets inside custom content.

## Open questions

- **OQ1 — Should Media, Caption, or Counter gain a stable public theming target?**
  (`human-api`) Their current lack of reachability is an audit gap, not settled
  intent.
- **OQ2 — Should FR6 extend to content a custom item renders outside its stage,
  such as through a React portal?** (`human-api`) FR6 covers key events whose
  target is inside the stage.

## Content boundary

This file does not duplicate consumer prop tables/examples, media algorithms,
shared layer rules, current audit results, or implementation steps. It links to
their owners.
