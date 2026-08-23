# @xds/core

# 0.4.7

#### Fixes

- BottomSheet: a non-modal sheet now colours the iOS 26 Safari toolbar strip with its own surface instead of letting the page show through behind the address bar (#5342).
- BottomSheet: a tap inside the sheet is a tap, and the sheet leaves on an exit curve (#5326).
  Two defects, both of which read as "the sheet closes with no animation" — reported against the touch DateInput picker, which is a Bottom Sheet.

  **A tap inside the sheet started a one-pixel drag.** The sheet body carries the pull-to-dismiss handlers, and they promoted to a sheet drag on _any_ downward movement. A finger is never still, so the pixel or two a tap drifts began a drag — and a live drag suppresses the panel's transition, correctly, because a dragged sheet must track the finger rather than lag it. The close that the tap triggered landed inside that window, so the sheet jumped to its closed position with no transition. Tapping the picker's Save button hit this every time; tapping the scrim never did, because the scrim is the dialog itself and arms no gesture. Promotion now needs 8px of travel — the conventional tap slop, well under what a deliberate pull covers in its first frames — in both the pointer and touch paths. The gesture's transition suppression is also scoped to a sheet that is open, so it cannot straddle an exit.

  **The exit ran on the entrance's curve.** `--ease-standard` is `cubic-bezier(0.24, 1, 0.4, 1)`, a decelerate curve: it spends its speed immediately and coasts. Right for an entrance, wrong for an exit. Measured on device (iPhone, real Safari), a scrim tap put the sheet half off-screen in 59ms of the 410ms transition and 90% off in 163ms, with the dim gone before it — so the close was over before the eye could follow it. The closing state now carries an accelerating curve of its own, `cubic-bezier(0.3, 0, 0.6, 0.6)`: away from rest, gathering speed, quickest as it leaves the screen, and moving within ~50ms so it reads as one departure rather than a hesitation and a snap. Only the curve changes — the exit keeps `--duration-medium`, the entrance's band, which is what keeps it legible under a theme that scales the motion scale down (neutral's medium is 300ms against the base 410ms).

  The scrim leaves with the sheet: while closing, the dim runs `linear` rather than the decelerate token. A fade covers no distance, so front-loading its progress just ends it early — the reasoning the touch date picker's surface swap already carries. `BottomSheetSwitcher` gets the same treatment when its flow closes; a handoff between two sheets is not a close and is unchanged.
- `useListFocus` no longer swallows Escape when no `onEscape` was supplied. The hook called `preventDefault()` on every Escape — a habit inherited from the arrow keys, which share the handler and need it to suppress page scroll — so a list with nothing to dismiss still marked the key handled, and a surrounding layer that defers to `defaultPrevented` (a focus trap, a native popover) never got its turn. Escape is now consumed only when an `onEscape` is passed. Arrow, Home and End handling is unchanged (#5346).
  Behaviour change: `AvatarGroup`, `ButtonGroup`, `Outline`, `Pagination`, `SegmentedControl`, `TabList` and `Toolbar` pass no `onEscape`, so an Escape pressed inside one of them now reaches the surrounding layer and can dismiss it — the point of the fix, but a host that counted on the key stopping there will notice. `NavHeadingMenu` does the same when it renders without a menu close handler. Menus and flyouts that do pass `onEscape` are unaffected. `patch`, not `[breaking]`: the swallowing was never a contract — the hook documented Escape only as "custom callback", and no component advertised consuming the key.
- TabList: the selected tab now carries `aria-current="true"` — ARIA's generic "current item within a set" — instead of `aria-current="page"`. The strip is a `<nav>` and stays one, but it is used to switch views in place at least as often as it is used to navigate, and on those uses `page` asserted a page change that never happened. Assistive tech announced the selected tab as the _current page_ even when nothing had navigated; it now announces it as the _current item_, which is true either way. A tab given an `href` still renders an anchor and still reads as a link — its current marker is just less specific than it was. No role changes and no new props. (#5347)

#### Contributors

Thanks to everyone who contributed to this release:

- @cixzhang
- @imdreamrunner

---

# 0.4.6

#### New Features

- DateInput fits the pointer: a touch picker on a finger, the text field
  on a mouse (#5243)

  `DateInput` has always been a control for a mouse — a field you type into with a calendar in a popover beside it. On a phone or a tablet that is the wrong shape: the popover is a desktop calendar operated by thumb, and focusing the field summons a keyboard that covers the thing it is meant to fill in.

  The same component now renders a second surface where the primary pointer is a finger (`pointer: coarse`): a bottom sheet holding one month per screen, swiped sideways, with month and year wheels behind the header title for the far jumps swiping is bad at, arrows in the header corner for a single step, and every target floored at 44px. A day commits the moment it is tapped and leaves the sheet up, so a mistake can be corrected in place; Save closes the picker, and Reset puts it back to how it opened — no date, current month. The grid spills adjacent-month days, muted and unselectable, and the weekday header is three letters rather than two, both as the desktop calendar has them.

  The month and year wheels are one layer that fades in and out on top of the calendar. The calendar itself never fades — it is covered and uncovered, so the only thing moving is the thing arriving. The layer carries an opaque background of its own, which is what makes the fade uniform: it renders as a finished image and the fade applies to the image, rather than the wheels' translucent selection band compositing against a live grid on its own terms.

  Nothing changes at the call site. It is one component with two surfaces, not two components — same props, same values, no new import, no media query to write. Existing usage is untouched: with a mouse the rendered output is the control that was always there.

  The switch is the pointer alone, deliberately with no width bound. `pointer` means the PRIMARY device, so a touchscreen laptop reports `fine` and keeps the typable field (its keyboard is right there), while a narrowed desktop window is still a mouse. Adding a width test would only re-exclude tablets, which are the clearest case for a thumb picker.

  The public surface barely moves: six `@astryx.dateInput.*` catalog keys for the picker's header and footer, and nothing else. No new props, no new exports — `DateInputProps` is byte-identical at 25.

  Nothing else is published, on purpose. There is no export that forces a surface: the touch picker is reachable by being on a touch device, which is the only place it is worth looking at. The media query the switch runs on is an internal constant, not an export — six other core components write `@media (pointer: coarse)` inline rather than sharing one, and nothing has asked to ask the same question. The picker's two sizes (the 44px day cell, the 28px wheel row) are compile-time constants rather than theme variables — the day size is an accessibility floor, and a variable a theme can quietly lower is not a floor. And the sheet's header button is addressed by a `data-` attribute rather than a theme target, because nothing has asked to restyle it. Each of those is additive later and awkward to withdraw once shipped.

  The wheels also answer a mouse now. A wheel is a scroll container, so a finger pans it for free; a mouse got nothing, because browsers do not drag-scroll an overflow container — pressing and pulling on the one control shaped like a thing you spin did nothing at all. Dragging with a mouse works, and fixes a related bug on the way: BottomSheet begins its own drag from a `pointerdown` on its body and captures the pointer for it, so a click on a wheel row that wobbled more than a pixel or two used to select nothing.

- Export `useLocale` and `useCollator` for provider-backed formatting and comparison (#5194)
- RadioListItem: the `radio-list-item` row theme target now carries `size`, `selected`, and `disabled` state variants (matching `multi-selector-option`), so themes can style selected or disabled rows (#5143).
- RadioListItem: the `radio-list-item` theme target now rides the painting row element (converging with `list-item`), so a theme can style the row's hover background, padding, and border radius — previously it sat on a layout-only wrapper that painted nothing. The default (unthemed) row appearance is unchanged: it stays a bare surface with no row padding, radius, or hover/selected background (only the radio indicator tints on hover) (#5143).
- `Section`, `Stack` (with `HStack` / `VStack`) and `Center` accept a padding prop for each of the four edges — `paddingBlockStart`, `paddingBlockEnd`, `paddingInlineStart` and `paddingInlineEnd` — so an edge can take its own spacing step without an `xstyle` escape hatch. `Section` also gains the `paddingInline` axis prop it was missing, so all three components now expose the same seven-prop set (#5224).
  Each prop takes the same spacing scale as `padding`, and resolution is most-specific-wins, per edge:

  > edge prop → axis prop (`paddingInline` / `paddingBlock`) → `padding`

  An edge prop changes its own edge and leaves the other three alone.

  ```tsx
  <Section padding={6} paddingBlockStart={2}>…</Section>   // tight top, 24px elsewhere
  <Stack padding={4} paddingInlineEnd={0}>…</Stack>         // flush trailing edge
  ```

  The inline props are logical, so `paddingInlineStart` is the left edge in LTR and the right edge in RTL.

  On `Section` the matching `--container-padding-*` custom property moves with the prop, so bleed children (`Table`, `Divider`, a nested `Section`) keep compensating against the padding actually applied.

  Existing code is unaffected: `padding`, `paddingInline` and `paddingBlock` behave exactly as before, and their generated class output is unchanged.

- Selector: add the `selector-option-row` theme target on the dropdown option row, carrying `size` plus `selected`/`disabled` state — so a theme can restyle row padding and density directly (mirroring `multi-selector-option`), instead of reaching the bare `role="option"` element with a structural selector (#5179).
- MediaTheme: add `mode="auto"` and `mode="off"` (#5299)
  A theme is free to define `--color-background-inverted` as something that is not inverted — and a component that hardcodes `mode="dark"` then paints white text on pale grey at 1.25:1. The surface color is a runtime value and the mode was a compile-time guess, so no amount of care in the component could catch it.

  `mode="auto"` measures the surface the browser actually painted and applies whichever of the theme's own `--color-on-dark` / `--color-on-light` reads better on it. There is no threshold and no contrast target: it picks between the theme's two answers, so a theme that wants a soft pairing still gets one. Deciding a surface needs _no_ media context stays an authoring choice — that is the new `mode="off"`, which renders the same element without the media attribute so children never remount.

  When the backdrop is not knowable from CSS — during SSR, on the first client frame, and most often behind a `background-image`, whose pixels need sampling (see `useImageMode`) rather than a computed style — `auto` uses the new `fallback` prop instead of guessing.

  Toast now uses `mode="auto"`, with its previous rule kept only as that fallback. Every stock Astryx surface renders exactly as before.

- Tooltip and HoverCard: tap to open where there is no hover (#5248)
  Hover is the one trigger a touch screen cannot express, and both components were answering that badly. `Tooltip` suppressed itself on any device reporting `(hover: none)`, so its content — often the only label an icon button has — was simply unreachable on a phone. `HoverCard` did nothing at all: the `mouseenter` a tap synthesizes opened the card on every tap of its trigger, over the control the user was aiming at, with no gesture that closed it again.

  Both now take a `touchTrigger` prop, and what the trigger DOES decides the default. A trigger that performs an action — a button, a link, a form control — keeps its tap under `auto`: the layer stays shut, because the tap already has somewhere to go and a hint about a control the user just operated is noise. A trigger that performs no action — an info icon, an abbreviation, a truncated label — has nothing to lose, so the tap opens the layer, with no show delay (a tap is a decision, not the hover intent the delay exists to filter) and a tap outside to dismiss it. `tap` and `none` state the choice outright; `tap` is what an info icon rendered as a button wants, since it looks like an action to the DOM while revealing the layer is the only thing it does.

  Hover-capable devices are unaffected, hybrid ones included: the decision is made per interaction from the pointer type rather than once per device from a media query, so the same trigger opens on hover under a mouse and on tap under a finger. A stylus is a hover device by the same rule — a pen in detection range fires hover events with nothing in contact, so it opens the layer on hover, and only a pen that lands counts as a tap. Neither layer opens from the focus a tap leaves behind any more — the second way a tap could bury the control it activated, and on `Tooltip` it is the tapped text fields that were affected, since those match `:focus-visible` by design.

  [fix] InfoTip (lab): opts into `touchTrigger="tap"`. Its trigger is a real button, so the `auto` rule would hand the tap to the control — but revealing the tooltip is that button's only purpose, and suppressing it left an InfoTip's content unreachable on a phone.

#### Fixes

- Avatar: a status element now reports its own accessible label to the avatar through context, so wrapping `AvatarStatusDot` in a component of your own keeps the status in the avatar's accessible name ("Jane Doe, Online") instead of silently dropping it — the `role="img"` root prunes descendant semantics, so composing it in is the only route to assistive tech (WCAG 4.1.2). Reading `label` off a directly-passed element still works and still resolves on the first render. An interactive avatar (`href`/`onClick`) with no `name`/`alt` warns in development, and a status label no longer counts as the control's identity: "Online" reads as a legitimate name while saying nothing about where the link goes. Derived `role`/`aria-label`/`aria-hidden` now spread before the passthrough props, following Icon, so a consumer's own values win. No API change (#5034)
- AvatarGroup: four defects out of the component audit, three of them in `AvatarGroupOverflow` (#5055).
  The indicator was `display: flex` on a span, which is a block-level flex container, so the exported component rendered as a full-width bar instead of a circle anywhere outside an `AvatarGroup`: measured 1168px wide in a 1168px parent. It is `inline-flex` now; inside a group nothing changes, because a flex item is blockified either way.

  Its label font size was a bare `size * 0.35`, which computes 7px at `xsm` and 8.4px at `sm`. That is under the 12px legibility floor, and the effect is worse than the number suggests: the glyph stroke ends up thinner than a pixel, so it never reaches its own text colour. Decoded from a screenshot, the darkest pixel at `xsm` is `#bebebe` on a `#f0f0f0` field, a contrast of 1.63:1 where 4.5:1 is required. The size now floors at the `--text-supporting-size` role token and scales proportionally above it, so `md` and larger are unchanged.

  The indicator also kept its negative overlap margin when it was the first child of a group, hanging 12px outside the group's own box. It now carries the same `:not(:first-child)` guard `Avatar` already had. And a negative `count` rendered the string `+-3` and announced "-3 more"; since the documented shape for the prop is `total - visibleCount`, which goes negative whenever the list is shorter than the slice, it now clamps at zero.

  Docs: the guidance told readers to "set max to limit visible avatars", and there is no `max` prop. The API is compositional on purpose, so the consumer slices; the guidance now says that. The keyboard behaviour names the APG roving tabindex technique it implements, and `size` now says that the group's value wins over each child avatar's own `size`, including when the group leaves it at the default.

- Blockquote: the `cite` attribution renders as a bare `<cite>` instead of being wrapped in a `<footer>`, which was becoming a `contentinfo` document landmark. Also guards the slot with `isRenderable`, so `cite={condition && author}` no longer emits an empty `<cite>`, and wraps long unbroken words instead of overflowing (#5144).
- Bottom Sheet: float the grab handle so content sits closer to the top (#5222)
  The drag area above the sheet's content was a 48px row in the sheet's flex column, pushing everything below it down by its full height and reading as an empty band above the first line of content.

  The bar is now 24px and floats over the content: the scrolling area starts at the sheet's top edge and rides up under the pill, so a heading sits 24px closer to the top. The pill is 4px tall centered in the band, so it occupies only 10-14px from the edge — inside the top padding a content wrapper already provides — and a surface gradient behind it keeps it legible over whatever sits or scrolls beneath.

- BottomSheet: give the sheet one uniform edge against the scrim. Two things were wrong in dark mode. The sheet drew no edge of its own — surface and scrim sit a few RGB steps apart and the `--shadow-high` drop shadow is black on near-black, so the left and right edges were invisible (measured 1.16:1 boundary contrast in dark against 2.89:1 in light); it now carries a `--border-width` / `--color-border` hairline on its three scrim-facing edges, the same treatment MobileNav gives its scrim-facing edge. And under a theme that packs an inset ring into `--shadow-high` (every bundled theme adds one in dark mode) that ring was painted over by an opaque content wrapper such as `Section`, so it showed only in the gap below where the content ended and the side edges appeared to change width partway down; the scrolling body now paints the surface across the sheet's whole inner box, hiding the ring evenly (#5305).
- Breadcrumbs: button crumbs keep the link's vertical padding, the variant reaches the item theme targets, and interactive crumbs paint the shared focus ring (#5332)
- DateInput's touch calendar no longer rests between two months (#5319)
  Swiping the month calendar on iOS could leave it parked a couple of columns into a pane: the left of March and the right of April on screen at once, under one square Sun-to-Sat header, with the title still naming March. The grid was never skewed — the scrollport was simply at rest where no month begins.

  `scroll-snap-type: mandatory` is supposed to make that impossible, and on a static list it does. This list is virtualized: seven panes exist out of twelve hundred, and the panes ARE the snap areas, so every month the finger crosses mounts one and unmounts another while the fling is still running. iOS scrolls off the main thread — it picks a landing place from the snap points it knows about at that moment, and a React re-render that lands after the decision moves them. The scroller stops where a snap point used to be and nothing re-snaps it. Chrome never showed it because it snaps again after the mutation.

  The rest position is now corrected rather than trusted: once the gesture is genuinely over — touch released, the scroller quiet, AND its offset confirmed unchanged across a frame — a scroller that is off a pane boundary is moved to the nearest one. A scroller the browser snapped for itself is left alone, so nothing extra happens on Chrome, and sub-pixel drift on a fractional viewport is ignored.

  That last condition is what keeps the fix from becoming a worse bug than the one it fixes. A quiet period is not proof of rest: iOS runs its own snap animation for a few hundred milliseconds after the finger lifts and fires scroll events irregularly while it does, so a correction that trusts quiet alone can land mid-animation, round an offset still travelling toward next month back to the month it came from, and reverse the swipe.

- A disabled element answers the pointer with `default`, never an interactive cursor. Every `cursor` in core and lab carries `':is(:disabled,[aria-disabled="true"])': 'default'`, and the reset gives the same cursor to any disabled element that declares none — `[aria-disabled]` included, which previously got nothing. A lint rule and a Chromium sweep over every story keep it that way. Disabled elements sealed behind `pointer-events: none` are unchanged: the pointer never reaches them, so their cursor comes from an ancestor — which is why the guarantee is `default` rather than a distinct disabled cursor the library could only paint on some of them (#5323).
- Disabled elements no longer paint a hover state: every self-`:hover` in core and lab, and every `:hover` a theme authors, now carries the zero-specificity guard `:hover:where(:not(:disabled,[aria-disabled="true"]))`, so existing overrides weigh exactly what they weighed before. A lint rule and a Chromium sweep over every story keep it that way (#5247).
- InputClearButton: the clear (✕) affordance now meets the WCAG 2.5.8 AA 24×24 minimum on touch. The shared button rendered a 20px glyph with a 20px tap target, so every input that clears through it — Typeahead, Tokenizer, FileInput and the rest of the family — was under the floor on a phone. An `::after` overlay now expands the tappable region to 24×24, gated behind `@media (pointer: coarse)`: on a fine pointer the overlay is not generated at all, because a mouse is precise enough, an unconditional overlay could overlap neighboring controls in dense desktop layouts, and an overlay covering the button would take hover away from the `astryx-input-clear-icon` theme target. The visual glyph is unchanged at every breakpoint, and the overlay stops at 24px so it stays clear of the 8px adornment gap and the input's own caret area (#4956).
- MobileNav: the drawer now slides in when it opens, instead of only sliding out when it closes. Two things were needed, and each is useless without the other. First, the dialog is `display: none` while closed, so the drawer's first rendered frame already holds the on-screen transform and a transition has no before-change value to run from — `@starting-style` supplies it, for the drawer's transform and for the `::backdrop`'s opacity. Second, the dialog clipped the off-screen drawer with `overflow: hidden`, which makes it a scroll container; a scroll container in the top layer whose subtree holds another scroller (the drawer's content area) does not paint a `@starting-style` entry transition for its descendants in Chromium — the transition ticks in the CSSOM while every painted frame shows the end value. `overflow: clip` clips identically without creating a scroll container. The drawer now slides in from its own edge (mirrored under RTL) and the scrim fades up, both on `--duration-medium` and both collapsing under `prefers-reduced-motion`, exactly as the close already did (#5218).
- NumberInput: the number-stepper column now tracks a themed padding and radius instead of assuming the defaults. Theming `number-input` padding left the steppers short of the field edges (a gap top and bottom), and a themed `borderRadius` rounded the field while the stepper corners kept the default radius. The wrapper's padding now goes through the shared container expansion, so it is picked up from any spelling a theme writes it in — `padding: 14px 20px`, `paddingBlock`, or a single `paddingBlockStart` — and both the wrapper and the column read the resulting per-side `--astryx-number-input-padding-*` tokens; an asymmetric `paddingBlock: 4px 12px` is cancelled correctly at each edge. A themed `number-input` borderRadius now also reaches `--_field-radius`, which the column's outer corners follow. Byte-identical by default, and inert for the no-stepper case and every other input (#5181).
- Stop the container padding system at every overlay boundary. Follow-up to #5209, which zeroed `--container-padding-*` on four overlay roots and closed the visible overflow in #5208 (#5231).
  Two gaps remained. The variables descendants ADD (`--layout-padding-*`, and a Section's propagated padding) still crossed the boundary, so an unpadded `Section` inside an overlay took the page's padding instead of the theme default — 40px where 16px was meant. And `Lightbox`, `ContextMenu` and `HoverCard` were never covered.

  The reset now lives in one place (`overlayPaddingReset`, exported from `@astryxdesign/core/Layout`) instead of being hand-copied per overlay, and moved onto the `useLayer` root, which covers every layer surface at once. Values descendants subtract are zeroed; values they add are cleared to `initial` so readers fall through to their own default rather than losing their padding.

  Section's padding propagation moved from the public `--astryx-section-padding` token to a private `--_section-padding-propagated`. The two carried different authority under one name — a theme's value versus one ancestor's — and an overlay could not drop the inherited one without blanking the theme's. Propagated values still win over the theme for nested sections, so behavior is unchanged. Themes are unaffected: `--astryx-section-padding` remains the public token and still reaches inside overlays.

- Theming: a physical `paddingTop`/`paddingBottom` now reaches the container padding expansion, so `card`, `dialog`, `section` and `number-input` track it the way they already track the logical spellings. A physical block longhand matched none of the padding property names the expansion recognizes, so it landed raw on the element while the component's internals kept reading the default — the NumberInput stepper column came up ~10px short of the field edges, and container bleed compensated by the wrong amount. Mixing spellings was worse than either alone: `padding: '10px'` plus `paddingTop: '14px'` published 10px in the tokens while the element painted 14px on top. `padding-top` and `padding-bottom` ARE the block edges in every horizontal writing mode, so this normalization assumes no direction. `paddingLeft`/`paddingRight` are deliberately unchanged: they are direction-relative — left is inline-start in LTR and inline-end in RTL — and the tokens are consumed by logical properties, so routing them would silently move the padding to the opposite edge under RTL. They keep their physical meaning, exactly as before (#5244).
- `DateInput`, `DateTimeInput`, `DateRangeInput`, and `Calendar` now format and parse dates using the ambient `InternationalizationProvider` locale instead of the host/browser locale. `plainDateFormat` (backing `formatSharedDate`) previously called `Intl.DateTimeFormat(undefined, ...)`, and `dateParser`'s day/month disambiguation heuristic for ambiguous numeric input (e.g. `3/4/2026`) called `Intl.DateTimeFormat()` with no locale at all, so a tree wrapped in a non-English `locale` still formatted and parsed dates using the host locale (#5120).
- Use the InternationalizationProvider locale for sorting, formatting, and speech defaults (#5195)
- RadioListItem: the whole row is now a click target. Clicking the description — or the empty space in a row's hover area — selects the radio, matching CheckboxListItem. Previously only the radio and its label text responded, so the description and surrounding row were dead space. The row delegates surface clicks to the radio input (one tab stop per option preserved), and the radio keeps its accessible name via `aria-label` (#5143).
- Reset container padding custom properties on overlay elements (`BottomSheet`, `Dialog`, `MobileNav`, `Popover`) to prevent nested `Section` components from inheriting ancestor section padding (#5209).
- ResizeHandle: dragging the lower half of a tall handle works again. The invisible grab zone is stretched along the handle, but the offset that biases it onto the pill also carried the pill's own `-50%` centering shift — so the zone slid half the handle's length off the divider. On a full-height panel at 1440x900 the 16x900 hit box sat at y=-434, leaving everything below the pill's centre dead: a pointerdown on the visible grip's centre, or anywhere lower, started no drag at all. The dead region grew with the panel, and the same shift stranded the grab zone sideways on vertical handles. The bias now moves the zone along the pill's axis only (#5198).
- Opening a Dialog, BottomSheet, Lightbox, or MobileNav no longer shifts the page sideways when the browser has a classic scrollbar (#5219)
  Locking background scroll hides the document's scrollbar. Where that scrollbar takes layout space — Windows/Linux desktop, and macOS set to always show scroll bars — hiding it widened the layout viewport by its width (~15px), so the whole page reflowed sideways behind the overlay and back again on close.

  Both scroll locks now hold that gutter open with `scrollbar-gutter: stable` for the duration of the lock, which keeps `position: fixed` chrome (sticky headers, toast viewports) still as well as in-flow content. Pages with no space-taking scrollbar, and pages that already set `scrollbar-gutter` themselves, are left alone. Engines without `scrollbar-gutter` support fall back to padding the measured difference.

- SegmentedControl: keep item labels on a single line, truncating overflow with an ellipsis instead of wrapping to multiple lines (#5035)
- Selector: `SelectorOptionData` gains `description`, and the closed trigger now shows the selected option instead of just its label. The two-line option row `SelectorOption` draws was unreachable from the `options` prop — the data type carried only `value/label/disabled/icon` — so consumers kept a side map of descriptions keyed by value and re-rendered the row through `renderOption`. `description` now sits on the option data and `DefaultOption` forwards it. On the trigger, the selected option's own `icon` renders in the closed state (`startIcon` still wins when set, so a pinned field icon never doubles up), which retires the app-side `startIcon={value === 'x' ? … : …}` mirroring of state the component already knows. `renderValue` is the seam for drawing the selection yourself — the description included (#5202).
  [feat] Item: new `layout` prop — `'stacked'` (default, unchanged) or `'inline'`, which keeps the description on the label's line with the description ellipsizing first. The inline row centers its two lines rather than sharing a baseline: two font sizes on one baseline make a line box taller than either line, which would push a fixed-height host off its size token. Every row built on `Item` gets the axis, `SelectorOption` included.

  [fix] Selector: the trigger is sized by padding rather than a fixed height, so it is the `--size-element-*` token for a one-line value (28/32/36) and exactly one text line taller for a two-line one (48/52/56). The token and a text line are both multiples of 4, so every trigger lands on the 4px rhythm and lines up with the Buttons and inputs beside it — and no prop chooses the height, the content does. It previously swapped the fixed height for a minimum whenever `renderValue` was passed, keyed on the prop being present rather than on the content needing the room: a one-line value measured 39px and a two-line one 58px at _every_ size, so the `size` prop stopped affecting the trigger at all. Inside an `InputGroup`, where the group pins the row, the relaxed height did nothing and the content bled 4px through its own border. The group owns the row now and the trigger clamps its own value box to it, so nothing a caller draws can paint over the rows above and below: a `SelectorOption` folds onto one line and ellipsizes, and any other node is cut off at the row's edge. The trigger also stops asserting a height floor of its own there, so a control sized above its group — `<InputGroup size="md">` around a `size="lg"` control — sits in the group's row instead of growing it. The trigger's line box is pinned to that same token rather than a ratio, so the coarse-pointer font bump — and any theme that changes `--font-size-base` — grows the glyphs without moving the control off its size token.

- `Slider` with `orientation="vertical"` now gets the same 24px touch hit area the horizontal one got: its track was still only 20px wide on coarse pointers, under the WCAG 2.5.8 AA minimum. The whole track is the tap target for both orientations — the fix that floored the horizontal track's block size did nothing for vertical, whose short axis is the inline one — so the inline size is now floored to 24px on touch, with the same `@media (pointer: coarse)` gate. The rail, fill, marks and thumb all center on the inline 50%, so nothing visible moves and desktop is untouched (#5173).
- `@astryxdesign/core/theme/syntax` is importable from a server component again: the presets are data, not client references (#5076).
  The subpath's barrel carried `'use client'`, and it is the only entry point for the syntax module. React therefore replaced _every_ export with a client reference for a server importer — including `dracula`, `oneLight`, `allSyntaxPresets`, `syntaxTokenDefaults` and `defineSyntaxTheme`, none of which need a boundary. Reading a preset in a Next.js server module (deriving a code-block ground, emitting theme CSS at build time) got a proxy instead of data, so `preset.tokens` was `undefined` and the failure surfaced far from its cause — the same import under plain Node worked perfectly.

  The directive now sits only on `SyntaxTheme.tsx`, the provider that actually needs it, so `SyntaxTheme` and `useSyntaxTheme` keep their client boundary while the data exports resolve as data. No API change.

#### Contributors

Thanks to everyone who contributed to this release:

- @cixzhang
- @ernestt
- @freddymeta
- @Geervan
- @HelloOjasMutreja
- @imdreamrunner
- @nynexman4464
- @rubyycheung

---

# 0.4.5

#### New Features

- BottomSheet: `snapPoints` makes the drag-to-resize stops the host's choice. A stop is the sheet's visible height, written as a viewport fraction (`0.5`), a percentage (`'50%'`), or a px length (`'320px'`) — matching `height`, where a bare number is also px and a string carries its unit. Fractions and percentages re-resolve when the viewport changes, so a sheet keeps the stop the user chose across a rotation, and swapping the points under a resting sheet re-anchors it the same way. A stop of a quarter of the sheet or less is a peek: it slides away rather than reflowing into a sliver, and thins the scrim. Taller stops are working surfaces, so they lay their content out and keep the scrim full — previously the shortest stop was always a peek, which would have thinned the backdrop of a half-height sheet (#5203).
  Behavior change, deliberate and not breaking: every sheet used to carry three built-in stops (14%, 50% and 92% of the viewport), so a drag could leave it resting somewhere the host never asked for. A sheet now opens and closes unless `snapPoints` says otherwise; pass `snapPoints={[0.14, 0.5, 0.92]}` to keep the old stops. No prop, type, or DOM output was removed or renamed, and swipe-to-dismiss, the height budgets, and mobile-keyboard accommodation are untouched.
- Astryx ships translations for 28 more locales. `packages/core/locales/` went from `en` and `fr-FR` to 30 files — Arabic, Catalan, Chinese (Simplified and Traditional), Czech, Danish, Dutch, Finnish, German, Greek, Hebrew, Hungarian, Italian, Japanese, Korean, Norwegian, Polish, Portuguese (Brazil and Portugal), Romanian, Russian, Serbian, Spanish, Swedish, Turkish, Ukrainian, Vietnamese and Afrikaans — covering every `@astryx.*` message the components announce or display (#5185).
  Nothing changes unless you ask for it: `InternationalizationProvider` still defaults to English, and the catalogs are loaded through the existing `./locales/*.json` export. An app that already passes a `locale` now gets translated component strings where it previously fell back to English.

  The catalogs come from Crowdin and are refreshed nightly (#5186), so a translation landing upstream reaches a release without anyone opening a PR by hand.

- DateRangeInput / Calendar: add `maxRangeSpan` and `minRangeSpan` to constrain the size of a selected range. Once a start date is picked, days outside the allowed window are disabled — e.g. `maxRangeSpan={7}` keeps the range within a 7-day window of the start (#5145).
- FormLayout: add `defaultOptionality` — set a form-wide default (`'optional'` or `'required'`) so only the exception carries a visible indicator. Under `'optional'` only `isRequired` fields show one; under `'required'` only `isOptional` fields do; a field that restates the default shows nothing. Under `'required'` the unmarked fields also expose `aria-required` so screen readers match what sighted users see — resolved on `aria-required` only, never the native `required` attribute. Unset keeps today's per-field behavior (#4791).
- Add `astryx-input-clear-button` theme target on the shared clear button wrapper. Themes can now control the clear button's height and hover independently of other ghost buttons — for example suppressing the hover fill or matching a different element size scale (#5093).

#### Fixes

- BottomSheet: a pull up from the scroll area now expands the sheet on iOS. Below the tallest detent, dragging up inside the content did nothing on a real device while the grab handle worked — the sheet took the gesture and then froze for the rest of the pull. iOS Safari raises PointerEvents for a finger under the same numeric id it puts in `Touch.identifier`, so the drag the touch path started was keyed to a live pointer: `beginDrag` captured that pointer, WebKit handed the capture straight back, and the `lostpointercapture` a millisecond later cancelled the drag. Touch-driven drags are now marked as such — they take no pointer capture, and `lostpointercapture`, `pointercancel` and `pointermove` for that same finger no longer cancel, end or double-drive them. Browsers that keep the two id spaces apart were never affected, which is why this only showed up on device (#5178).
- Calendar weekday headers now use compact CLDR stand-alone-short names for the selected locale, while preserving the existing `Su` / `Mo` / `Tu` English labels.
- Render generated id attributes on Markdown headings so Outline hash links scroll to their target. Heading slugs now come from parser helpers shared with parseOutlineFromMarkdown, and the components.heading override receives the generated id (#4765).
- StatusDot: pair each variant with a distinct built-in shape drawn from the system's semantic icon vocabulary — success a check, warning an exclamation, error a cross, neutral a ring, accent the plain filled dot — so status no longer relies on colour alone (WCAG 2.1 SC 1.4.1). The shapes mirror the marks `Banner`/`FieldStatus` render via `defaultIcons`, a different axis of consistency from `AvatarStatusDot`'s presence shapes (the two share only the neutral ring, intentionally). The diagonal check and cross take a slightly heavier stroke so they stay crisp and distinct at 8px. Also adds an `icon` prop for API parity with `AvatarStatusDot`: a rendered icon replaces the built-in glyph, while booleans and empty renders are ignored so `cond && <Icon />` stays safe. The built-in glyphs resolve through the icon registry under scoped `statusdot:<variant>` keys (the `richtext:*` precedent), so themes can reshape a variant's mark everywhere via `defineTheme({icons})` / `registerIcons` — including marks for augmented custom variants — while overrides of the standard 24px semantic icons deliberately do not leak into the 8px field. Themes can also target the new stable `astryx-statusdot-glyph` class and its `data-shape` attribute — a stroked inline `<svg>` painted from the dot's `currentColor` (#4373).
- `Table`'s row-expansion chevron now mirrors correctly under RTL. It previously rotated on expand with no RTL handling at all, so the directional glyph pointed the same way regardless of text direction, matching the pattern already used by `TreeListItem`'s chevron (#5153).

#### Contributors

Thanks to everyone who contributed to this release:

- @athz
- @bhamodi
- @cixzhang
- @freddymeta
- @HelloOjasMutreja
- @imdreamrunner
- @jiunshinn
- @nynexman4464

---

# 0.4.4

#### New Components

- Promote `BottomSheet` and `BottomSheetSwitcher` from the canary-only Lab package to Core. The stable package now includes their existing native-dialog, drag-detent, transition, and mobile-keyboard behavior, plus Core documentation and examples (#5080).

#### New Features

- `astryx template --cdn` writes a working no-build-step CDN starter page (#5068).
  A CDN starter is a template, so it joins the template family beside `--skeleton` rather than claiming a top-level command. It is a flag and not the positional `astryx template cdn` because the positional resolves against everything `discoverAll()` finds, where a `cdn` id would shadow a discovered template. `cdn.template.html` loads Astryx from jsDelivr and esm.sh with no bundler, no install and no build step, with every CDN URL pinned to the Astryx version you have installed — an unpinned CDN URL resolves to whatever is latest and is cached hard, so a page written today breaks tomorrow without being edited. An existing file is never clobbered; `--overwrite` replaces it, and `--json` returns the receipt.

  The annotations are the things that are load-bearing and silent when missing: `?external=react,react-dom` (without it esm.sh bundles a second React and every hook throws `Cannot read properties of null (reading 'useState')`), `react/jsx-runtime` in the import map (the published bundle imports it; omitting it fails the page with `Failed to resolve module specifier`), and a `font-family` on `body` (nothing in the stylesheets sets a document font, so `Button` — which is `font: inherit` — otherwise renders its label in the browser's default serif).

  Three more lessons came out of building a real app on it. The page now `<link>`s the theme's webfont from Google Fonts, because the theme _names_ Figtree and never loads it, so every viewer silently got the fallback stack (#5015 again). It imports the theme OBJECT and wraps in `<Theme theme={neutralTheme} mode="system">`, so light and dark follow the OS — the `data-astryx-theme` attribute alone scopes the stylesheet but cannot switch modes. And `#root:empty` carries a "Loading…" state, because ESM-from-CDN has real latency and a blank page reads as broken. Markup is `htm`, with a comment saying it is optional and `createElement` is the dependency-free alternative.

  A recipe that is only read is a recipe that is only assumed to work, so CI renders it: `.github/scripts/cdn-template-smoke-test.mjs` scaffolds the page with the real CLI and opens it in headless Chromium, failing on any console error, page error or failed request, and on a page that loads without rendering.

- DateTimeInput: expose `date-time-input-toggle-icon` (calendar glyph, with open/closed `state`) and `date-time-input-clock-icon` (leading time glyph) theme targets, so a theme can size and color the leading icons — matching the `date-input-toggle-icon` seam DateInput already offers (#5148).
- `defineTheme`: `color.accent` accepts a `[light, dark]` tuple (#2279)
  `ColorScaleConfig.accent` now takes either a single hex or a `[light, dark]` tuple, matching `TokenValue`. With a tuple, `expandColorScale` derives the light half of every generated `light-dark()` pair from the light seed's palettes and the dark half from the dark seed's, so each scheme gets a consistent derived palette (muted, on-accent, neutrals) instead of the `tokens['--color-accent']` workaround that skips scale generation. Single-string configs are unchanged, token for token. Also documents the precedence between `color` and `tokens` for accent-derived values: `tokens` entries win token by token, the `var(--color-accent)` reference tokens follow a `--color-accent` override at runtime, and the baked `--color-on-accent` stays derived from the `color.accent` seed.

#### Fixes

- Banner: `endContent` wraps to its own row on a narrow header instead of squeezing the title to one word per line (#5116).
- BottomSheet: a swipe that scrolls to the end of the sheet's content and keeps pulling now expands the sheet, instead of stopping dead at the last line. The handoff used to be decided once, when the finger landed: a gesture that started mid-content stayed a scroll for its whole life, so the natural motion — swipe up through the list, reach the bottom, keep pulling — never reached the sheet. Reaching the end of the content is now enough. The sheet is anchored at the point where the content ran out, so only the travel past it moves the sheet, and the pull is left to the content when the finger comes back down or when there is no taller detent to expand into (#5172).
- BottomSheet: an upward pull at the bottom of scrolled content no longer hijacks the gesture when the sheet is already fully expanded. It used to hand off to a sheet drag with nowhere to expand to, producing a rubber-band the release threw straight back, and — because the handoff swallows the rest of the gesture — leaving the content unscrollable until the finger lifted, so dragging back down collapsed the sheet instead of scrolling. The bottom edge now hands off only when a taller detent exists (#5161).
- BottomSheet: a sheet resting at a detent now follows the viewport. Its detents were resolved to pixels at gesture time and never revisited, so rotating the device or resizing the window left the sheet frozen at the old geometry — a half-height sheet covering three quarters of a shorter window, and a peek detent whose slide-down could exceed the new viewport entirely, leaving a modal dialog on screen with no sheet in it. Snap fractions are also read from the layout viewport now, so the mobile keyboard no longer moves the detents out from under the sheet it is measuring (#5159).
- BottomSheet keeps the page still when the mobile keyboard reveals a field the browser focused itself (#5158)
- Screen-reader announcements are now localizable. MultiSelector, Selector, Typeahead, FileInput, Tokenizer, and Lightbox spoke several live-region messages in hardcoded English — selection and result counts, file selections, token add/remove, and gallery position — so they stayed English under an `InternationalizationProvider`. They now resolve through the message catalog like the rest of the UI, and the counts use ICU plurals instead of appending an English "s", so locales with other plural rules read correctly (#4920).
- The editable text fields in `Selector`, `MultiSelector`, `Typeahead`, `DateInput`, `DateTimeInput`, `TimeInput`, and `NumberInput` no longer misinterpret the keydown that commits or cancels an IME composition (Korean/Japanese/Chinese input) as a command. Previously a composing Enter would select/toggle the highlighted option or commit a typed date, a composing Escape would exit `Typeahead`'s edit mode, and a composing arrow would step a time or number value — all before the composition finished. Each field now lets the IME finish first, matching the guard already in place for `BaseTypeahead` and the Chat composer (#4908).
- MobileNav: keep the drawer rendered until the native dialog has actually closed (#4290)
  `display` was driven by the `isOpen` prop, which flips during the commit, while `dialog.close()` only ran afterwards from an effect — so every close called `close()` on a dialog that was already `display: none` but still open and still in the top layer, and an open modal dialog blocks the whole document whether or not it is rendered. Safari 26.1 never un-blocked it, leaving the page inert with no JavaScript error. `display` now takes part in the transition with `transition-behavior: allow-discrete`, including when React's `<Activity mode="hidden">` hides the drawer inside AppShell, and the unmount close moves into its own effect so the deferred close is no longer cut off by its own cleanup. The close delay is derived from the hold in effect rather than assumed, because that hold is `--duration-medium` — a theme value, which the shipped y2k theme sets to exactly the 250ms the delay used to hard-code.
- `Switch` with `isLabelHidden` no longer reserves the label gap. The hidden label is `sr-only`, but its wrapper stayed a flex item, so the row still painted the 8px gap beside it: the field box measured 8px wider than the track it contains, and a hidden-label switch stopped 8px inside the edge every neighbouring control lined up on. The gap now collapses with the label, so the field is exactly as wide as the painted track — matching `CheckboxInput`, which already did this (#5112).
- Inputs (`statusVariant="tooltip"`): the focusable status button now opens its tooltip on hover inside `TextArea`, whose absolutely-positioned trailing slot is `pointer-events: none`. Keyboard focus already worked; pointer hover did not (#5147).

#### Other Changes

- Clear the mechanically fixable ESLint suppressions from the Bottom Sheet promotion: `BottomSheet` and `BottomSheetSwitcher` now use the React 19 context APIs (`<Context>` as provider, `use()`), the panel drops its duplicate body-element ref in favor of the one the gesture hook already tracks, and `useSheetGestures` reads `prefers-reduced-motion` through the shared `useMediaQuery` subscription so an open sheet follows a preference change (#5155).
- Remove the UMD bundle — it could not work with any React this package supports (#5068).
  `dist/astryx.umd.js` is no longer built or published, and with it go the `unpkg` and `jsdelivr` package fields, the `./astryx.umd.js` export and the `build:umd` step.

  Nobody has a migration to make, because there was no working configuration to migrate from. The bundle binds Astryx to `window.React` and `window.ReactDOM`, and React 19 does not ship a build that defines them: "UMD builds removed: To load React 19 with a script tag, we recommend using an ESM-based CDN such as esm.sh." `https://unpkg.com/react@19.2.0/umd/react.production.min.js` is a 404 where 18.3.1 is a 200. Our `peerDependencies` are `react >= 19.0.0`, so every supported React is one without a global for the bundle to bind to — it documented a path that never had an entrance.

  If you were loading it with an older React anyway, load the same components as modules instead: an import map for `react`, `react/jsx-runtime`, `react-dom`, `react-dom/client` and `@astryxdesign/core` (pinned, with `?external=react,react-dom`), then one `<script type="module">`. `astryx template --cdn` writes that page for you, pinned to your installed version and annotated; the recipe is also in the core README under "No build step (CDN)".

- `isImeKeyEvent` — the guard that stops an IME composition keystroke being read as a command — now lives at `@astryxdesign/core/utils` alongside the other pure helpers, with the reasoning for its two signals written down in one place. It stays exported from `@astryxdesign/core/hooks` for this release but is deprecated there: it is a plain predicate, not a hook, and that barrel is a `'use client'` boundary, so importing it from `hooks` pulls a server-safe function onto a client path. Move imports to `@astryxdesign/core/utils`; the `hooks` re-export will be removed in an upcoming major (#4907).

#### Contributors

Thanks to everyone who contributed to this release:

- @AKnassa
- @cixzhang
- @freddymeta
- @imdreamrunner
- @jiunshinn
- @nynexman4464

---

# 0.4.3

#### New Features

- New string utilities: `characterCount`, `firstCharacter`, and `truncateCharacters` — replacements for `.length`, `.charAt(0)`, and slice-based truncation that measure and cut user-visible strings by whole characters, so an emoji, flag, or accented letter counts as one and never gets split. Built on `Intl.Segmenter` with a code-point fallback.
- ComplexSelector: support ghost toolbar triggers, leading icons, popup alignment, and an imperative `handleRef` (open/close/toggle/isOpen) for programmatic control.
- `useContainerReveal`: two ways to control the reveal without reaching into the hook's private custom properties. `getContainerProps({hoverDelay})` gates the reveal on pointer dwell — the hover-intent idea Tooltip and HoverCard already have as `delay` — so a cursor sweeping down a list no longer lights up every row it grazes, and `getContainerProps({forceState})` pins the container's trigger state when something else owns the interaction (a scroll, a drag, an open row menu). Per element, `getContentRevealProps({forceVisibility})` pins how one child looks regardless of its container. Still CSS-only: no hover state in React, no re-render. Keyboard and touch are untouched — focus always reveals, `forceState: 'inactive'` and `forceVisibility: 'hidden'` both yield to `:focus-within`.

#### Fixes

- Banner: a dismissed banner no longer drops focus, a custom status no longer loses its ARIA role, and the info banner paints again under the neutral theme.
  Dismissing unmounted the focused dismiss button, so focus landed on `<body>` and a keyboard user lost their place in the page. Banner now records where focus entered from and returns it there, the same handoff `ToastViewport` makes for a dismissed toast. Measured in Chromium: `document.activeElement` was `BODY`, and is now the control the user tabbed in from.

  `BannerStatusMap` is documented as augmentable, but all four status lookups were closed `Record<BannerStatus, ...>` maps. Adding the augmentation the docs show produced four TypeScript errors inside `Banner.tsx` itself, which a consumer cannot fix, and at runtime an unknown status resolved to `undefined` for its icon, its background and its ARIA role, so the banner stopped being a live region at all. The lookups are partial now: an unrecognized status renders with no status fill, no default glyph and `role="status"`.

  A theme could not reach the banner's radius. `--_banner-radius` was declared in the doc file and in `derivedVarRegistry.ts`, but no rule read it, so a theme's `borderRadius` on the `banner` target expanded into a variable nothing consumed. The four card-silhouette radii read it now, falling back to `--radius-container`.

  Under `@astryxdesign/theme-neutral` the info banner had no background at all, light or dark: the override set `background-color` directly and forced `--color-accent-muted` to `transparent`, and a plain CSS property written by a theme lands in `@layer astryx-theme`, which StyleX's `@layer priority4` outranks. Info now goes through `--color-accent-muted` like the other three statuses and like the stone theme already did.

  Also in this change: `children={false}` (the ordinary `{cond && <ul/>}` idiom) no longer produces an expand toggle that opens an empty box, and `description=""` no longer leaves an empty 20px row, both via `isRenderable`; a long unbroken word in the title or description no longer forces the page into horizontal scrolling at a 320px viewport, measured at `document.scrollWidth` 529px before; and the content area's bottom border uses logical `border-block-end` alongside its inline siblings.

- Count and cut text the way people read it: the TextArea character counter (and its over-limit state and screen-reader announcements) counts user-perceived characters — an emoji is 1, not 2; PowerSearch token truncation no longer cuts an emoji or accented letter in half; Table's auto-generated headers capitalize astral-plane letters correctly; Avatar's initials now use the shared character utilities.
- ComplexSelector: honor the `sm`, `md`, and `lg` element-height tokens exactly.
- TreeList's `variant` axis is themeable, and a new guard keeps every extensible axis honest. `TreeListVariantMap` invites theme packages to add variants — its own JSDoc shows the module augmentation — but `themeProps('tree-list', {density})` never passed `variant`, so a custom variant type-checked, rendered, and produced no selector to style. It is passed now, and documented in the target's `visualProps` so `astryx theme build` stops calling it an unknown prop.
  `packages/core/src/theme/extensibleAxes.test.ts` is the third theming-drift guard, beside the ones covering `targets` and `vars`/`derived`. Those two check what a component renders against what it documents; neither looked at the open prop unions, which is why this went unnoticed. For every `*Map` that types a component prop, it now asserts the three places that have to agree: the interface is declared in the index a consumer augments (a re-export is invisible to both module augmentation and the CLI), the prop is reflected through `themeProps`, and it is documented as a visual prop. It reads the TypeScript AST rather than the type checker, and holds the map's OWNER accountable — a component forwarding `actionVariant` or `statusVariant` to the component that owns the map is not separately responsible for it.

  Registry maps that widen a set of NAMES rather than a visual prop (`IndicatorMap`, `IndicatorFamilyMap`) are out of scope by construction, not by allowlist: the guard only considers maps whose alias types a prop on a `*Props` interface.

- Security: reject `javascript:`, `vbscript:` and `data:text/html` URLs in the Markdown parser, so untrusted markdown can no longer produce an executable link href or image src; and fix `escapeRegExp` in `ChatTokenizedText`, whose character class closed early and left `]` and `\` unescaped, so token values containing them were injected raw into a `RegExp`
- `extends` now reaches the CSS. A theme that extended another built a stylesheet holding only the declarations it stated itself: the base's tokens, component overrides and surface rules were all absent, and because each theme is `@scope`d to its own `data-astryx-theme` value, loading the base's stylesheet alongside could not fill the gap either. Every consumer of an inheritance chain silently got stock geometry, elevation and type with a new palette painted over it (#5067). Nothing warned; the loss only showed up by diffing two generated stylesheets token by token.
  The cause was `theme build` shadowing its own inputs. It writes `<name>.js` next to `<name>.ts`, and the loader resolved a plain `./<name>` specifier to that generated artifact before the source — so the second build of a family read the artifact, which carries no `components` and exports `<name>Theme` rather than whatever the source exports. A named import that missed became `extends: undefined`, and `defineTheme` treated an absent base as no base at all. The loader now resolves source extensions first, which is also the resolution the author's TypeScript sees, so the CSS a build emits matches the theme that type-checked.

  Three things behind it are fixed too, so the failure cannot come back by another route. `defineTheme` **throws** when `extends` is present but is not a theme, naming the likely cause, instead of inheriting nothing — the one behavior change here, and it turns a silent stylesheet into a build error. A theme's `onDark`/`onLight` surfaces and its `__inputTokens` are now inherited like its tokens and components were, so a child no longer reverts its base's inverted-surface customizations to the defaults or loses its `[light, dark]` tuples. And a built theme module now carries the resolved `components` and surfaces alongside its tokens, so extending one — the `./built` subpath every shipped theme exposes — is no longer lossy. `theme build` also stopped hand-picking fields when it re-resolves a plain object theme file, which dropped `extends`, `color` and `syntax` on the way in.

  An extended theme is flat: everything it inherits is resolved into its own output, and its stylesheet stands alone. Measured on a 14-theme family (one base, 13 palettes extending it): each palette went from 25 custom properties and no component rules to the base's full 175 and 70, with its own colours still winning.

#### Contributors

Thanks to everyone who contributed to this release:

- @AKnassa
- @cixzhang
- @ernestt
- @Sunil56224972

---

# 0.4.2

#### New Features

- AvatarGroup: expose `size` on the `avatar-group-overflow` theming target so themes can style the "+N" overflow chip per size (matching `avatar-fallback`); the default chip font is unchanged (#5046).
- Chat: ChatMessageBubble accepts a `width` prop (numbers are pixels, strings pass through, e.g. `width="100%"`), following the sizing convention on Card and other containers. When set it replaces the bubble's default `max(80%, 280px)` width cap; when unset nothing changes. Combined with `variant="ghost"`, custom in-message content (an artifact card, attachment chips, a standalone ChatMessageMetadata) can now align with the bubble's text column at the full message-column width — previously the only workaround was hardcoding the bubble's private padding token at every call site. (#2574)
- `astryx theme template` writes an annotated theme template into your project (#5048).
  New sibling of `theme add`: where `add` starts you from a theme we ship, `template` starts you from a blank annotated one. `astryx init --features theme` calls the same leaf, so project setup writes it too — it previously printed a one-line hint and wrote nothing, which is the weakest form of the help a theme author needs, since the first problem is not knowing the command but not knowing what the theme surface contains. The file is `theme.template.ts`: every `defineTheme` field with a note on when to reach for it, the token families, the component override syntax, and the consumption steps (providing the theme, loading the fonts you name, building for SSR), each section naming the CLI command that prints its authoritative reference. An existing file is never clobbered.

  This came out of a vibe test (#5047): agents given an annotated template reached twice as far into the theme surface as agents given only the docs (17 component targets vs 8, and the only arm to use interaction states, custom variants and `onDark`), and shipped a third of the contrast defects.

  A template that lies is worse than no template, so its claims are machine-checked against live sources rather than trusted: `scripts/check-theme-template.test.mjs` fails when a `defineTheme` field is added and left undocumented, when a token family is missing from the inventory, when a CSS variable or component key it names does not exist, when it cites a docs topic that does not, or when a theme source drops its SYNC reference. `theme build` compiles it warning-free in CI, and the CLI typecheck now covers it.

#### Fixes

- Avatar: put the avatar box on the element that carries the `astryx-avatar` theme target, so a theme rule on the documented `size` axis resizes the whole avatar instead of growing the wrapper around a fixed-size circle; treat a whitespace-only `name` or `alt` as absent, so it falls through to the default icon rather than rendering an empty plate behind a blank accessible name; warn through the shared `useDevWarning` hook rather than a bare `console.warn` in the render body; and replace the phantom `<OnlineIndicator />` in the JSDoc example with the real `AvatarStatusDot` (#5030)
- CommandPaletteFooter: wire default keyboard-hint strings through useTranslator so they resolve from the locale catalog instead of being hardcoded English (#4506)
- `context-menu` component overrides now drive the menu's internal radius and padding vars. `ContextMenu.doc.mjs` has always documented `derived` entries mapping `borderRadius` → `--_dropdown-menu-radius` and `padding` → `--_dropdown-menu-padding`, but `derivedVarRegistry` had no `context-menu` key, so the mapping was dead: `components: {'context-menu': {base: {borderRadius: '12px'}}}` emitted `border-radius` alone and the menu kept reading its own `var(--_dropdown-menu-radius)`. The registry entry now matches the doc, as it already does for `dropdown-menu` (#4783).
- `useFocusTrap`: a modal surface with no tabbable controls keeps its programmatic focus target instead of letting Tab escape into the page behind it. A dialog that places initial focus on a `tabIndex={-1}` heading or panel had nowhere to advance to, so Tab walked straight out of the trap. `@astryxdesign/core/hooks` also exports `hasActiveFocusTrapEscape` and `isImeKeyEvent`, which coordinate nested traps and skip IME composition keys (#5023).
- Heading's `type` is a documented theming target, and the docs stop teaching a CSS variable that does not exist (#5016).
  `Heading` reflects `type` as a theme selector — `typography.scale` generates `heading: {'type:display-1' …}` rules for it — but `theming.targets` listed only `level` and `color`, so `astryx theme build` warned `Unknown prop "type" on component "heading"` on every theme that sets a type scale, including the shipped `neutralTheme`. The drift guard missed it twice over: it read a conditional spread (`{level, color, ...(type && {type})}`) as an unknown bag, and it only checked a component against a doc file in its own directory, so `Heading/` — documented from `Text/Text.doc.mjs` — was never checked at all. Both are fixed, which brings three more previously unchecked directories under the guard.

  Separately, the theme docs' component-override example set `--button-press-scale`, which no component defines: copying it produces CSS that silently never applies. It now sets a real public var, and the example no longer declares the same `button` key twice.

- DateTimeInput: the focused-and-empty time placeholder hints ("e.g., 2:30 PM" / "e.g., 14:30") now route through the i18n translator so they localize with the rest of the component. Adds `@astryx.dateTimeInput.timeHint12h` and `@astryx.dateTimeInput.timeHint24h` to the `en` catalog. The live-region "Invalid date" / "Invalid time" announcements this PR also covered landed first in #4363 and now reuse that PR's `@astryx.dateInput.invalidDate` and `@astryx.timeInput.invalidTime` keys. (#4546)
- Floating layers now declare their own body type instead of inheriting it. The layer container already set `font-family`; it now sets `font-size` and `line-height` from `--text-body-size` / `--text-body-leading` alongside it. A layer is hosted wherever its trigger sits, so any content that did not set its own size took the ambient one — the same Tooltip, Popover or HoverCard rendered at 13px from a caption and at 20px from a lede. Content that goes through `Text`, or sets a size itself (Tooltip's label, DropdownMenu items, NavMenu headings), is unaffected: those already declared their own and still win. Anything that was relying on inheriting a non-body size now renders at the body size and should set one explicitly (#5064).
- Added a `@astryx.listInput.*` catalog namespace to `packages/core/locales/en.json` so the lab `ListInput` component's action labels, empty state, reorder instructions, and live announcements can be translated. `ListInput` previously hardcoded every visible and assistive-technology-facing string (#4967).
- Layer: use an inert `<template>` marker to find each context layer's actual JSX position. Safe positions stay inline; positions inside a paragraph, link, button, inline formatting, or a structurally restricted container portal to the nearest safe ancestor. Corrective portals keep CSS custom properties inheriting from that nearby host while preserving direction and writing mode, and `show()` passes the trigger as the popover's invoker `source`. The new `lazyMount` option waits until opening to resolve and mount content; HoverCard uses it so rich content never enters an invalid paragraph during initial render and unmounts again when hidden. Other context layers keep their existing closed-content behavior (#5039).
- Two guards left failing on `main` by their own landings, so every PR since has been red through no fault of its own. #4963 gave Thumbnail's remove button a coarse-pointer hit-area var and did not document it, which the derived-var guard reads as an undocumented private var; the var is an `inset` on a `::after` overlay, so it is documented as private and listed alongside the other vars no standard CSS property maps onto. #5026 moved `borderDefaults` into `CoreTokenName` — the landing the theme-template guard was explicitly waiting for (its comment says "when #5017 lands, this guard starts requiring the template to cover it") — so the template's token inventory now names `--border-width`.
- Menus that open on hover no longer close when you click them. A hover-opened menu is already open under the cursor by the time the pointer arrives, so the click that naturally follows was dismissing it — fixed for TopNavMegaMenu in #4555, and now shared: the hover→click guard lives in `useMenuHover`, so TopNavMenu, TopNavHeading, SideNavHeading and DropdownMenuSubMenu get it too, and TopNavMegaMenu runs on the shared machine instead of its own copy. Also from the consolidation: opening a menu moves focus into it synchronously rather than a frame later, closing one returns focus to its trigger instead of dropping it to the document, and keyboard activation always opens rather than toggling an open menu shut (#3121)
- SideNav: a hardening pass over the family, driven by the component audit. Accessibility, theming, passthrough and code-health defects across `SideNavItem`, `SideNavHeading`, `SideNavSection`, `SideNavCollapseButton` and the `navItemStyles` module the TopNav drawer modes share — the motion guards, the untranslated flyout name, the hand-rolled visually-hidden block, the dropped `...rest`, the missing theming state, the uncleaned timers, and the hand-rolled hover intent, which is now the shared `useMenuHover`. Nav rows also adopt the shared focus outline from #4654, so a keyboard-focused row is ringed with the system's `2px --color-accent` at `3px` offset in every theme instead of falling through to the browser's own ring; in a split-action row the link and the chevron toggle are ringed individually, since they are separate tab stops.
  Three visual fixes came out of review. The collapsed submenu flyout was painting a second, square-cornered surface inside the popover's rounded one, and insetting its own content by 4px instead of standing off the rail — both gone, with the gap moved to the positioned layer where `DropdownMenu` keeps it. The selected row now survives `forced-colors: active`: it marked the current page with a 6% background tint, which forced colors flatten away entirely, and it now paints `Highlight`/`HighlightText` like `ToggleButton` and `SegmentedControlItem`. And the footer icon row comes out one size, with the collapse chevron centred rather than seated 2.42px high on a stray text baseline.

  Four changes are visible to a consumer. **Hover on a collapsed item's flyout** is now gated on `(hover: hover)` and only closes on `mouseleave` if hover opened it, and a click-to-dismiss no longer springs back open under a stationary pointer. **The footer icon rows cascade a `sm` size** through `SizeContext`, so an unsized `Button` passed to `footerIcons` now matches the built-in collapse button instead of rendering a size larger — pass an explicit `size` to opt out. **`SideNavCollapseButton` takes a `size`**, for placements outside the nav that have no row to inherit from. And **`SideNavCollapseButton` takes the controlled `collapsible` config** — the same `{isCollapsed, onCollapsedChange}` object handed to SideNav — which is how a button rendered outside the sidenav now stays in step with it. `handleRef` on both components is deprecated in its favour: the state the consumer already owns reaches the button through props, with no imperative handle in between.

- Slider: the thumb no longer overhangs the component's own box at `min` and `max`. It was centred on the container edge at either extreme, leaving half of it (10px) outside the control, where a tight container clipped it or it overlapped the next element. Thumb travel is now inset by half a thumb at each end — the geometry a native `input[type=range]` uses — and the fill, the marks and the pointer-to-value mapping share that inset, so the thumb also stays under the pointer that grabbed it instead of jumping by up to half its width. Vertical sliders and both thumbs of a range slider are fixed the same way (#5051).
- Interactive controls meet the WCAG 2.5.8 AA 24px minimum on touch. The Slider track (20px tall, and clickable along its whole length) floors its block size to 24px, Thumbnail's remove button grows its tappable area through a `::after` overlay, and `sm` CheckboxInput, RadioListItem and Switch floor to a 24px target centred on the control. All of it is gated on `@media (pointer: coarse)`, and only the invisible tappable area changes — rails, thumbs and glyphs stay exactly where they were, and fine-pointer rendering is untouched (#4963, #4964).

#### Documentation

- Ten private (`--_*`) component theming vars are now documented in their owning component's `theming.vars[]`: `--_avatar-group-overlap`, `--_card-elevation`, `--_card-ring`, `--_codeblock-gutter-width`, `--_item-label-color`, `--_item-description-color`, `--_tab-indicator-bottom`, `--_tree-indent` (plus `--_dropdown-menu-radius`/`--_dropdown-menu-padding`, which Breadcrumbs sets on a child menu). They were declared in source and described nowhere, because the drift guard skipped the `--_` prefix outright (#4783).

#### Contributors

Thanks to everyone who contributed to this release:

- @cixzhang
- @freddymeta
- @HelloOjasMutreja
- @imdreamrunner
- @jiunshinn
- @rubyycheung

---

# 0.4.1

#### New Features

- The keyboard focus ring is now a theme token. `--focus-outline-width`, `--focus-outline-style`, `--focus-outline-color` and `--focus-outline-offset` drive every ring in core and lab, so one override in a theme's `tokens` restyles focus system-wide; the color tracks `--color-accent` unless a theme sets it. The `:focus-visible` condition is not themeable, so a themed ring still cannot appear for pointer users (#4973).
  Every ring is now drawn from the shared focus-outline utility rather than written out per component, and a lint rule keeps it that way. Two corrections come with that: the rings that had drifted to a 2px offset (Slider, Switch, Lightbox, ProgressBar, and lab's InfoTip, Step and LogStream) now sit at the documented 3px, and the buttons inside a field — the Date, DateRange and DateTime calendar toggles, the DateRange presets, and the Selector and MultiSelector status buttons — draw the standard 2px ring instead of a 1px one.
- AspectRatio, Badge, Blockquote, Card, Center, Code, Grid, Section, Skeleton and VisuallyHidden no longer carry `'use client'` (#823). Each was verified against its transitive import graph to use no React client API, no client-only dependency and no module-level mutable state, so they can now render in a React Server Component without forcing a client boundary. A new `serverSafeComponents.test.ts` derives the server-safe set from the import graph and fails if one of these components later gains a client dependency without restoring the directive — including the transitive case `scripts/check-use-client.mjs` cannot see.
  Not a breaking change: no prop, type or export changed, and `'use client'` is inert outside an RSC bundler. Client consumers keep working identically, though bundlers may lay these modules out in different chunks now that they are no longer client entry points.
- Selector and MultiSelector: `indicatorPosition` places the selection indicator on either edge of the option row — `start` or `end`, logical, so it follows RTL. Defaults keep today's rendering (`end` for Selector's check, `start` for MultiSelector's checkbox); a start-positioned check reserves its column on every row so labels stay aligned (#4993).

#### Fixes

- TimeInput: announce arrow-key time stepping via the polite live region (also in DateTimeInput), localize the "Invalid date"/"Invalid time" live-region messages through the i18n catalog, and use long timezone names in Timestamp's AT-facing aria-label while keeping the short form visible (#4363)
- Banner: the 'banner-icon' theme target now rides on the default status Icon itself instead of its layout wrapper, so theme component overrides ('banner-icon' + 'status:X') that set color actually reach the glyph. The Icon keeps its existing color variant (info still renders accent) and same-element rules in @layer astryx-theme win over it, so default rendering is unchanged. Contract note: '.astryx-banner-icon' now matches the icon element rather than the wrapper when the default icon renders; a theme that used the target for wrapper layout (margin, alignment) now styles the glyph instead. With a custom `icon` node the target stays on the layout-only wrapper, since core never injects props into consumer elements (#4166)
- CommandPalette: discard in-flight search responses when the palette closes (#3896)
  Closing the palette while a search was still in flight let the late response re-commit the abandoned query and results into the closed palette, which showed up as a ghost query on reopen. Closing now invalidates any pending request.
- FileInput: validation messages, default placeholder, drag hint, and file-selected announcements now go through the i18n translator instead of hardcoded English. DropdownMenuRadioGroup: consumer `xstyle` prop is composed into styles instead of being dropped (#4589).
- The popup theme targets added in #4991 sat on the wrong element. `astryx-complex-selector-popup` and `astryx-multi-selector-popup` were rendered on each component's own content box — the one with the padding and the scroll — while the element that paints the popup's background, radius and elevation is the surface `usePopover` creates one level above it. A theme reaching for those classes to restyle a popup got a rule that could not paint it. Both now land on the surface, so they do what they were documented to do.
  `Selector` gains the matching `astryx-selector-popup`, which its sibling `MultiSelector` had and it did not.

  New: every popup surface carries the shared `astryx-popover-surface` class, so a theme can style all of them at once, and `usePopover` accepts a `surfaceTarget` naming the surface for a component that wants its own target there. A component cannot do this for itself — the surface belongs to `usePopover`, so any class it renders itself lands inside.

- Selector's menu now clears the trigger by the standard `--spacing-1` gap whenever it is not overlaying it — every explicit `placement`, and search mode. It was the only anchored menu in the system sitting flush against its anchor; DropdownMenu, MultiSelector, ComplexSelector, Popover, and Tooltip all use this clearance. The default selected-item overlay is unchanged: it owns its block geometry and is meant to sit on the trigger (#5003).
- Selector, MultiSelector: the dropdown panel's search field is now part of the panel instead of a bordered input dropped into it. The panel is already a bordered, elevated surface, so the nested `TextInput` drew a box inside a box; the row now renders a leading magnifier, a borderless input, and the shared clear (✕) button, with a full-bleed divider between it and the options — the same shape the command palette already uses. Focus is shown as an inset ring on the row, rounded to the panel's own corners. Section titles move from labeled dividers to plain secondary headings, matching DropdownMenu and CommandPaletteGroup, and MultiSelector no longer draws a rule under select-all. Behavior, keyboard handling, and accessible names are unchanged; MultiSelector's search row additionally stays put while the options scroll under it. New theme targets: `astryx-selector-search`, `astryx-selector-section-heading`, `astryx-multi-selector-search`, `astryx-multi-selector-section-heading`; anything that styled the dropdown search through `astryx-text-input` needs to move to those.
- TableRow: honor `className` and `style` on the `<tr>`. `TableRowProps` extends `BaseProps`, but both were spread before `mergeProps()` and then overwritten by the component's own StyleX classes, so a consumer's values silently had no effect. They are now merged through `mergeProps()` alongside the row's StyleX styles, the same way `TableCell` and `TableHeaderCell` already handle them, in both the in-`Table` and standalone rendering paths. The Astryx theme classes and striped/hover styling are unchanged (#4391).

#### Contributors

Thanks to everyone who contributed to this release:

- @AKnassa
- @arham766
- @bhamodi
- @cixzhang
- @Eloitor
- @jiunshinn

---

# 0.4.0

#### Breaking Changes

- DropdownMenu's two item modes are peers again. Compound mode gains a `DropdownMenuDivider` component (aliased as `ContextMenuDivider` and `BreadcrumbMenuDivider`), which the data path also renders, so `{type: 'divider'}` and `<DropdownMenuDivider />` produce identical DOM, spacing, and theme target. Data mode gains `endContent` and `description`, so an `items` row can carry a shortcut hint or secondary text without dropping to compound mode. Its `label` widens from `string` to `ReactNode`, matching compound mode: the narrowing existed only because rows were keyed by label, and they no longer are (#4953).
  The bare names now belong to those components, so the data-mode option types take the `Data` suffix their sibling `DropdownMenuItemData` already carries: `DropdownMenuDivider` → `DropdownMenuDividerData`, `ContextMenuDivider` → `ContextMenuDividerData`, `BreadcrumbMenuDivider` → `BreadcrumbMenuDividerData`. TypeScript cannot re-export a value and a type under one name from a single barrel, so the rename is what makes the components exportable at all. Run `astryx upgrade --apply` to rewrite the type imports; a missed one fails at compile time rather than silently.
- Remove the `dropdown-menu-radio-dot` theme target. Menu radio rows draw the shared radio indicator now, so the dot is the indicator's dot: target `radio-indicator-dot` (the legacy `radio-dot` name still matches it too). The row's circle keeps its `dropdown-menu-radio` target, so only the dot moved. (#4890)
  Runtime themes are not validated — a theme keyed on the removed target keeps compiling and silently stops matching — so `astryx upgrade` now carries `rename-dropdown-menu-radio-dot-target`, which rewrites the key and the `astryx-dropdown-menu-radio-dot` class. The new target is app-wide rather than menu-only (there is no menu-only dot element left to address), so the codemod leaves a TODO at each site it rewrites.
- useTableRowExpansion is now a detail-panel plugin: it expands a full-width panel below a row via renderExpanded(item), and useTableRowExpansionState is removed. For hierarchical/tree tables (child rows that reuse the parent columns), migrate to useTableTreeData + useTableTreeState. See the migration example on the useTableRowExpansion docs. (#4609)
  **Codemod:** `npx astryx upgrade --apply` runs `migrate-table-rowexpansion-to-tree`, which rewrites tree-mode `useTableRowExpansion` call sites onto `useTableTreeData` + `useTableTreeState`.

#### New Features

- Avatar: the fallback surface (initials and default icon) is now a direct theme target via the stable `astryx-avatar-fallback` class. Theme its background, text color, font weight, and per-size font size through the `avatar-fallback` component key (e.g. `components: { 'avatar-fallback': { base: { backgroundColor: '...' }, 'size:sm': { fontSize: '...' } } }`), replacing the internal `--_avatar-fallback-*` derived vars. (#4716)
- CodeBlock: the built-in copy button is now a themeable ghost `IconButton` with a default "Copy code" tooltip, reachable via the stable `astryx-codeblock-copy-button` class (theme it through the `codeblock-copy-button` component key). Restyle or keep the copy control without turning it off and re-implementing it. The tooltip stays "Copy code" after copying — the copy→check icon flip is the confirmation. (#4867)
  [feat] New `useClipboard` hook (`@astryxdesign/core/hooks`): the shared copy-to-clipboard behavior — clipboard write, a transient `isCopied` flag with its reset timer, and an optional polite screen-reader announcement. CodeBlock and Timestamp now build their copy buttons on it; reach for it directly for copy affordances that are not a plain icon button.
- CodeBlock: add `codeblock-header` and `codeblock-title` theme targets on the header row and the title/language-label element. A theme can now restyle the header (e.g. padding) and the title (e.g. font size) directly, instead of reaching them through structural `> div:first-child > div > span` selectors that reverse-engineer the header layout. Both reflect the `size`/`language`(`/container`) visual props like the root. (#4943)
- DateInput, DateRangeInput, and DateTimeInput now accept a `weekStartsOn` prop that sets the first day of the week in the calendar popover (0 = Sunday … 6 = Saturday, or a three-letter day name like `"mon"`). It forwards to the underlying Calendar, whose default stays Sunday, so existing usage is unchanged. (#4745)
- Selector, MultiSelector and Typeahead expose their empty ("No results found") state as a themeable target (#4756, #4862) — `astryx-selector-empty-state`, `astryx-multi-selector-empty-state` and `astryx-typeahead-empty-state`. Themes can restyle the empty state without the fragile structural selectors consumers previously had to reach for. (The Selector search field is a TextInput, so its placeholder is reachable today via `.astryx-text-input::placeholder`; a Selector-scoped placeholder seam would require a TextInput change and is left as a possible follow-up.)
- EmptyState: add `empty-state-title` and `empty-state-description` theme targets on the title heading and the description. A theme can now restyle the title and description directly (e.g. font size, color, per `variant`) instead of reaching them through structural `> div:has(> :is(h1..h6))` selectors that reverse-engineer which element is which. (#4942)
- Every clearable input now renders its clear (✕) affordance through the shared `InputClearButton`, so the glyph is themeable in one place via the `astryx-input-clear-icon` target instead of a per-component target or a fragile descendant selector. The component-specific `astryx-{date-input,date-range-input,selector,multi-selector}-clear-icon` targets still render for a deprecation window — migrate to `input-clear-icon`. The clear glyph is now a consistent secondary-color icon with a ghost-button hover affordance across the whole family. (#4876)
- The input family (TextInput, NumberInput, DateInput, DateRangeInput, DateTimeInput, TimeInput, TextArea, Tokenizer) now reflects its disabled state on the root theming target as `data-disabled="disabled"` plus a `.disabled` variant (only when disabled), so a theme can gate its own hover/border treatment on the disabled state — mirroring the existing `status`/`size` reflection — instead of relying on structural `:has(input:disabled)` CSS. This closes a documented theming gap for downstream consumers. (#4794)
- useLayer takes an `offset` for clearance from the anchor, derived from the resolved placement, and the layer wrappers stop hand-rolling it (#4803)
- DropdownMenu rows take two new options (#4953). `DropdownMenuItem` takes `hasCloseOnSelect`, so a plain action can report its result on the item instead of closing the menu. `DropdownMenuItemData` and `DropdownMenuSection` take an optional `id`, the row's stable React key for a menu whose items reorder or filter (also reaching MoreMenu, ContextMenu and Breadcrumbs, which share the type).
- DropdownMenuItem now accepts a `variant` prop (`'default' | 'destructive'`); `'destructive'` renders the label, description, and icon in the error color for dangerous actions like Delete. The data-driven `items` API accepts the same `variant` field, and because ContextMenu shares the menu-item data shape, context-menu items get it too. Defaults to `'default'`, so existing menus are unchanged. (#4753)
- MultiSelector: dropdown option rows are themeable through a single (#4628)
  `multi-selector-option` target, carrying the row's `size` and its `select-all`, `selected` and `disabled` states — so a theme can express "selected option at large" or restyle just the Select All row. Row typography moved from the label span onto the row, so one override reaches both the fallback label and `renderOption` content; custom option content now inherits the row's font and disabled color.
- NumberInput: render a text-backed spinbutton that supports formatted display values, explicit wheel and keyboard stepping, and opt-in trailing increment/decrement buttons. Existing wheel stepping remains enabled by default and can now be disabled with `isWheelEnabled={false}` (#4896).
- ComplexSelector and MultiSelector: add `astryx-complex-selector-popup` and `astryx-multi-selector-popup` theme targets on the popup surface, so a theme can style the popup — background, border, radius, elevation, padding — through `defineTheme` instead of a structural selector or a fork. Both components already targeted their trigger but nothing in the popup, which is the part that has to match the rest of an app's menus. The target sits on the popup's content box rather than the layer element: `useLayer` zeroes the layer's borders, padding and background, so the content box is the surface that actually paints. Purely additive — default rendering is unchanged. (#4991)
- TextInput, TextArea, NumberInput: add `isReadOnly`. The value is shown at full opacity and still submits with the form, but cannot be edited — the "visible, locked, still sent" case that `isDisabled` deliberately does not cover, since disabled controls are excluded from submission. Read-only fields are not dimmed and stay in the tab order, matching the native `readonly` semantics they compile to; `isDisabled` takes precedence when both are set, and the clear button is hidden while read-only. The state is reflected on the root theming target as `data-readonly="readonly"`, alongside the existing `data-disabled`, so a theme can paint it without structural `:has(input:read-only)` CSS. `isReadOnly` already existed on CheckboxInput, CheckboxList, and PowerSearch; the remaining text-ish inputs (DateInput, DateRangeInput, DateTimeInput, TimeInput, Tokenizer) do not have it yet. (#4816)
- Selector/MultiSelector: two additive theming seams (#4626, #4627). A `selector-check` theme target on the selected-row checkmark lets themes restyle or hide it (e.g. to compose their own selected indicator via `renderOption`) instead of relying on a structural sibling selector, and `data-disabled` now reflects on the trigger for theme-driven disabled styling. Rotation styles remain on the indicator-icon target. Default appearance is unchanged.
- Table: `contextMenuActions` now accept a `variant: 'destructive'` for dangerous row/column actions (e.g. Delete), rendered in the error color to match ContextMenu. (#4864)
- TextArea: theme the text inset by writing `paddingInline` on the `textarea` component key — it now drives the internal `--_textarea-inline-padding` var instead of landing on the wrapper. The wrapper stays flush (`padding: 0`), so the native resize grip keeps its true-corner position and the start icon, status, and character counter stay aligned to the text. Adds a `replaces` option to derived var entries for the general "map a property onto a var without emitting it on the class element" case. (#4793)
- Add themeable indicators — the componentized check, checkbox, and radio visuals. `defineTheme({indicators: {check: RadioIndicator}})` replaces one by name, and every component drawing it follows. (#4712)
  Theme targets now follow the component-name convention: `checkbox-indicator`, `radio-indicator`, `radio-indicator-dot`. The old names (`checkbox`, `radio`, `radio-dot`) are still emitted on the same element, so existing themes keep working — migrate at your convenience; they go away in the next major.

  Migration: menu radios use those shared targets now. `dropdown-menu-radio-dot` is removed — target `radio-indicator-dot`; `astryx upgrade` rewrites it for you.

- TreeList: two additive changes. (1) A fully flat tree — one with no expandable items at all — now renders its rows flush instead of reserving an empty chevron-alignment column that nothing lines up under; any tree that has at least one expandable item keeps the same per-level alignment as before, so only fully flat trees change shape. (2) Adds a themeable `--tree-list-row-gap` for the inter-row gap, defaulting to a subtle `2px` (`var(--spacing-0-5)`) separation — matching the inter-row gap `List` and `DropdownMenu` already ship — so this shifts the default spacing of every tree by that amount; set it on the `tree-list` target to widen or close it. The gap rides collapse-proof `padding-block` on the row wrapper (not the paintable `tree-list-item` target), and the connector guides span it automatically without overhanging the last row. (#4540)

#### Fixes

- AlertDialog: correct the inline role and pin initial focus (#4887).
  The `isInline` preview path no longer renders `role="alertdialog"`. That role promises a modal interruption — focus trap, inert page, explicit dismissal — and the inline path is an always-present, non-modal preview with none of it. It now renders `role="group"`, keeping the title and description associated through `aria-labelledby`/`aria-describedby`.

  The cancel button now carries `data-autofocus`, so the documented "initial focus goes to the cancel button" behavior is pinned instead of depending on cancel happening to be the first focusable node in the footer. Docs now name and link the WAI-ARIA APG Alert Dialog pattern the component implements, and gain an anatomy section.

- AppShell: two a11y fixes to the shell chrome (#4944).
  The mobile top bar rendered for a sidenav-only layout is now a `banner` landmark, matching the header region of a layout that has a `topNav`. Previously the page's landmark structure changed depending on which nav slots it filled: a screen-reader user on a small viewport got no banner region at all. When a `banner` slot is present the existing header keeps the role, so there is still exactly one.

  The skip link now draws the shared Astryx focus ring instead of the browser default outline, so it follows `--color-accent` and matches every other focusable surface in a custom theme.

- Avatar: fallback initials no longer break for names containing emoji or other multi-codepoint characters. (#4750)
- ChatLayoutScrollButton: the default (label-less) state now renders as icon-only, with the translated "Scroll to bottom" string as the accessible name only. It was previously missing `isIconOnly` on its inner `Button`, so Button's default (visible-text) contract rendered the translation as clipped visible text inside the circular button instead. (#4854)
- Chat: the dictation and scroll buttons now carry their `chat-dictation-button` and `chat-layout-scroll-button` theme targets, and ChatSendButton no longer clobbers a consumer's `className` (#4634).
- ChatToolCalls: hover backgrounds on grouped call rows (2+ calls) now keep their full `--radius-element` rounding instead of getting clipped flat on the inline edges. `groupContentInner` — the `overflow: hidden` clip boundary the expand/collapse height animation needs — was missing the padding/negative-margin pair that absorbs the row-level hover-background overhang, so the overhang extended past the clip boundary and got cut off. Matches the ungrouped single-call row, which has no such wrapper to clip it. (#4858)
- `ComplexSelector`'s popup now keeps its 4px clearance from the trigger when `placement="above"`, matching `placement="below"` and `Popover`. The popup's margin was set on `marginBlockStart` only, which is correct for a popup opening downward but leaves zero clearance on the edge that matters when it opens upward. (#4861)
- ComplexSelector: the trigger's focus ring is now keyboard-only. It was drawn from `:focus-within`, which also matches a mouse click — open the popover with the mouse, dismiss it with the mouse, and the restored focus left a pointer user staring at a keyboard affordance. It now uses the shared `:has(:focus-visible)` ring, which also brings the outline to the documented 3px offset. (#4935)
- DateInput and DateTimeInput no longer steal focus when the open calendar is dismissed by clicking another control. Clicking the field to open the calendar, then clicking the time input (DateTimeInput) or any other element, kept yanking focus back to the date input because the popover's close handler always refocused it. It now restores focus only when the dismiss left focus detached (Escape, or a click on empty space), so a click that lands focus elsewhere is respected. (#4974)
- TextInput, TextArea, NumberInput: a disabled field is no longer submitted with the form when `disabledMessage` is set. Showing the reason tooltip requires swapping the native `disabled` attribute for `aria-disabled` + `readOnly`, so the message stays discoverable by pointer and keyboard — but read-only fields still serialize into `FormData`, and these three kept their `name`, so a locked field posted its value. They now withhold the `name` while disabled, matching CheckboxInput and Switch (which forward the name only when enabled) and the hidden-input carriers in Selector, MultiSelector, Slider, and Tokenizer (which mirror `disabled`). Adds form-participation coverage to all three so the guarantee is pinned. (#4811)
- DropdownMenu/MoreMenu: opening with a pointer no longer highlights the first item as if it were selected (#4477). Initial focus now follows the input modality: keyboard opens (Enter/Space/ArrowDown on the trigger) still focus the first enabled item per the APG menu-button pattern, while pointer opens focus the menu container itself so the first ArrowDown moves to item 1. Synthesized clicks (detail 0, e.g. screen reader activation) and programmatic controlled opens keep the first-item focus behavior. Covers data-driven items mode, compound mode, and MoreMenu, which share the open path.
- EmptyState: the rest spread sits before the contract `role`, so a consumer can no longer clobber the landmark role the component guarantees (#4826).
- Indicator: a falsy `children` no longer deletes the state mark. The busy idiom a host actually writes — `children={isBusy && <Spinner/>}` — passes `false` when it is not busy, and `false` is neither `null` nor caught by `??`, so all three indicators took the children path, rendered nothing in it, and dropped the checkmark, the checkbox tick and the radio dot on every selected row. They now use `isRenderable`, so only children that actually render replace the mark. `0` still counts as content, since it renders the character "0". (#4913)
  CheckIndicator's children slot also reserves the glyph's box and carries its color, so swapping a Spinner in no longer shifts the row or loses the disabled shade.

  Fixes #4893.

- Consolidate general interactive focus outlines onto one definition — 2px `--color-accent` at 3px offset, matching Design Conventions. (#4654)
  Most general controls had drifted to a 2px offset; Button, Calendar, Dialog and Pagination were the ones still on spec. Their value wins, so a focus ring on the drifted components (Link, TabList, Token, TreeList, SegmentedControl, TopNav items) now sits 1px further from its control.

  Destructive buttons keep their error-colored ring, and `--button-focus-offset` is unchanged. Form and input focus treatments are out of scope.

- `<Heading type="display-N">` now sizes correctly under every theme, matching `Text`'s behavior. `generateTypeScaleComponents()` only emitted `level:N`-keyed CSS rules for `heading`, with no `type:display-N` counterpart — so as soon as a theme supplied `typography.scale`, the generated theme-layer CSS's `level:N` rule was the only one present and silently won regardless of `type`, discarding the prop. A theme with no typography config was unaffected, which made the bug look intermittent. (#4859)
- theme: `color.contrast: 'high'` now strengthens border tokens too — the emphasized border tone is pulled toward mid-scale (stronger against both light and dark surfaces) and the subtle hairline's alpha is doubled, so structural boundaries stay perceivable in high-contrast themes instead of only text/icons changing. (#4529)
- Icons render through `<Icon>` and carry their component's theme target (#4838).
  Styling-only wrappers around rotating icons are gone, and each rotation now sits on the icon element that already carries the component's theme target — so a theme reaches the glyph and its open/closed transform through one selector. No new theme targets: Selector, MultiSelector and ComplexSelector consolidate onto their existing `*-indicator-icon` targets, and the Table plugins and TreeList simply shed redundant wrapper elements.

  Where an RTL mirror sat on a separate parent element, it is folded into each state's transform (`scaleX(-1) rotate(...)`) so one element carries both. In the Table plugins that mirror was inert — `transform` does not apply to a non-replaced inline box — so RTL disclosure chevrons now mirror correctly where they silently did not before.

  Registry glyphs in SideNav, TopNav, Collapsible, TreeList and Breadcrumbs now render through `<Icon>` instead of `useIcon()` inside a hand-written `<span>`. Those spans were a weaker reimplementation of `<Icon>`, which already resolves the same glyph and renders a span carrying merged `className`/`style`/`xstyle` plus the `astryx-icon` theme target. The converted sites gain that target, and the node count is unchanged. `useIcon()` keeps its place for the cases that resolve a glyph _without_ rendering it: MoreMenu and ChatSendButton pass the node as a default for a consumer-overridable prop, which `<Icon>` cannot express.

  Also adds the `@astryx/no-wrapper-transform` lint rule (warn) for `<div>`/`<span>` wrappers that exist to transform the icon inside them.

- Indicator: a caller can no longer un-hide or focus a decorative indicator (#4921, #4947).
  `IndicatorProps` now omits `aria-hidden`, `role`, `aria-label`, `aria-labelledby` and `tabIndex` — passing `role` or `tabIndex` is a compile error — and each indicator emits its own `aria-hidden` after `{...rest}`, so a forwarded one cannot win. Un-hiding an indicator had it announced next to the control that owns the accessible name, saying the same thing twice; a tab stop on one is a focusable node inside a hidden subtree, an axe `aria-hidden-focus` violation.

  Nothing is stripped: every other prop, including a forwarded `aria-label`, still reaches the DOM, where it is inert inside an `aria-hidden` subtree. Note that TypeScript exempts hyphenated JSX attributes from excess-property checking, so the type alone cannot reject `aria-*`; the attribute order is what enforces it. `tabIndex` is a plain identifier, so its omission stands on its own.

  Also corrects two doc claims: a replacement must render `children` when they will actually draw something (`isRenderable`, not `children ?? mark`), and "passing `role` is a compile error" holds for a literal attribute — a spread bypasses excess-property checking.

  Fixes #4918.

- A DropdownMenu item closes the menu on activation even when it carries no `onClick`, and a data-mode row that changes its own label keeps its identity instead of remounting and dropping focus (#4953)
- Fix `mergeRefs` cleanup so object refs are cleared and callback refs without
  cleanup functions still receive `null` when a merged ref returns cleanup (#4901).
- MoreMenu forwards `placement` and `alignment` to its DropdownMenu. Both were part of the underlying menu's API but were dropped on the floor by the wrapper, so an overflow menu — the one component whose job is a trailing-edge affordance — could not ask to be end-aligned; it only looked right when the layer happened to collision-flip. Defaults are unchanged: MoreMenu passes the props straight through, so DropdownMenu's `'below'` / `'start'` still apply. (#4952)
- Pagination: vertically center the prev/next caret icons. The RTL mirror wrapped each chevron in a `display: contents` span, which dropped the icon out of the button's flex-centering context so the glyph sat a few pixels high. The mirror transform now rides on the `Icon` directly via `xstyle`, so the icon stays a centered flex child and still flips under RTL — no wrapper element. (#4723)
- ProgressBar: a theme can size the target mark again without `!important`. The mark's `width`/`height` were plain StyleX declarations, so a `progressbar-mark` override only landed where `@layer astryx-theme` outranks the component atomics — in a source-build app that compiles StyleX without `useCSSLayers` the atomics are unlayered and beat every theme rule, leaving no way to resize the tick but an unlayered `!important` rule. The dimensions now travel as derived vars with no competing declaration, so the same `defineTheme` entry lands in either build. Theme authoring is unchanged; a mark's color is still a plain declaration and still depends on the layer order. (#4970)
- ProgressBar marks take their color from what they sit on: the fill variant's on-color inside the filled area, the emphasized divider color out on the track (#4741)
- CommandPalette, ComplexSelector and ContextMenu: a consumer's `onClick`/`onMouseEnter` is composed with the component's own handler instead of being overwritten by it, and `{...props}` no longer lands after the props the component must control (#4725).
- CheckboxInput, Switch: a `required` control that is disabled with a `disabledMessage` no longer blocks the whole form from submitting. Showing the reason tooltip swaps the native `disabled` attribute for `aria-disabled`, which leaves the control subject to constraint validation — so an unchecked required checkbox (or an off required switch) the user has been told they cannot touch made the form permanently unsubmittable, with the browser reporting a validation error against a control they had no way to satisfy. Both now detach from the form via `form=""` while focusable-disabled, matching a natively disabled control and the treatment RadioListItem already applied. Enabled controls are unaffected — a required, unchecked checkbox still blocks submission as it should. (#4815)
- `useScrollLock`: coordinate concurrent locks with a shared counter, so overlays closing out of order no longer unlock the body early or leave it stuck locked. (#4788)
- Selector: keep the selected option text aligned with the closed trigger across every menu position by measuring untransformed layout geometry during the popover entry animation. (#4802)
- Drop the shared trigger-icon wrapper in Selector, MultiSelector and ComplexSelector — each trigger icon is now the element that carries its own box, colour and theme target. (#4846)
  The wrapper set a 16px box and `--color-icon-secondary` on a span with no theme target of its own, shared by two different affordances: the status glyph and the disclosure chevron. `<Icon>` already provides both (`size="sm"` is the same 16px box, `color="secondary"` the same token), so the wrapper only stood between a theme and the icons — and made the two affordances share a node they never should have shared.
- Selector selects by typing, matching a native select (#3764)
  Typing a printable character on a focused, closed Selector now selects the matching option — tab to a state picker, press "C", get "CA" — instead of doing nothing until the menu is opened. Repeated presses cycle through options sharing a first letter, and spaces count as match characters ("new y" reaches "New York"). With the menu open, typing moves the highlight and Enter commits, as before. With `hasSearch`, typing on the closed trigger opens the popup and seeds the search input.

  Matching reuses the shared `useTypeahead` hook, so Selector behaves like the other collections (menus, listboxes). Because a match committed from the closed trigger changes the value without opening the popup or moving focus, the new selection is announced through `useAnnounce`.

  `useCombobox` no longer implements typeahead itself; callers that want it compose `useTypeahead` and run it ahead of the combobox key handler.

  Adopting the shared hook exposed two matching bugs in it, fixed here — so `DropdownMenu`, `ContextMenu` and `NavHeadingMenu` improve too. A single-character search now starts _after_ the current item, as native `<select>` and the APG pattern do, instead of only advancing on a repeated press: pressing a letter that the focused item already begins with used to do nothing at all. And with nothing focused the search now genuinely starts at the top, rather than wrapping onto the last item first. Characters composed with Option/Alt (`Option+a` → "å") count as typeahead again, so accented labels stay reachable.

- SideNav: `footer` content now centers when the nav is collapsed, matching how `children` already centers. `stickyBottomCollapsed` (the collapsed-rail wrapper for `footer`) was missing `alignItems: 'center'`, which its sibling `scrollableCollapsed` (the collapsed-rail wrapper for `children`) already had — so full-width footer content (e.g. an icon-only button) stretched to the collapsed rail's width instead of centering. (#4852)
- SideNav: the collapsed icon-only `SideNavHeading` trigger with a `menu` no longer omits its popover's anchor. The trigger's ref callback wasn't forwarding to `usePopover`'s `triggerRef`, so the menu popover had no CSS anchor to position against and fell back to the viewport corner instead of opening next to the trigger. (#4850)
- Stepper: localize the "Optional" step affordance via the new `@astryx.step.optional` message key so it translates like the rest of the component. No visual change in English. (#4872)
- `useStreamingText` no longer renders a broken glyph (a lone surrogate, or a partial ZWJ emoji sequence) for one frame when its fixed-code-unit reveal cadence happens to land inside a surrogate pair or multi-codepoint emoji. The rendered slice now snaps back to the nearest grapheme cluster boundary via `Intl.Segmenter` (with a surrogate-pair-safe fallback where it's unavailable); the reveal cadence itself is unchanged. Also corrected the hook's doc comment, which inaccurately described the cadence as advancing on word/syntax boundaries — it always advanced by fixed code units. (#4866)
- TextArea: no longer reserves trailing space for the on-field status icon when `statusVariant="detached"`. The detached variant surfaces its status glyph in the message box below the field and renders no on-field icon, so the reserved inset pushed the text in for an icon that never appeared. Trailing space is now reserved only when the spinner or on-field status icon actually renders. (#4940)
- TextArea: remove the duplicate wrapper padding so the text and native resize grip sit flush to the edge. The wrapper's `padding: 0` shorthand was being overridden by the shared input-wrapper longhands, leaving the inset applied twice; it now zeroes with matching longhands. (#4813)
- TopNavMegaMenu: fix the hover-then-click flicker where clicking a nav item after hovering dismissed the mega menu. The trigger is registered as the native invoker for its `popover="auto"` panel and uses a Vercel-style hover→click guard, so the click that naturally follows a hover confirms and pins the panel open instead of toggling it shut. Native outside-click, Escape dismissal, and sibling-popover exclusivity are preserved. Click/keyboard opens are pinned (persist past mouse-leave); hover opens stay transient. Keyboard activation (Enter/Space) always opens and moves focus into the panel, while touch/click without a preceding hover toggles cleanly (#3121)
- TreeList typeahead now cycles through same-letter matches instead of stalling, and searches from the top when no treeitem is focused. (#4844)
- `BaseTypeahead` (and everything built on it — `Typeahead`, `Tokenizer`, `PowerSearch`'s content-search field) no longer misinterprets the Enter keydown that commits an IME composition (Korean/Japanese/Chinese input) as "accept the highlighted suggestion". Previously that keydown both selected the highlighted result and cleared the input, so the still-composing syllable landed in the freshly-cleared field and became its own spurious second selection on the next Enter. Also guarded the Enter-to-save handler in `PowerSearchEditPopover`, which had the same gap when typing a CJK filter value. (#4860)
- useLongPress: cancel the pending long-press when a second finger joins mid-press. Previously `onTouchStart` and `onTouchMove` only checked `touches.length` on their own event, so a second finger arriving after a single-finger press had already started the timer (e.g. a pinch-to-zoom gesture) fell through the `touches.length !== 1` guard without ever clearing it — `onLongPress` could still fire with the stale first-finger point mid-gesture. No API change. (#4735)
- useContainerReveal scopes the reveal by inheritance instead of a marker pool: no dev warnings on lists longer than six rows, and isEnabled now takes effect after mount (#4955)

#### Documentation

- AppShell: the two worked examples of the `mobileNav` escape hatch passed `title` to `MobileNav`, which does not accept it: `MobileNavProps` omits the native `title` attribute and the drawer heading prop is `header`. Copying either example produced a type error and a drawer with no heading. Both now say `header`. The doc also gains an anatomy list and accessibility guidance covering the landmark structure AppShell owns. (#4944)
- AspectRatio: document the sizing contract and add the missing anatomy. The box takes its width from its container and derives its height from the ratio, so constraining only the height clamps it off ratio (pass `width: 'auto'` alongside) and a shrink-to-fit parent collapses it to zero width. Both are now in the component JSDoc and in `bestPractices`, along with the single-child expectation: with `fit` set, every direct child is stretched to fill the box. The image-gallery example block now uses `var(--radius-element)` instead of a raw `8`. (#4984)
- StatusDot: document the builder's accessibility responsibilities in the usage dos and don'ts. A color-only dot is not fully accessible in isolation, so the guidance now says to use it as a binary present/absent signal, pair it with a label, carry the status as a shape via an icon, and — if neither fits — convey the status through an accessible alternative. (#4737)

#### Other Changes

- `DropdownMenuItemData` — the shape of one entry in a `DropdownMenu` / `ContextMenu` / `MoreMenu` `items` array — is now sourced from `DropdownMenuItemProps` (`Pick`) instead of restating `icon`, `onClick`, `isDisabled`, and `variant` by hand, and `renderDropdownItems` forwards the whole item to `DropdownMenuItem` rather than copying it field by field. The data and compound APIs describe the same item, so they can no longer drift — exposing another item prop to the data API is now one key in the `Pick`. The type is structurally identical to before (`label` is still narrowed to `string`, since the renderer keys rows by it) and rendering is unchanged. (#4809)
- Remove 15 `<div>`/`<span>` wrappers that existed only to style the single Astryx component inside them (Carousel, Lightbox, MobileNav, Pagination, Switch, TopNav, TopNavMegaMenu, Table row-expansion menu icon); the styles now sit on that component's own root via `xstyle` — or, for Pagination's page-size Selector, its documented `width` prop. No API change, but the rendered DOM has one fewer node at each site, so anything selecting on that structure is affected: `patch`, not `[breaking]`, because the removed nodes were internal implementation with no documented contract, no theme target, and no stable class. Two rendering defects the wrappers were causing are fixed as a side effect: the Lightbox prev/next chevrons and the Pagination first/last chevrons were 2.5-3px off their button's vertical centre. (#4775)

#### Contributors

Thanks to everyone who contributed to this release:

- @AKnassa
- @alex-js-ltd
- @athz
- @cixzhang
- @czarandy
- @ernestt
- @freddymeta
- @HelloOjasMutreja
- @humbertovirtudes
- @imdreamrunner
- @jiunshinn
- @josephfarina

---

# 0.3.0

#### Breaking Changes

- DropdownMenuRadioGroup now takes a required `label` prop that names the group for assistive tech (applied as aria-label), replacing the previous optional `aria-label`/`aria-labelledby` passthrough -- rename `aria-label="..."` to `label="..."` (pass `aria-labelledby` via base props instead when a visible label already exists). This also covers the ContextMenu/Breadcrumb re-exports (ContextMenuRadioGroup, BreadcrumbMenuRadioGroup). Also fixes ContextMenu to close the menu on Tab per the APG menu pattern.
- Core — the authoring surfaces move to `@astryxdesign/cli/authoring`. `@astryxdesign/core/authoring` (`createIntegration`/`createPageTemplate`/`createBlockTemplate`/`createComponentDoc`/`createFunctionDoc`/`createDoc` and their types) and `@astryxdesign/core/config` (`createConfig` + `AstryxConfig`) are removed. The doc-type vocabulary re-exported from `@astryxdesign/core` (`ComponentDoc`, `ReferenceDoc`, `ComponentPropDoc`, `ComponentTranslationDoc`, …) is now a deprecated alias that re-exports from `@astryxdesign/cli/authoring` and will be removed next release. Author docs/configs/integrations as plain objects and import types from `@astryxdesign/cli/authoring`; `astryx upgrade` repoints existing imports automatically.
- Remove long-deprecated compatibility APIs from core and CLI. Run `astryx upgrade` first to migrate the supported replacements for authoring imports, Dialog logical positions, Switch label spacing, and Table root props.

#### New Features

- Carousel: add `hasLoop` for wrap-around scrolling (next at the end returns to the start, prev at the start jumps to the end; navigation buttons stay active at both edges) and a `handleRef` imperative handle (`CarouselHandle`) exposing `scrollNext`, `scrollPrev`, `scrollTo(index)`, `canScrollNext()`, and `canScrollPrev()` for programmatic control.
- Center: add `padding`, `paddingInline`, `paddingBlock` (spacing-scale inner padding) props. These match the existing `padding` props on `Stack`, `Card`, `LayoutContent`, and `LayoutPanel`, so centered page content no longer needs inline `style={{}}` or `xstyle` wrappers for basic padding.
- ComplexSelector: add a rich custom selector shell with accessible button/popover behavior, async change actions, and optional grid keyboard navigation.
- `defineTheme`: make `color.accent` optional (#2279)
  A theme can now restyle the neutral ramp (`neutralStyle`, `contrast`) without adopting an accent. An accent-less config seeds the neutral palettes from the default accent's hue but leaves `--color-accent`, `--color-accent-muted` and `--color-on-accent` ungenerated, so they fall through to the token defaults — the same fall-through `expandColorScale` already applies to status, categorical and on-dark tokens. Configs that pass an accent are unchanged, token for token.
- Dialog: add logical `start`/`end` offsets to the `position` prop and deprecate the physical `left`/`right`. `start`/`end` map to `inset-inline-start`/`inset-inline-end`, so a positioned dialog mirrors correctly under RTL (start hugs the inline-start edge — left in LTR, right in RTL). The physical `left`/`right` still work unchanged and never mirror (non-breaking); they are now `@deprecated` and will be removed in a future major. When both a logical offset and its physical counterpart are set, the logical one wins. A codemod (`migrate-dialog-position-to-logical`, v0.2.1) rewrites `position={{left, right}}` to `{{start, end}}`.
- DropdownMenuCheckboxItem now composes CheckboxInput so its checkmark matches CheckboxListItem and the standard checkbox theming slots apply. The checkbox stays decorative — the menu row keeps role="menuitemcheckbox" and owns the checked state.
- DropdownMenu now accepts an `alignment` prop for matching Popover/HoverCard positioning parity.
- DropdownMenu: expose themeable slots for the section heading, menu divider, submenu indicator icon, and checked radio dot (`astryx-dropdown-menu-section-heading`, `astryx-dropdown-menu-divider`, `astryx-dropdown-menu-indicator-icon`, `astryx-dropdown-menu-radio-dot`) so themes can style them directly instead of relying on structural selectors. ContextMenu inherits these via shared item rendering.
- Add a ghost trigger variant for Selector and MultiSelector for toolbar-style controls, with ghost status messages detached by default.
- Field/FieldStatus: add `astryx-input-status-icon` and `astryx-field-status-icon` theme targets on the field status glyph, so consumers can recolor, resize, and restyle it — per status — via `defineTheme` instead of a fragile descendant selector or raw CSS. `astryx-input-status-icon` sits on the on-field icon shared by all bordered inputs across the `attached` and `tooltip` status variants and reflects `data-size`/`data-status`; `astryx-field-status-icon` sits on the detached message box's leading icon and reflects `data-type`. Purely additive — default rendering is unchanged.
- Markdown: expose per-block spacing to theming. Every block type now renders a stable theme target — `astryx-markdown-heading`, `-paragraph`, `-list`, `-codeblock`, `-blockquote`, `-table`, `-hr`, and `-image` — so a theme can tune the gap around any block (`marginBlockStart`/`marginBlockEnd`) via `defineTheme` instead of overriding global spacing tokens or reaching for fragile `[role="paragraph"]`-style descendant selectors. Each target reflects `data-density` (so spacing can differ per `default`/`compact`), and the heading target additionally reflects `data-level` (1–6) for per-level spacing. Targets apply only to the default render path — a custom `components.heading`/`code`/`blockquote`/`hr`/`image` continues to own its own styling. Purely additive — default rendering is unchanged.
- Pagination: add an `input` variant — an editable page-number box (a `NumberInput`, so it clamps to `[1, totalPages]` with integer-only semantics) flanked by first/last («/») buttons, rendering `Page [ n ] / N`. Navigation is page-based via the existing `onChange`. The leading noun is set with an open `pageLabel` prop (defaults to the localized "Page"; pass `pageLabel="Row"` to relabel it). Also adds a `step` prop controlling how many pages the prev/next buttons advance per click (default 1, clamped to range); when greater than 1 the buttons' accessible names reflect the stride. Adds `chevronsLeft`/`chevronsRight` icons. The first/last/prev/next carets now also carry a hover tooltip (the same localized, step-aware label already used as their accessible name), so sighted users get the affordance the icon-only buttons previously exposed only to assistive tech. (#4248)
- ProgressBar: add an opt-in `marks` prop that draws fixed target lines on the track at values in the same 0..max scale as `value` (e.g. a goal or threshold). Marks stay visible whether progress is below or past them; each mark requires a `label` (its accessible name, revealed via a tooltip on hover/focus), and marks are ignored in indeterminate mode. The mark tick is directly themeable via the `progressbar-mark` target — a theme sets `backgroundColor`, `width`, and `height` on it (a larger height makes a "flag" tick that overhangs the bar symmetrically above and below). The mark tooltip is loaded lazily, so a ProgressBar with no marks bundles no tooltip code. Named `marks` (with a `ProgressBarMark` type) to match the `marks` prop on Slider.
- Icon registry: `registerIcons()` now accepts arbitrary extension keys (not just built-in `IconName`s), so libraries can augment the icon map with their own keys. Add `getExtendedIcon(name, fallback)` — resolves an extension key, preferring a theme-registered icon over a caller-supplied default. This lets library-shipped icons (e.g. the lab `RichTextEditorToolbar`'s `richtext:*` glyphs) be overridden per-theme without forking.
- SelectableCard: pressing Enter now toggles selection, in addition to Space, when the card is focused
- Selector & MultiSelector: the dropdown search field is now a `TextInput`, so it gains that component's built-in affordances — a leading search magnifier (`startIcon`) rendered inside the field and a trailing clear (✕) button (`hasClear`) that appears once a query is typed and resets + refocuses on click. The field now shares TextInput's border, focus ring, and sizing, so it matches every other Astryx input instead of being a bespoke control. No new props or theme targets. Non-breaking, but note the magnifier is a new default glyph, so existing `hasSearch` dropdowns gain a leading icon.
- Add SSR-friendly theme and icon registry resolution so semantic icons can resolve from a registered theme name without relying on React context.
- Table: `astryx-table-cell` and `astryx-table-header-cell` now reflect the active row density as `data-density` (`compact`/`balanced`/`spacious`), so a theme can override cell padding per density via `defineTheme`. Previously the density split lived entirely in internal StyleX classes with no `density:*` hook on the cell target, so a `components: { 'table-cell': {...} }` entry could only set one padding for all densities — it could not, for example, hold the inline inset constant while varying only the block padding per density. The targets now carry the hook (`{className: 'astryx-table-cell', visualProps: ['density']}`), enabling `components: { 'table-cell': { 'density:balanced': { paddingBlock: '12px' } } }`. Purely additive — default padding is unchanged.
- Table: `useTableTreeData` gains an opt-in `hasRowClickExpansion` prop. When set, clicking anywhere on an expandable row toggles it, in addition to the chevron. Clicks on interactive cell content or a text selection are ignored, leaf rows stay inert, and it is a no-op on flat data. (#4142)
- Text & Heading: `color` is now theme-extensible. `TextColor` is derived from a new `TextColorMap` interface (same technique as `ButtonVariantMap` etc.), so a theme can add custom text colors — `astryx theme build` generates the module augmentation when it sees new `color:*` values on Text/Heading overrides, and consumers can augment `TextColorMap` manually for type safety. A custom color renders as a stable class (`astryx-text.<color>` / `astryx-heading.<color>`) that theme CSS paints, falling back to the `primary` StyleX baseline so it never renders unstyled. Built-in colors are unchanged.
- Timestamp: the hover surface is now a single copyable hover card for every timestamp that shows one. Relative timestamps and `tooltipEntries`-configured timestamps share one card, replacing the old read-only tooltip; the default single row carries the full absolute time and is itself copyable.
  Each `tooltipEntries` row opts into a copy button via `isCopyable` (default `false`) — so a card can mix human-readable, read-only rows with a copyable machine value (e.g. show local and UTC for reading, but only let readers grab the `system_date_time` value). Copyable rows render their copy button in a dedicated trailing action column so the buttons align down one column regardless of value width; that column is only reserved when some row is copyable, so a fully read-only card carries no trailing gutter. The card's labels use the `supporting` text role (the secondary, quieter register that is Timestamp's own default) and values the `body` role.
- Timestamp: add a `relative_short` format — the compact sibling of `relative`. It uses the same tier boundaries and present/clock-skew handling but renders abbreviated units for space-constrained surfaces (chat metadata, dense tables, chips): `now`, `30s ago`, `5m ago`, `2h ago`, `1d ago`, `3mo ago`, `2y ago`, and `in 5m` for future times. Months render as `mo` (not `m`) so they never collide with minutes; the short form is always numeric (no `yesterday` idiom). Like `relative`, it keeps the full absolute date as its accessible name and gets the hover tooltip and live updates. Additive — existing formats are unchanged.
- Timestamp: rename the recently added `system_unix` format to `unix_seconds`. The value is absolute Unix time in whole seconds since the epoch — not a wall-clock `system_*` rendering — so it does not belong to the `system_*` family; the explicit unit name also leaves room for a future `unix_millis`. Behavior is unchanged (zone-independent epoch seconds). This renames a format value that only just shipped, before it has consumers.
- Timestamp: two additions. (1) A new `system_unix` format renders the value as Unix time in whole seconds since the epoch (e.g. `1771520400`) — an absolute, zone-independent machine value, useful as a copyable `tooltipEntries` row alongside human-readable zones. It joins the `system_*` machine-readable family and, being absolute, ignores any tooltip time zone. (2) The copyable hover card's copy button now shows a visible `Copy` tooltip on hover/focus (flipping to `Copied` after a copy, in step with the icon), so the affordance is discoverable for sighted users; the full `Copy <value>` string remains the button's aria-label for assistive tech. Both additive — no change to existing formats or default rendering.
- Add `useContainerReveal` — a headless hook for revealing (or concealing) content when its container is hovered or focused. CSS-driven (no hover state in JS, no re-render on hover) and accessible by construction: revealed content stays in the accessibility tree and tab order, reveals on keyboard focus-within, and stays visible on touch. Callers spread `getContainerProps()` on the container and `getContentRevealProps()` on each child; no StyleX authoring required. `Thumbnail`'s `showRemoveOn="hover"` now uses this hook internally (no API change).

#### Fixes

- AppShell: make the skip-link target focusable (tabIndex={-1}), localize the skip-link label via the i18n catalog, and expose the header region as a banner landmark
- CheckboxList: each option is a single tab stop — the checkbox is the option's only focusable control (WCAG 4.1.2). The row is now an enlarged click/tap target that delegates surface clicks to the checkbox via a new `interactiveRef` prop on Item/ListItem (the useClickableContainer pattern), replacing the internal invisible row button. `interactiveRef` is mutually exclusive with `onClick`/`href`.
- Resizable, TabMenu: two collection ARIA minors (WCAG 4.1.2) — Resizable's collapsed handle clamps `aria-valuenow` to `aria-valuemin` and announces a localized "Collapsed" via `aria-valuetext`, and TabMenu overflow options are `menuitemradio` with `aria-checked` (APG menu-button single-select) instead of `menuitem` + `aria-current`.
- core: preserve state indication for painted controls (Switch, CheckboxInput, RadioList, SegmentedControl, ToggleButton, Skeleton) under forced colors / Windows High Contrast (WCAG 1.4.11)
- i18n: localize remaining hardcoded assistive-tech strings (AvatarGroup overflow label, CodeBlock copy announcement, Button loading announcement, MetadataList show more/less, Table row-expansion context-menu actions, keyboard hint)
- i18n: add `@astryx.step.*` catalog keys (`goToStep`, `goToStepWithStatus`, `status.completed`/`status.warning`/`status.error`) backing the lab Stepper's localized status text and clickable-step accessible names.
- Lightbox: add keyboard zoom (Enter/Space on the image, `+`/`-`) and arrow-key panning while zoomed, with polite announcements (WCAG 2.1.1)
- Selector: convey MultiSelector select-all partial state in its accessible name, mark Selector/MultiSelector empty-state messages presentational inside the listbox, and remove Typeahead's collapsed input from the Tab order while a token is shown
- Toast: announce toasts via the persistent singleton live regions instead of per-toast regions that mount together with their content
- theme: guarantee WCAG contrast for generated color token pairs — text-on-surface pairs are asserted at >= 4.5:1 and non-text UI pairs at >= 3:1 (WCAG 1.4.3/1.4.11), with `--color-border-emphasized` tone-bumped in generation until it clears 3:1 against the generated surface
- Token: render the remove button as a sibling of the link instead of nesting it inside the anchor when both `href` and `onRemove` are provided. The token surface now delegates to the link via `useClickableContainer`, so clicking anywhere on the token (including with middle-click or cmd/ctrl+click to open in a new tab) activates the link, while the remove button keeps handling its own clicks.
- theme build: generated custom Button variants now type-check through the public `@astryxdesign/core/Button` subpath.
- Use spacing tokens for ChatComposerDrawer bar handle dimensions.
- ChatLayout no longer shows a phantom scrollbar in self-scroll mode when messages don't fill the viewport. The root is now a flex column: the message area flexes to fill the space the composer dock doesn't need, so the sticky dock's natural height is part of the 100% instead of overflowing past it by exactly the dock height. Long conversations still scroll and the dock still sticks; external-scrollRef mode (fixed dock) is unchanged.
- Deprecate the `isRtl` option on `useListFocus` and `useGridFocus`. Right-to-left arrow-key direction is now auto-detected from the container, so the explicit override is redundant and will be removed in an upcoming major — omit it and RTL is handled automatically.
- DropdownMenu now reports uncontrolled native open/close transitions and restores focus to the trigger after native popover dismissals.
- DropdownMenu: a submenu trigger no longer shows a second highlight when hovered while another item still holds focus — hover now moves the single focus-driven highlight onto the trigger, matching regular menu items
- CheckboxInput & Switch: clicking the field description now forwards to the control (the whole label area is one hit target), while clicks on interactive content inside a description (links, buttons) are left alone. No new prop or accessibility-tree change — the description stays a sibling of the label, so it isn't folded into the control's accessible name.
- FieldLabel: localize the "Required"/"Optional" indicator through the i18n runtime instead of hardcoding English, so consumers can translate it via `InternationalizationProvider` (#4508).
- useContainerReveal: eliminate the exit flicker on the default (non-layout-preserved) reveal. Hidden content flips `position: static -> absolute` discretely, which previously snapped it out of layout flow at full opacity before the fade could run. The flip now participates in the transition with `transition-behavior: allow-discrete` and a state-conditional delay, so it stays in flow until the opacity fade finishes on exit while remaining immediate on entry. Content stays in the accessibility tree and tab order throughout.
- Selector and MultiSelector: with `statusVariant="detached"`, the on-field status icon is no longer shown inside the trigger. The detached message box already renders its own leading status icon, so the field keeps its chevron indicator instead of duplicating the glyph — matching the bordered inputs.
- Dynamic `import()` specifiers now get their mandatory `.js` extension in the published ESM dist — `babel-plugin-add-extensions` only rewrote static import/export declarations, so the lazy Tooltip specifier in `Text`, `Heading` and `Timestamp` shipped extensionless and strict-ESM consumers (Rspack, webpack `fullySpecified`, Node ESM) failed to resolve any component importing them. A new post-build gate (`scripts/check-fully-specified.mjs`) now fails any build whose dist ships an extensionless relative specifier. (#4569)
- TopNavMegaMenu: keep the desktop mega-menu panel within the viewport — cap its height to the space below the nav (scrolling internally) and clamp its width — so a tall or wide menu no longer overflows the screen edge and clips content
- Lightbox: make backdrop click dismissal actually reachable
  The dismiss check only matched clicks on the dialog element itself, but the layout container fills the entire transparent dialog, so clicks on the dark area around the media always landed on the container and never closed the lightbox. Clicks on the container now dismiss too, and a pan drag that ends over the backdrop is ignored.
- Markdown streaming perf tests declare explicit timeouts matching their own budgets, instead of relying on vitest's 5s default
- MetadataList: a numeric `columns` value is honored with stacked labels. `columns={3}` previously fell back to the responsive `repeat(auto-fill, minmax(280px, 1fr))` grid whenever labels were stacked (the default for multi-column lists), so the documented fixed column count only worked with `label={{position: 'start'}}`. The grid template now covers both label positions — `repeat(n, 1fr)` for stacked labels, `repeat(n, auto 1fr)` for side labels — and resolves through a StyleX dynamic style instead of an inline `style` object.
- MultiSelector: remove the trigger button's own focus outline so it no
  longer doubles the field wrapper's focus ring. The wrapper renders a single `:focus-within` ring, matching `Selector` and the other bordered inputs.
- NumberInput: hide the browser's native number spinners so the field matches the component's own visual treatment across browsers, and stop a focused wheel gesture (which steps the value) from also scrolling an ancestor container. Keyboard stepping and the `spinbutton` role are unchanged, so there is no accessibility impact.
- Pagination: mirror the prev/next chevrons under RTL with CSS (the shared `scaleX(-1)` mirror) instead of reading the ambient direction in JS. The controls now flip purely from an ancestor's `dir`, matching Calendar and the rest of the library — so they render correctly on the server with no hydration flash. No API change; `aria-label`s are unchanged.
- Popover: expose wrapper role and modal options so non-dialog popup content can own its semantics.
- Add a shared `rtlStyles.centerInline(blockOffset)` helper for horizontally centering an absolutely-positioned, auto-width element on the inline axis, with an optional block-axis offset folded into the same transform. It intentionally uses physical `left: 50%` + `translateX(-50%)` — both reference the same physical edge, so the pair is direction-symmetric and centers identically in LTR and RTL. A logical `insetInlineStart: 50%` anchor would flip in RTL while the physical translate does not, shifting the element off-center by its own width. This is the one case where physical `left` is correct, so the single sanctioned `no-physical-properties` suppression lives in the helper rather than at each call site.
  The `@astryx/no-physical-properties` rule now recognises this `left: '50%'` + centering `translate` idiom and points offenders at the helper instead of wrongly suggesting a logical rename.
- The RTL physical→logical migration is complete, so promote the `@astryx/no-physical-properties` lint rule from `warn` to `error` in both the recommended and strict tiers. This gates against future physical-property regressions now that the core package is clean (the one sanctioned physical suppression lives in `rtlStyles.centerInline`).
- RTL Phase 4c — make three animated/interactive behaviors direction-aware under RTL: the ProgressBar indeterminate bar now slides along the reading flow (right → left) instead of always physically left → right; the Switch thumb mirrors on toggle (off-thumb on the reading-start side, on-thumb on the reading-end side, per Material/iOS convention); and horizontal Layer enter animations (Popover/DropdownMenu/HoverCard/Selector placement start/end) now nudge in from the correct physical side. Vertical Layer entrances are unchanged (direction-neutral). LTR behavior is identical.
- Complete the RTL physical→logical CSS migration across the core package: the final components (Avatar, Banner, Calendar, Chat composer, Chat composer drawer, Markdown, Popover, Slider, Resizable) now use CSS logical properties (`insetInlineStart/End`, `borderStart*/End*` radii, `textAlign: 'end'`) instead of physical `left`/`right`, so they mirror correctly under RTL. The Avatar status dot's outward-push `transform` is now direction-aware, so it hugs the bottom-inline-end corner (bottom-right in LTR, bottom-left in RTL) instead of pulling inward under RTL.
  The Popover close button, vertical Slider track/thumb, and ResizeHandle centered grab-zone/pill now consume the shared `rtlStyles.centerInline` helper — fixing an RTL regression where a logical `insetInlineStart: 50%` anchor combined with a physical centering `translate` shifted the element off-center by its own width.
- TextArea: the `<textarea>` now spans the full input container, with icons, status/spinner, and the character counter as absolutely-positioned overlays. The native resize grip sits in the container's bottom-right corner and the scrollbar covers the whole field. The `maxLength` counter moved inside the container, anchored bottom-right beneath the text (#4233).
- Thumbnail: show the placeholder when the image fails to load
  The docs promise a placeholder on load failure, but the img had no error handling, so a broken src rendered a broken image indefinitely. The component now tracks the errored src and falls back to the placeholder, retrying when src changes.
- TreeList arrow-key navigation now follows visual direction in RTL: ArrowLeft expands and ArrowRight collapses under `dir="rtl"` (mirrored from LTR). Detected automatically; LTR is unchanged.

#### Documentation

- Soft-deprecate useTableRowExpansion and useTableRowExpansionState in favor of the tree plugin (useTableTreeData + useTableTreeState). The hooks still work; JSDoc @deprecated tags and the docs point to the migration guide. Removal will come in a later release.
- Document the `@astryxdesign/core` StyleX peer dependency — add `@stylexjs/stylex` to the Getting Started / Quick Start install commands in both READMEs, and add an `astryx init` next-steps reminder to ensure the `@stylexjs/stylex` peer dependency is met, with a pointer to `astryx doctor`. StyleX is the styling runtime every component calls, and not all package managers auto-install peers.
- Surface the React 19 peer-dependency requirement everywhere a user would look for it (root README, core README, docsite hero, and the CLI getting-started guide), and add a sync test that keeps those surfaces naming the same React major as the core peer range.
- Add a migration guide from useTableRowExpansion to useTableTreeData + useTableTreeState (before/after example plus a config mapping), since the two tree plugins are converging.

#### Contributors

Thanks to everyone who contributed to this release:

- @AKnassa
- @arham766
- @athz
- @bhamodi
- @cixzhang
- @freddymeta
- @HelloOjasMutreja
- @humbertovirtudes
- @imdreamrunner
- @jiunshinn
- @josephfarina
- @nynexman4464
- @potatowagon

---

# 0.2.0

#### Breaking Changes

- TabList: remove orientation prop (misleading no-op). The prop did not render vertical tabs; it only toggled the keyboard-hint badge arrows. Arrow navigation has always accepted both axes (horizontal and vertical) via orientation: both in useListFocus. Run astryx upgrade to auto-strip the prop from your code.

#### New Features

- `Avatar` gains optional interactivity via `href`/`onClick` (with `as`/`target`/`rel`), following Button's element-swap trichotomy: `href` renders a link through `useLinkComponent`, `onClick` (no href) renders a `<button type="button">`, and with neither the avatar stays the static, non-focusable element it is today (non-breaking default). Interactive avatars get the focus-visible accent ring and a required accessible name (from `alt`/`name`). Inside `AvatarGroup`, interactive avatars — and an interactive `AvatarGroupOverflow` — now share a single Tab stop with roving ArrowLeft/ArrowRight focus, and the group exposes a screen-reader keyboard hint via `aria-describedby`. A purely static facepile is unchanged. (#4170)
- Citation: `CitationSource.icon` now accepts a `ReactNode` (e.g. an Astryx `<Icon>`, an SVG, or a custom element) in addition to an image URL string, and a new `CitationSource.src` field holds a favicon/logo image URL (mirroring `Avatar`/`Thumbnail`). Additive and non-breaking: a string `icon` still renders as the favicon `<img>`, so existing callers are unaffected. When both a node `icon` and `src` are set, the node wins. The icon stays decorative — the accessible name still comes solely from the citation's `aria-label`.
- CodeBlock: move the collapse chevron to the left of the title/language label, following the leading-disclosure convention (points right `>` when collapsed, down `v` when expanded). It grows into place (width + inline margin) so it slides the title over smoothly instead of popping in and shifting the header. Respects `prefers-reduced-motion` (#4513)
- Collapsible: expose the trigger button as a distinct theming target (`astryx-collapsible-trigger`) so themes can style the trigger independently from the content — e.g. a heading font on the trigger while the content keeps the body font.
- DateInput: add `astryx-date-input-clear-icon` and `astryx-date-input-toggle-icon` theme targets on the clear and calendar-toggle glyphs, so consumers can recolor, resize, and hover-style each icon — and style the toggle's open/closed state — via `defineTheme` instead of a fragile descendant selector or raw CSS. The toggle reflects its open/closed state as a `data-state` attribute. `Icon` now fully handles its styling props (`className`, `style`, `xstyle`) so they compose with its base styles instead of being dropped. Default rendering is unchanged.
- DateRangeInput: add `astryx-date-range-input-clear-icon` and `astryx-date-range-input-toggle-icon` theme targets on the clear and calendar-toggle glyphs, so consumers can recolor, hover-morph, and resize them via `defineTheme` instead of a fragile descendant selector or raw CSS. The toggle icon reflects its open/closed state as a `data-state` attribute. `Icon` now fully handles its styling props (`className`, `style`, `xstyle`) so they compose with its base styles instead of being dropped. Default rendering is unchanged.
- DateTimeInput: add `astryx-date-time-input-date-segment` and `astryx-date-time-input-time-segment` theme targets on the two segment wrappers, so a theme can restyle their geometry (padding/height/font) via `defineTheme` instead of being unable to reach them at all. Both reflect `size` and `status` as data attributes, mirroring the root target. Default rendering is unchanged.
- DropdownMenu: add submenus via a single `DropdownMenuSubMenu` component (or a nested `items` array in data mode). The row adopts DropdownMenuItem semantics (label / icon / description / isDisabled) and its children — or an `items` array — become the flyout content. Flyouts open inline-end with auto-flip, hover-intent, and full keyboard support (Right/Enter/Space opens and focuses the first item; Left/Escape closes and returns focus to the trigger).
- Bordered inputs gain a `statusVariant="tooltip"` option that hides the status message box and surfaces the status as an info-tip on the on-field status icon. The icon is a real focusable button so the status is reachable by everyone: keyboard users tab to it (with a visible focus ring) and see the message on focus, pointer users see it on hover, and touch users tap to toggle it. The message is piped into both the input's and the button's `aria-describedby`, and the tooltip is dismissible with Escape. Added to TextInput, TextArea, NumberInput, DateInput, DateRangeInput, TimeInput, and FileInput.
- The bordered input family now accepts a `statusVariant` prop (`'attached' | 'detached'`, default `'attached'`) that forwards to the underlying `Field`, letting you float the status message below the input with spacing instead of overlapping it. Added to TextInput, TextArea, NumberInput, DateInput, DateRangeInput, TimeInput, Selector, MultiSelector, Typeahead, Tokenizer, FileInput, and PowerSearch. Non-breaking: the default matches today's behavior. (#4187)
- Add RTL direction API: `useDirection()` hook, `getLocaleDirection(locale)` server-safe helper, and an optional `dir` prop on `InternationalizationProvider`.
- RTL: mirror directional disclosure/navigation chevrons under RTL via a shared `rtlStyles.mirror` CSS transform, applied to the icon wrapper in Lightbox and the Table tree / grouped-rows / row-expansion plugins. The mirror composes correctly with the Table chevrons' state-rotation (expanded chevrons still point down under RTL). Semantic aria-labels are unchanged.
- Selector & MultiSelector: add `astryx-selector-clear-icon`, `astryx-selector-indicator-icon`, `astryx-multi-selector-clear-icon`, and `astryx-multi-selector-indicator-icon` theme targets on the clear and chevron glyphs, so consumers can recolor, resize, and hover-style each icon — and style the chevron's open/closed state — via `defineTheme` instead of a fragile descendant selector or raw CSS. Each chevron reflects its open/closed state as a `data-state` attribute. `Icon` now fully handles its styling props (`className`, `style`, `xstyle`) so they compose with its base styles instead of being dropped. Default rendering is unchanged.
- add size prop (sm / md) to Switch to match CheckboxInput and RadioList boolean control scales (#4230)
- Table: `rowIndexStart` and `rowCount` props expose row numbering as a table-level ARIA concern, so `aria-rowindex`/`aria-rowcount` reflect a row's position in the full dataset: correct across pagination and even when no visible index column is rendered. Opt-in; tables that set neither prop are unchanged. Closes #3939.
- Timestamp: new `tooltipEntries` prop renders the hover tooltip across several time zones and/or formats at once — one line per entry, each with an optional `timezoneID` (IANA id; omit it or pass `'local'` for the viewer's zone), `format` (every non-relative `TimestampFormat` plus `'full'`), and `label`. The default is unchanged: with no entries the tooltip stays the single full absolute line in the viewer's zone. Configuring entries also attaches the tooltip to absolute formats, which previously had none — note that this gives those timestamps a tab stop and focus ring, as relative timestamps already have, so a column of them gains one tab stop per row. `hasTooltip={false}` still suppresses the tooltip, and an empty array counts as no configuration. Also corrects `isTimezoneShown`'s documentation, which claimed it applied to the `system_date_time` and `system_time` formats; it never has, and those formats stay machine-readable. (#4188)
- Token: make the `color` prop extensible via module augmentation. `TokenColor` is now derived from a `TokenColorMap` interface, so theme packages can add custom colors (and `astryx theme build` generates the type augmentation), matching Badge and Button.
- TreeList: the per-level indentation step is now the themeable `--tree-list-indent` variable (default `var(--spacing-4)`), so a theme can retune the indent metric via `defineTheme` on the `tree-list` target instead of the previously hardcoded, unreachable step (#4308).
- TreeList: add a `variant` prop (`'lineGuides' | 'noGuides'`, default `'lineGuides'`) to select the base hierarchy guide-line look. `noGuides` hides the connector lines while keeping indentation intact. Orthogonal to `density` (spacing); the guides stay themeable via the `astryx-tree-list-guide` target. Non-breaking — omitting the prop renders exactly as before.

#### Fixes

- Avatar: compose the status dot's label into the avatar's accessible name so assistive tech can reach the status the `role="img"` root previously pruned (WCAG 4.1.2)
- Calendar: expose selected state in day-button accessible names, announce range-selection progress and completion via the polite live region, and set aria-multiselectable on the grid in range mode
- CommandPalette: announce result counts, empty, and loading states to screen readers via the shared polite live region (WCAG 4.1.3)
- Divider: expose the label as the separator's accessible name via aria-labelledby; Spinner: name the status element from the visible label instead of duplicating it as aria-label
- FileInput: announce the required state via a visually hidden description on the trigger (aria-required is unsupported on role="button") and announce validation errors exactly once
- hooks: resolve focus-trap Escape by DOM depth instead of push order, exclude aria-hidden subtrees from trap tab cycles, and auto-clear live regions after announcing so stale status text does not linger
- List: keep list semantics for all listStyle variants by always emitting an explicit role="list", since the base style strips list-style-type for every variant and Safari/VoiceOver drops implicit list roles for such lists (WCAG 1.3.1)
- NumberInput: announce the units text through the input's accessible description, and stop TextInput/NumberInput from referencing the non-rendered status message id in aria-describedby inside InputGroup
- reset: stop suppressing `:focus-visible` outlines on coarse-pointer devices so keyboard users keep the WCAG 2.4.7 focus indicator
- hooks: auto-detect RTL direction for arrow-key navigation in useListFocus and useGridFocus (WCAG 1.3.2)
- Slider: constrain range thumb aria-valuemin/aria-valuemax by the sibling thumb (including minStepsBetweenThumbs) and render the label as a group label wired via aria-labelledby instead of an inert <label htmlFor>
- TopNav: disabled TopNavItems now render href-less anchors so they no longer navigate or fire clicks, and Outline's active item uses aria-current="location"
- Avatar: avoid remounting the avatar subtree when the name tooltip toggles — render the tooltip as a conditional sibling instead of forking the return so the avatar keeps its position in the React tree (and its image-load state) across tooltip changes.
- Card: rest the bordered variant on the subtle `--color-border` instead of `--color-border-emphasized`, so a Card's outer frame matches its own LayoutHeader/LayoutFooter dividers and neighboring ClickableCards instead of rendering a heavier edge.
- CheckboxInput, RadioList, Switch: align control sizes. The visible checkbox and radio controls now fill their size exactly (20px at `sm`, 24px at `md`) instead of being inset 2px. The `sm` Switch track is now 32px wide with a 2px inset.
- Export the `BaseProps` type through the `@astryxdesign/core/BaseProps` subpath. Previously it was only reachable through the package barrel, so the `import type {BaseProps} from '@astryxdesign/core/BaseProps'` specifier that `astryx swizzle` generates failed to resolve (#4091).
- Guard DropdownMenu item hover styles with `@media (hover: hover)` to prevent sticky highlights on touch devices. Forward BaseProps pass-throughs to the menu element.
- FieldStatus renders a leading status icon on the `detached` message so status is not conveyed by color/position alone (WCAG 1.4.1). The icon is decorative for assistive tech; the message text and live-region announcement carry the status. The `attached` variant is unchanged.
- FileInput no longer nests interactive controls (the clear and status buttons) inside a role="button" trigger. The trigger is now a visually hidden button alongside them in a non-interactive container, resolving the nested-interactive a11y violation (WCAG 4.1.2) while keeping click, keyboard, and drag-and-drop behavior. (#4522)
- Inputs no longer show the hover ring while disabled. The shared input wrapper's disabled state now suppresses both the base and status hover shadows, so TextInput, TextArea, NumberInput, DateInput, TimeInput, Selector, MultiSelector, Typeahead, and Tokenizer stay visually inert on hover when disabled.
- HoverCard: move themeProps className to the layer container (where bg/radius/shadow live) so themes can target the visual surface. Forward consumer xstyle/className/style to that same layer container so surface customization lands next to the theme class, instead of silently dropping them.
- With `statusVariant="detached"`, bordered inputs no longer render a status icon inside the control (this also covers DateTimeInput, which is fixed to the detached presentation) — the detached message box already carries a leading icon, so the on-field glyph was a duplicate. Also centers the detached message's icon on the first line of text.
- DropdownMenu/ContextMenu: mouse hover now moves the highlight instead of adding a second one, so keyboard focus and pointer hover share a single highlighted item (#4493)
- utils: clamp plainDateAddMonths to the target month's last day
  Adding a month to Jan 31 landed on Mar 3 (Date#setMonth overflow) instead of Feb 28, so month arithmetic from end-of-month dates skipped February entirely. The helper now uses pure month arithmetic and clamps the day, matching Temporal.PlainDate.add and date-fns.
- Calendar RTL: month-navigation chevrons now mirror correctly under RTL (via the shared `rtlStyles.mirror` transform on the nav-icon wrapper), and the range-selection / hover-preview fill pills use logical CSS (`insetInline*`, `border*Start/EndRadius`) so their rounded start/end caps follow the reading direction instead of the physical left/right. LTR rendering is unchanged.
- Carousel now supports RTL: the directional scroll-button chevrons mirror under RTL, the scroll buttons respect RTL scroll semantics (previously the button was a no-op under RTL), and the button pills sit on the correct edges.
- RTL: migrate physical `left`/`right` CSS properties to their logical equivalents so components mirror correctly under `dir="rtl"`. This is the Phase 2 mechanical, one-to-one follow-up to the RTL direction API — a no-op in the default LTR direction with no visual change.
- RTL Phase 4 (behavioral): mirror directional behavior that logical-CSS and icon name-swaps alone couldn't fix. SideNavCollapseButton and TreeListItem now compose `rtlStyles.mirror` on the icon wrapper outside the state rotation, so the chevrons point toward the correct edge in every collapsed/expanded × LTR/RTL combination. TreeList connector/guide lines position via logical `inset-inline-start`/`inset-inline-end` so they mirror to the inline-start (right) edge under RTL alongside the chevron and row indent. Slider positions its thumb, fill, and marks via logical `inset-inline-start` and flips the physical centering transform under RTL, and its pointer/click math measures the value fraction from the inline-start (right) edge under RTL — so a click at 25% of the track maps to 75 instead of 25.
- RTL Phase 4b behavioral fixes: ChatMessageBubble grouped-bubble tail corners now use logical border radii so the tail follows reading direction (mirrors under RTL, text unaffected); Table sticky-column shadows make their `translateX` and gradient direction-aware so the shadow fades from the pinned edge toward scrolled content in both LTR and RTL instead of rendering inside-out, and gate shadow visibility on `Math.abs(scrollLeft)` so the start/end shadows still appear under RTL (where spec-compliant browsers report a negative `scrollLeft`); ResizeHandle's hit-area bias is now direction-aware (mirrors about center under RTL) and the pointer-drag delta reads the handle's computed direction so dragging resizes intuitively in RTL.
- Markdown honors the `components.image` override for standalone (block) images, matching the inline image path. A standalone `![alt](src)` line parses as a block image, whose render path previously hardcoded a bare `<img>` and ignored a supplied `components.image`; it now uses the override just like an inline image does.
- Selector & MultiSelector: keep group headers visible while searching; hide groups with no matching items. Previously, typing a query flattened grouped options into a single ungrouped list; now each group header stays above its matching items and a group is hidden only when none of its items match.
- SideNav: remove the top border above the footer region so the `footer` slot no longer renders a divider line.
- Slider: round snapped values to the min/step decimal precision
  With fractional steps, `min + steps * step` accumulated binary floating-point error, so a keyboard nudge on a `step={0.1}` slider emitted `0.30000000000000004` through `onChange`/`onChangeEnd` (and into `aria-valuenow`/the value tooltip once the consumer echoed it back). Snapped values are now rounded to the combined decimal precision of `min` and `step`, which removes only the error — exact steps are unaffected.
- Tooltip: dismiss the tooltip when its trigger is pressed. Previously the tooltip stayed open through a click (e.g. a "Copy link" button's tooltip lingered after activation); now pressing the trigger hides its own tooltip. Applies to uncontrolled tooltips only.
- Typeahead: omit aria-activedescendant when search results are empty or index is out of bounds (#4059)

#### Documentation

- document `width` prop across 17 input component doc files (#4163)

#### Other Changes

- Add `@astryx/no-physical-properties` ESLint rule that flags physical left/right CSS properties inside `stylex.create()` and suggests the CSS logical equivalent for RTL support.
- KEY-BASED: `marginLeft`/`marginRight`, `paddingLeft`/`paddingRight`, `borderLeft`/`borderRight` (+ their `Width`/`Style`/`Color` longhands), `left`/`right` → `insetInlineStart`/`insetInlineEnd`, and the four physical corner radii → their diagonal-aware logical names (`borderTopLeftRadius` → `borderStartStartRadius`, etc.).
- VALUE-BASED: `textAlign: 'left'|'right'`, `float: 'left'|'right'`, and `clear: 'left'|'right'` (the key stays, only the physical value is flagged).
- Scoped strictly to `stylex.create()` — physical identifiers used elsewhere are ignored.
- `useDirection()` returns `'ltr' | 'rtl'` for the current provider context (falls back to `'ltr'` when called outside a provider).
- `getLocaleDirection(locale)` computes direction from a BCP 47 locale via `Intl.Locale.getTextInfo()` — safe to call from React Server Components and Next.js layouts to set `<html dir>`.
- `<InternationalizationProvider locale="ar">` auto-derives `dir="rtl"`. Pass an explicit `dir` prop to override (useful for RTL testing under an English catalog, or to force LTR).
- Pagination is the first component to consume the hook: prev/next chevron icons flip under RTL while the aria-labels stay semantic.
- Storybook gains a global `Direction` toolbar for toggling every story between LTR and RTL.
- Component-level CSS migrations (borders, chevrons, sliders, calendar range pills, etc.) land in follow-up PRs.
- `textAlign: 'left' | 'right'` → `'start' | 'end'` (Selector, Typeahead, Chat trigger menu, DropdownMenu, CommandPalette, NavMenu items).
- `borderLeft*`/`borderRight*` → `borderInlineStart*`/`borderInlineEnd*`, kept as separate start/end declarations (Banner, Table cell/header dividers, DateRangeInput preset sidebar).
- Static `left`/`right` positioning → `insetInlineStart`/`insetInlineEnd` for full-bleed overlays and single-side offsets (Button spinner overlay, Chat dock/blur/placeholder, Field sr-only label, Lightbox close/nav/counter buttons, TabList indicators, Thumbnail remove slot, CodeBlock copy button).
- Inline `marginLeft` indentation → `marginInlineStart` (TreeList rows).

#### Contributors

Thanks to everyone who contributed to this release:

- @AKnassa
- @arham766
- @bhamodi
- @cixzhang
- @ernestt
- @freddymeta
- @HelloOjasMutreja
- @humbertovirtudes
- @kentonquatman
- @lexs
- @nynexman4464

---

# 0.1.9

#### New Features

- Avatar: add a `tooltip?: string | boolean` prop for a name-on-hover tooltip. Omitting it (or `true`) shows the avatar's `name` on hover and keyboard focus; a string shows that text instead (no need to wrap in `Tooltip`); `false` disables it. Avatar owns the tooltip via the existing Tooltip hook, so there's no extra wrapper DOM. Because this adds a default tooltip to every existing named Avatar, set `tooltip={false}` when you supply your own `Tooltip`/`HoverCard` overlay. The root `aria-label` (`alt || name`) is unchanged; the default name tooltip is visual-only (no `aria-describedby` double-announce), while a custom string tooltip is exposed as a description. Decorative avatars (no `name`/`alt`) get no tooltip. (#4164)
- BreadcrumbItem gains a `menu` prop that turns a crumb into a menu trigger for switching between sibling destinations. It accepts the same item API as DropdownMenu/MoreMenu/ContextMenu (a `DropdownMenuOption[]` array or composed item children), so existing menu-item definitions drop into a breadcrumb with no rewrite. The item components are also re-exported under `Breadcrumb*` aliases.
- Calendar: make the today/selected day-cell ring precisely themeable. The day cell now reflects a compound `marker` state (`today-only` / `today-in-range`) that maps 1:1 to the treatment actually drawn, so `defineTheme({components: {'calendar-day': {'marker:today-only': {...}}}})` targets exactly those states without over-matching or needing a `:not()` exclusion. Default rendering is unchanged.
- Calendar: add a dedicated `astryx-calendar-nav` theme target for the prev/next month-nav buttons, so consumers can theme the nav controls (color, radius, per-direction, disabled edge) without reaching every Button via the global `astryx-button` handle. Reflects `nav` (prev/next) and the `disabled` state as data attributes.
- ChatComposer: make custom inputs first-class. `useChatComposerContext()` and its types are now public, so any input in the `input` slot can read `value`/`onChange`/`onSubmit`/`canSend`/`placeholder`/`isDisabled` and drive the shell's send button. Inputs can register a focus control on `inputControlRef` so click-to-focus works for any input shape (not just `contenteditable`/`textarea`); the shell keeps a DOM-query fallback for uninstrumented inputs.
- ChatComposerInput: add an `onKeyDown` seam so consumers can host platform- or app-specific key handling — e.g. `preventDefault()` Enter to insert a newline on a touch keyboard, or submit on Cmd/Ctrl+Enter. Enter also no longer submits mid-IME-composition.
- CommandPalette: add a dedicated `astryx-command-palette-group-heading` theme target on the group heading, so consumers can theme just the heading (e.g. its padding or typography) via `defineTheme` instead of a fragile structural selector. The group root keeps its own `astryx-command-palette-group` target.
- DateInput gains a `format` prop for the committed date value, reusing Timestamp's `format` vocabulary so the same literal renders the same date shape in both components. Named values are `date_long` (the default, "March 21, 2026"), `date` ("Mar 21, 2026"), `date_weekday` ("Wed, Mar 21, 2026"), and `system_date` ("2026-03-21"); a `(value) => string` function is also accepted for custom output. The `date_long` default is byte-identical to DateInput's previous long-month rendering, so existing usage is unchanged. This also extends Timestamp with two new shared members, `date_long` and `date_weekday`, giving the two components full value parity on the date-only formats. Formatting applies only to the committed value, never to text being typed.
- Add an `elevation` prop to configurable surfaces — Card, ClickableCard, SelectableCard, Button, IconButton, ButtonGroup, and Banner take the full `'none' | 'low' | 'med' | 'high'` scale; ChatComposer takes `'none' | 'low'`. Defaults preserve today's appearance (`none` everywhere except ChatComposer's `low`), so nothing changes unless you opt in. (#4146)
- OverflowList: add `maxVisibleItems` to cap the number of visible items (the ceiling partner to `minVisibleItems`) and `maxRows` for bounded multi-row wrapping — items wrap onto up to N rows, then collapse into the overflow indicator. Both props are optional and default to off, so single-line behavior is unchanged. See #4176.
- Add `useTableRowStatus`, a plugin that prepends a narrow column
  signaling per-row status.
- Thumbnail: add `showRemoveOn` prop — `'hover'` (default) reveals the remove button on hover or keyboard focus and keeps it visible on touch; `'always'` shows it at rest.
- Table tree: add an optional expand-all/collapse-all header control (#4142)
  `useTableTreeState` now returns an aggregate `isAllExpanded` state (`true` / `false` / `'indeterminate'`) and threads `expandAll` / `collapseAll` into `treeConfig`. `useTableTreeData` gains a `hasExpandAllControl` prop: when set, it renders an expand-all/collapse-all toggle in the tree column header, wired to that state, so consumers no longer need to hand-roll external buttons. Flat data stays a full no-op. This is the first affordance folded in from `useTableRowExpansion` as part of converging the two tree plugins.
- TreeList: add a dedicated `astryx-tree-list-chevron` theme target for the expand/collapse toggle, so consumers can theme the chevron (color, per open/closed state) via `defineTheme` instead of reaching it through the functional `[data-tree-toggle]` attribute. Reflects the open/closed state as a `data-state` attribute (`expanded`/`collapsed`); the functional `data-tree-toggle` hook is unchanged.
- TreeList: add a stable `astryx-tree-list-guide` theme target on the hierarchy guide (connector) line elements, so consumers can recolor or hide the guides through `defineTheme` (e.g. `backgroundColor`, or `display: 'none'` to hide them) instead of hiding the built-in connectors and reimplementing them with unlayered CSS.
- TreeList: add a dedicated `astryx-tree-list-item-label` theme target on the item's label text, so consumers can theme just the label (e.g. bold the selected item's label) via `defineTheme` instead of a fragile `button:not([data-tree-toggle]) > span` structural selector. Reflects the row's `selected` state as a `data-selected` attribute on the label.

#### Fixes

- AvatarStatusDot: pair each variant with a distinct built-in shape — success stays a filled dot, neutral renders as a ring, error gets a minus bar — so status no longer relies on colour alone (WCAG 2.1 SC 1.4.1, #4143). A rendered `icon` replaces the shape glyph at sizes where icons fit; themes can target the new stable `astryx-avatar-status-dot-glyph` class and its `data-shape` attribute — a stroked inline `<svg>` painted from the dot's `currentColor`.
- Button: link-rendered buttons (`href`) now expose `aria-busy` while loading, matching the `<button>` branch. Previously an interruptible loading link showed the spinner and announced "Loading" but carried no machine-readable busy state.
- Calendar only marks in-month date cells as today, preventing duplicate today indicators in multi-month views.
- Carousel: slides now expose APG slide semantics (role=group, aria-roledescription="slide", "Slide N of M" labels) instead of anonymous divs.
- Honor `prefers-reduced-motion` in ChatToolCalls (chevron rotation, expand/collapse), ChatLayoutScrollButton (pill show/hide), and ChatDictationButton (equalizer bars).
- Chat/useChatStreamScroll: the scroll-follow spring now respects `prefers-reduced-motion` — locked following, `scrollToBottom()`, and `lock()` fall back to the existing instant jump, so the transcript still tracks the bottom without animated travel. Follow-up promised in #3800.
- Chat: the composer drawer toggle now references its disclosed content via aria-controls, so assistive tech can navigate from the toggle to the drawer.
- ChatSendButton now forwards `className`, `style`, and pass-through attributes (`data-*`, `aria-*`, and other rest props) to the rendered button. Previously these were silently dropped. (#4190)
- Chat: tool-call error details are now exposed to screen readers and keyboard users instead of living only in a hover-only title attribute.
- CheckboxInput: the indeterminate mark now uses the `--radius-full` token instead of a hardcoded radius, for token consistency. No visual change.
- CheckboxList: items with rich (non-string) labels can now provide an accessibleLabel so their checkbox no longer announces as the literal "Checkbox".
- CodeBlock: collapsed code regions are now inert, so keyboard focus can no longer land on the invisible scroll container while collapsed.
- CommandPalette: forward BaseProps pass-through attributes (className, style, xstyle, data-_, aria-_) to the underlying Dialog. Previously these were silently dropped.
- CommandPalette: the search input (role=combobox) now has an accessible name by default, from the new label prop or the visible placeholder. Previously screen readers announced a nameless combobox.
- DateTimeInput: ArrowDown (and Alt+ArrowDown) in the date field now opens the calendar popover from the keyboard, matching DateInput and the advertised combobox pattern.
- Dialog: modals are now automatically labelled by their DialogHeader title via aria-labelledby, matching AlertDialog. Unnamed open dialogs warn in development.
- Dialog: the entry animation is disabled under prefers-reduced-motion, matching the Layer animation guards.
- Fix Divider rest-prop spread order so consumer-passed HTML attributes cannot overwrite the component's `role="separator"` or `aria-orientation`.
- FieldLabel now forwards className, style, xstyle, and pass-through attributes (data-_, aria-_, event handlers) to the rendered element. Previously these were accepted by the type but silently dropped.
- Field/FieldStatus: status and error messages are now announced through persistent live regions, so they are reliably read by screen readers regardless of when they appear.
- FileInput: the trigger's accessible name now includes the selected filenames, so screen-reader users can review what is attached when refocusing the control.
- Prevent PowerSearch edit popover from closing when selecting multi-select options via Enter (#4245)
- Selector/MultiSelector: PageUp/PageDown now jump the active option to the first/last match while searching, complementing Home/End which stay on text-caret movement.
- HoverCard: popups now expose a named dialog when the new label prop is set, and honest group semantics otherwise. Previously every hover card announced as an unnamed dialog.
- Item: aria-selected is now emitted only when the item's role permits it (option, tab, treeitem, grid cells), removing invalid ARIA from plain list items.
- MobileNav: the toggle button now exposes `aria-expanded` and references the nav drawer via `aria-controls`, so screen-reader users can tell whether the drawer is open and what the button controls. (#3721)
- MultiSelector: searching within the options popover now announces the number of matching results ("3 results" / "No results found") to screen readers, mirroring Selector and Typeahead. Previously filtering happened silently.
- SideNav/TopNav: collapsed heading popovers no longer wrap their menus in a modal dialog, and the heading button is no longer an invalid child of the menu.
- Slider now clamps controlled values to its minimum and maximum before positioning the thumb and exposing ARIA values.
- Slider: required sliders now convey the required state to screen readers through the thumb's accessible description (aria-required is invalid on the slider role).
- Make the CLI's `.mjs` sources fully strict-typecheckable (checkJs + JSDoc)
  Annotated the entire CLI package so `tsconfig.strict.json` (full `strict` `checkJs` over `src`, `bin`, `scripts`, `docs`, and the emitted `templates`) reports zero errors — down from 1717. Fixes are JSDoc-only: no runtime logic changed, `.mjs` stays `.mjs`. Strict checking also surfaced and corrected several type-contract drifts: the `upgrade.run` response type (declared a `depsUpdated` field the command never emits, and omitted the real `integrations`/`filesChanged`/`transformsApplied`/`errors`), registered the emitted `theme.list`/`theme.add`/`layout.*` response types in the `--json` envelope union, and added `category?` to `ReferenceSection` in core's docs types (reference docs already emit it).
- Table: the selection plugin accepts getRowLabel so row checkboxes announce which row they select, instead of an undifferentiated "Select row".
- Text: an explicit `size` now overrides the font-size of a themed `type`. The `size` class lived in a lower cascade layer (`astryx-base`) than a theme's per-type font-size rule (`astryx-theme`), so `<Text type="supporting" size="xsm">` silently kept the type's size. Themes now re-emit the size classes in the theme layer so `size` wins as documented.
- Thumbnail: replace the hover box-shadow on interactive tiles with the same `::after` overlay treatment ClickableCard and SelectableCard use. All three now tint on hover with `--color-overlay-hover` (and `--color-overlay-pressed` on press), so interactive feedback is consistent across the card family.
- Thumbnail/TopNavMegaMenuFeaturedCard: images without alt text are now explicitly decorative instead of silently empty-alt, matching Avatar's handling.
- Thumbnail: the overlaid remove button now uses a fixed `--color-overlay` scrim with an `--color-on-dark` icon instead of adapting to the image's luminance, so it has reliable contrast on any image.
- Tokenizer: adding and removing tokens (including Backspace on an empty input) is now announced to screen readers. Previously tokens appeared and disappeared silently.
- TopNav: TopNavMegaMenu triggers now expose aria-controls, and the panel is a labeled group instead of an invalid modal-dialog-wrapped menu.
- TopNav: TopNavMenu popups now expose proper menu semantics (no modal dialog wrapper) with the full APG keyboard pattern (roving tabindex, arrow keys, typeahead).

#### Documentation

- docs(Tokenizer, PowerSearch): document and test the existing startIcon prop
  Both components have shipped a working `startIcon?: ReactNode | IconType` prop for a while (`PowerSearch` forwards it verbatim to the internal `Tokenizer`, and it's already exercised in Storybook), but neither's `.doc.mjs` documented it and neither had test coverage — so it was invisible to `astryx component <Name> --dense`, the docsite props table, and anyone (human or AI) relying on those as the source of truth. No behavior change; adds the missing props-table entries (en/zh/dense) and colocated tests confirming the icon renders and forwards correctly.

#### Other Changes

- Compact per-row status signal (error, warning, unread, etc.) without a
  dedicated status column: a colored status dot by default, or an icon when provided.
- `getStatus(item)` maps a row to `{color, icon?, label?}`, or `null` for no
  indicator. `color` accepts a semantic status name (`success`/`error`/`warning`/`accent`/`red`/`green`/etc.) mapped to a theme token, or a raw CSS color as an escape hatch.
- `icon` renders the status as a shape signifier instead of the dot, which is
  more accessible than color alone when multiple statuses coexist. `label` supplies the accessible name.
- Memoize `getStatus` with `useCallback` for a stable plugin identity.

#### Contributors

Thanks to everyone who contributed to this release:

- @AKnassa
- @bhamodi
- @cixzhang
- @ejc3
- @freddymeta
- @HelloOjasMutreja
- @humbertovirtudes
- @josephfarina
- @kentonquatman
- @Kevinjohn
- @saadpocalypse
- @yyq1025

---

# 0.1.8

#### Breaking Changes

- Avatar and AvatarGroup adopt Icon's abbreviated size scale — `size` now takes `xsm`/`sm`/`md`/`lg`/`xl` instead of `tiny`/`xsmall`/`small`/`medium`/`large`. Pixel values are unchanged (20/24/36/48/128px) and the default is now `md` (still 36px, formerly `small`). Avatar's tiers stay larger than Icon's because avatars align with media rather than glyphs. Run `astryx upgrade` to migrate call sites. (#2672)

#### New Features

- Collapsible: the content area now anchors body typography (font family, size, weight, line-height) instead of inheriting from its surroundings, and exposes a stable `astryx-collapsible-content` theme target so revealed text can be themed externally.
- Collapsible: add an `isDisabled` prop to disable a single item. A disabled item's trigger can't be toggled and is dimmed; following the system-wide disabled convention it uses `aria-disabled` (not the native `disabled` attribute) and drops out of the tab order, staying perceivable to assistive tech. Disabling doesn't collapse an already-open item. Works standalone and inside CollapsibleGroup.
- `@astryxdesign/core`'s `docs.mjs` now redirects to the CLI so agents converge on a single documentation entry point (`astryx docs` / `astryx init`) instead of a large standalone script. (#4207)
- DropdownMenu selectable items: add `DropdownMenuCheckboxItem` (independent toggle, `role="menuitemcheckbox"`) and `DropdownMenuRadioGroup` + `DropdownMenuRadioItem` (single-select, `role="menuitemradio"`). The control size derives from the menu's item size and swaps to the row's inline-end on touch. They also work inside `ContextMenu` (re-exported as `ContextMenuCheckboxItem` / `ContextMenuRadioGroup` / `ContextMenuRadioItem`). Both menus' keyboard/typeahead/activation now recognize the selectable roles, and the menu context (`DropdownMenuContext`, `useDropdownMenuContext`, `DropdownMenuSize`) is exported for building custom menu items. See #3829.
- Icon: add an optional `label` prop for the accessible name. Setting it makes a standalone icon meaningful (`role="img"` + `aria-label`, no `aria-hidden`), collapsing the old three-attribute dance into one prop; omitting it (or passing `''`) keeps the decorative default (`aria-hidden`).
- "Foolproof init": both `@astryxdesign/core` and `@astryxdesign/cli` now print a postinstall nudge pointing you to `npx @astryxdesign/cli init`, `astryx` commands nudge you to finish setup until init has run, and `astryx init` runs non-interactively (no TTY required) so it works in CI and agent environments. (#4147, #4153, #4154, #4155)
- Outline: keyboard navigation, navigate callbacks, and scroll-scoping props (#2527)
  Layers the public API deferred out of #2746 onto the scroll-spy engine and click-lock that already shipped. No visual change.
- Table: add a tree-data plugin — `useTableTreeState` and `useTableTreeData` — for rendering and managing hierarchical (parent/child) rows, expansion state, and flattening. Exported from `@astryxdesign/core/Table`. (#3789)

#### Fixes

- `AvatarGroupOverflow` now grows into a pill for long `+N` counts so the number never clips.
  The indicator was a fixed-size circle, so wide counts (e.g. `+4912`) overflowed and crowded the edges. It now uses a minimum width equal to the avatar size plus horizontal padding: short counts (`+5`) stay a perfect circle, while longer counts grow horizontally into a stadium/pill and remain legible. No new public props.
- Carousel now scrolls horizontally when you hold Shift and scroll the mouse wheel. Trackpad users already got horizontal scroll for free; this brings standard mouse (vertical-only wheel) users to parity using the established Shift + wheel convention. Native trackpad horizontal scrolling and the prev/next buttons are unchanged.
- Citation: a non-interactive citation (no `source.url`) now keeps the default cursor instead of showing a pointer, so only linked citations look clickable. The pointer cursor is applied alongside the existing hover treatment for both the `label` and `number` variants (#4134).
- Stop suggesting bare `npx astryx` before the CLI is installed — it resolves to an unrelated package on the npm registry.
  The CLI now emits an install-aware invocation everywhere it prints a command:
- Icon: size variants (`xsm`/`sm`/`md`/`lg`) now use `rem` instead of hardcoded `px`, so icons scale in step with text when the document/root `font-size` changes — matching the rest of the design system's rem-based type scale. Fixes #4092.
- Guard useTableRowExpansionState tree walks against cyclic data (#3971)
  The `depthMap`, flattened `data`, and `allExpandableKeys` walks now track the ancestor keys on the current path and skip edges that point back at an ancestor, so self-referential or cyclic row data terminates instead of overflowing the stack.
- Route the Table sortable plugin's header-button aria-labels ("Sort by …", "… sorted …", "… priority … of …") through `useTranslator()` with new `@astryx.table.sort.sortBy` / `sortedBy` / `sortedByWithPriority` / `direction.*` catalog keys, so they localize like the sort menu labels already do (#3618, tracker #3636). The direction word resolves through its own key rather than interpolating the raw enum value. English output is unchanged.
- Table: the tree row expander's `aria-label` is now localized through `useTranslator()` instead of a hardcoded English string, so expand/collapse controls announce in the app's language. (#4149)
- TabList `hasDivider` reserves a gap so the hover pill and adjacent buttons no longer touch the underline
  A divided TabList now reserves 4px between the tabs and the divider rail. The hover highlight sits clear of the underline, and a same-size Button placed alongside the tabs aligns to the tab baseline instead of butting the rail — so a `md` tab strip pairs with a `md` button. The selected indicator still rests on the rail. Non-divided tab lists are unchanged. TabList inside a `Toolbar` with `dividers={['bottom']}` gets the same alignment via the toolbar's own spacing.
- TreeList: focusing a parent row no longer leaks the focus-visible outline onto its descendant rows — each row's ring now resolves from its own nearest treeitem instead of matching any focused ancestor (#4130)

#### Documentation

- DropdownMenu and DropdownMenuItem: seed playground defaults so the docsite properties-tab preview renders real content instead of an empty trigger.

#### Other Changes

- Installed / global / dev runs suggest `<pm> astryx <cmd>` (e.g. `pnpm exec astryx …`), unchanged.
- One-off runs (launched via `npx`/`pnpm dlx`/`yarn dlx`/`bunx`) suggest the scoped package `<dlx> @astryxdesign/cli <cmd>`, which always resolves to us.
- Improved translator context in the shipped English catalog (`packages/core/locales/en.json`) descriptions. Sharpened ~172 entries — added screen-reader-only clarifications, ICU-composition examples, polysemy warnings, and set-pairing notes — so translators working in Crowdin get better context. No changes to `defaultMessage` values, keys, or runtime API.
- **Keyboard navigation** — the outline is now a single tab stop (roving tabindex via `useListFocus`), seated on the _active_ heading per WAI-ARIA, so tabbing into a table of contents while reading section 7 lands on section 7 rather than sending the reader back to section 1. Arrow keys move between headings, Home/End jump to the ends, and Enter/Space activate. A 40-heading table of contents costs one Tab press instead of 40, and Tab still leaves the outline in one press.
- **`onNavigateStart(id)` / `onNavigateEnd(id)`** — fire around the smooth scroll started by a click or keyboard activation, so an app can drive an arrival effect. `onNavigateEnd` resolves on `scrollend` where supported and on a settle timeout where it is not (Safari), so it also fires correctly when reduced motion collapses the scroll into an instant jump. It fires exactly once for every `onNavigateStart` — including when the user interrupts the scroll — so a "navigating" state can never leak.
- **`offset`** — the height of a fixed header overlaying the top of the scroll root. It shifts both the activation line **and** the scroll landing by the same amount, so a heading activates exactly where navigating to it puts it: below the header, not hidden underneath it. It composes with each heading's own `scroll-margin-top` (the header, then the breathing room below it) rather than replacing it — leave `offset` at 0 when nothing overlays the content and let `scroll-margin-top` do the work, since the browser already honors it.
- **`scrollContainerRef`** — scope scroll tracking to a specific container instead of auto-detecting the nearest scrollable ancestor. Fixes the table of contents whose highlight never moves inside a split pane, modal, or dashboard panel. The default (viewport) path is unchanged.
- **`hasScrollOnClick`** (default `true`) — set to `false` to own the scrolling yourself; the outline still updates the active item, the hash, and the navigate callbacks.

#### Contributors

Thanks to everyone who contributed to this release:

- @AKnassa
- @cixzhang
- @ernestt
- @is-jain
- @joeyfarina
- @josephfarina
- @MeGaurav4
- @nynexman4464

---

# 0.1.7

#### Breaking Changes

- Table plugin render-prop interfaces (`TableRenderProps`, `HeaderRowRenderProps`, `HeaderCellRenderProps`, `BodyRowRenderProps`, `BodyCellRenderProps`, `ScrollWrapperRenderProps`) and the `scrollWrapper` component contract rename their StyleX array field `styles` → `xstyle`, matching the prop name sub-components receive it under. Custom plugin authors: rename `props.styles` reads and `styles:` writes in transform functions (#3679)
  **Codemod:** `npx astryx upgrade --codemod rename-table-renderprops-styles-to-xstyle`

#### New Features

- Export the authoring factories from `@astryxdesign/core`: `createConfig` at `@astryxdesign/core/config` and `createIntegration`/`createPageTemplate`/`createBlockTemplate`/`createComponentDoc`/`createFunctionDoc`/`createDoc` at `@astryxdesign/core/authoring`. Authoring a config or integration no longer requires depending on the CLI. Existing `@astryxdesign/cli/*` imports keep working via re-export.
- Button: new `width` prop following the input field width convention (`SizeValue`: numbers are pixels, strings are used as-is). `width="100%"` removes the need for a `width: '100%'` xstyle override or a stretch layout wrapper for full-width CTAs in auth forms, dialogs, and mobile layouts (#2600).
- **Astryx components are now translatable.** Wrap your app in `<InternationalizationProvider locale="...">` and pass one or more locale catalogs to render astryx UI in the language of your choice; call `useTranslator()` inside your own components to translate consumer strings against the active locale. Astryx ships an English catalog with BCP 47 regional fallback (e.g. `pt-BR` → `pt` → `en`), so consumers who never render a provider see today's English strings unchanged.
- **Translation coverage now spans the full component set** — PowerSearch (UI chrome, value-editor labels/placeholders, the 21 built-in operator labels, and ICU-pluralized result counts), plus AlertDialog, AppShell, Banner, Breadcrumbs, Calendar, Chat, CommandPalette, ContextMenu, date/time inputs, Dialog, DropdownMenu, Lightbox, Link, Markdown, mobile/side/top nav, Outline, Popover, Resizable, Selector/MultiSelector, Table (and its filter/selection/sort plugins), Toast, Tokenizer, Typeahead, and related interactive affordances. Placeholder strings that used `...` are normalized to `…` (U+2026) in the English catalog; consumers who snapshot-test the exact three-dot form will see a diff, and consumers passing an explicit `placeholder` are unaffected.
- Two i18n-related **type refinements** (source-compatible for existing usage): `PowerSearchOperator` is now a discriminated union — `{key, value, label}` (raw text) or `{key, value, i18nKey}` (astryx-translated); passing `label` compiles and behaves unchanged, while a bare `{key, value}` (neither `label` nor `i18nKey`) becomes a compile-time error. `Markdown.renderBlock` gains a `t: TranslatorFn` parameter threaded from the top-level `Markdown`; direct `renderBlock` consumers pass a translator.
- New ESLint rules in `@astryx/eslint-plugin-astryx` (`astryx.configs.strict` / `recommended`): `@astryx/i18n-key-format` enforces camelCase path segments for `@astryx.*` catalog keys, and `@astryx/no-hardcoded-i18n-string` flags hardcoded English string literals on user-facing props — now also inside ternaries, logical expressions, and template literals (e.g. `aria-label={isOpen ? 'Close' : 'Open'}`). Both are filesystem-agnostic; downstream packages can enable them with the standard `files` / `ignores` pattern and will see additional violations flagged after upgrading.

#### Fixes

- Fix Banner chevron transition to honor `prefers-reduced-motion: reduce`.
- Round the trailing corner of the last ButtonGroup member, even when it renders a layer (#2508)
  ButtonGroup keyed its trailing border-radius off `:last-child`. But several members render an invisible layer element _after_ their button — a `Button` with a `tooltip` returns `button + tooltip layer`, and `DropdownMenu` returns `trigger + popover`, both rendered inline by `useLayer` rather than portaled. The layer took the `:last-child` slot, so the real trailing button silently kept square outer corners and the group ended in a flat-edged stub.
- Calendar: month navigation now announces the newly visible month (e.g. "March 2026") to screen readers via a polite live region. Previously the grid changed silently. (#3724)
- Chat: opening a conversation that already has content (history, replay, session switching) no longer spring-scrolls from the top — the first fill positions instantly, whether the content is present at mount or arrives asynchronously. Subsequent growth (streaming) springs as before. `useChatStreamScroll`'s `scrollToBottom` accepts `{behavior: 'instant'}` for one-frame programmatic jumps, mirroring the DOM's `scrollTo({behavior})`. Exports the `ChatScrollToBottomOptions` type. (#3795)
- CheckboxInput/Switch: descriptions stay linked via aria-describedby when the label is visually hidden, instead of being orphaned in the DOM.
- CodeBlock keeps line numbers aligned with wrapped lines when `isWrapped` is enabled
- Forward rest props in Dialog and DialogHeader. DialogHeader now passes through data-testid, aria-*, and other attributes. Dialog's inline path forwards all rest props. Standard path spreads rest before contract props so onClick, onCancel, aria-modal, and role cannot be clobbered.
- Anchor --dense / --zh doc overlays to their base sections (#2182)
  The compressed and translated reference docs were merged into the base doc **by array position**, so an overlay whose sections were ordered differently — or which omitted one — grafted every title onto the wrong body.
- FileInput: don't drop the drag-over highlight when dragging over dropzone children
  Dragging a file across the dropzone's own icon/text fired a dragleave on the container and cleared the drag-over state, so the "Drop files here" highlight flickered mid-drag. A dragleave whose relatedTarget is still inside the dropzone is now ignored; only actually exiting the dropzone ends the drag-over state.
- Fix consumer rest props clobbering component contract props in ButtonGroup, Calendar, and Carousel
  Components that set `role`, `aria-roledescription`, or `onKeyDown` on their root element now spread `{...rest}` before those props so a consumer cannot accidentally override the component's semantic contract. `onKeyDown` is composed via `composeEventHandlers` so both the consumer's and the component's handlers fire.
- Kbd: pass-through props no longer clobber the computed role and spoken accessible name (rest-spread precedence corrected, mirroring Avatar).
- Layer: centered layers near a viewport edge no longer render clipped (#3671). Flip fallbacks are a no-op for center alignment, so centered placements now append span-based `position-try-fallbacks` that slide the layer along its alignment axis.
- Link: disabled links no longer carry a live href/onClick — programmatic focus or AT activation can no longer trigger navigation.
- Selector: searching within the options popover now announces the number of matching results ("3 results" / "No results found") to screen readers, mirroring Typeahead. Previously filtering happened silently. (#3725)
- Table now honors the standard root styling props: `className`, `style`, `xstyle`, `id`, `aria-*`, `data-*`, and other HTML attributes reach the root `<table>` element instead of being silently dropped. `tableProps` is deprecated (still works, loses conflicts to direct props); the computed column min-width still wins over a consumer `style.minWidth`, but no longer clobbers it when columns compute none (#3679)
- Timestamp: the absolute-time tooltip is now reachable by keyboard — the timestamp is focusable while a tooltip is attached, per WCAG content-on-hover requirements.
- TopNav: the `<nav>` landmark now defaults its accessible name to "Top navigation" when the `label` prop is omitted, matching SideNav ("Side navigation"), Breadcrumbs, and Pagination. Previously an omitted `label` shipped an unnamed navigation landmark, leaving screen-reader users with multiple indistinguishable "navigation" landmarks on pages that compose SideNav + TopNav + Breadcrumbs. An explicit `label` still wins.

#### Documentation

- Point AI agents to the CLI from the core README.
  `@astryxdesign/core`'s README now leads with a callout telling AI agents to run `npx astryx init` first, which installs the CLI's component index into `AGENTS.md`/`CLAUDE.md`. In an isolated cold-start test, this took agents from 0/5 to 4/5 on discovering and using the CLI (matching the AGENTS.md ceiling); a first-run nudge alone did 0/5.
- Surface literal values for union types in component docs (#1645)
  Prop docs named their union types without ever showing the values behind them — `gap: SpacingStep`, `align: GridAlignment`, `sort: TableSortState<TSortKey>`, `status: InputStatus`. Readers without an IDE (agents especially) had to guess, and guessed wrong: `gap={16}` (pixels, not a scale step), `direction: 'desc'` (the type says `'descending'`).

#### Other Changes

- Migrate the duplicated charts/lab color parsers onto the shared `@astryxdesign/core/utils/color` module: adds `toGLFloats(rgba)` for RGBA→GL float conversion with a neutral non-NaN fallback, replacing the four `hexToGL` copies, and rebuilds `lerpHex`/`hexAlpha` on `parseHex`/`formatHex`/`parseColor`/`formatColor` (#3739)

#### Contributors

Thanks to everyone who contributed to this release:

- @AKnassa
- @arham766
- @bhamodi
- @cixzhang
- @ejhammond
- @jiunshinn
- @joeyfarina
- @nynexman4464
- @yyq1025
- @zeroryu

---

# 0.1.6

#### New Features

- Add `useTableGroupedRows` — groups a flat data array into collapsible section rows. Each distinct `groupBy` value becomes a full-width section-header row with a chevron toggle, group label, and member count; collapsing hides that group's rows while keeping the header. Mirrors `useTableRowExpansionState`: the consumer owns the `collapsedGroups` set and the hook returns `{data, plugin, idKey}` (pass to `Table` data / plugins / idKey). Supports `renderGroupHeader` and `groupOrder`. (#3763)
- Add `useTableRowIndex` — a plugin that prepends a right-aligned, monospaced row-number column. Numbering follows the rendered `data` order, so it reflects the current sort / filter / pagination view (pass the sorted/paged array). Provides `getRowKey` for stable keyed lookup, plus `label` and `startFrom` to customize the header and starting ordinal. (#3756)

#### Fixes

- Rebrand the core package `displayName` from "XDS Core" to "Astryx Core"
  The core package's `displayName` still read "XDS Core". It surfaces in the docsite package sidebar and landing cards as the friendly package label, so this rebrands it to "Astryx Core" to match the Astryx migration. Metadata-only — the package `name` and public API are unchanged.
- Compile dist with the production JSX transform — 0.1.5 shipped `jsxDEV`, which crashes every consumer that renders in production
  `@babel/preset-react` 8 derives its `development` option from the Babel env name (`api.env(env => env === 'development')`), and Babel falls back to `"development"` whenever `NODE_ENV`/`BABEL_ENV` is unset. The bump from 7.29.7 to 8.0.1 therefore flipped the published build to the development JSX transform without any config change: 193 of 479 files in `@astryxdesign/core@0.1.5`'s `dist` import `react/jsx-dev-runtime` and call `jsxDEV`, which React's production build does not export.

#### Contributors

Thanks to everyone who contributed to this release:

- @ejhammond
- @fatwang2
- @humbertovirtudes

---

# 0.1.5

#### New Features

- AspectRatio: add a `fit` prop (`'cover' | 'contain' | 'center'`) so the component sizes and positions its child instead of every consumer hand-writing `width`/`height`/`objectFit` on the child. `cover`/`contain` ship as zero-specificity baseline rules in `reset.css` keyed on a `data-astryx-aspect-ratio-override` marker the component sets on the child's direct parent (direct-child selectors, no dependence on internal structure or the theming surface), so a child's own styles always win and self-sized children are unchanged; `center` centers the child at its natural size from the component's wrapper. When `fit` is omitted the child is left unstyled, preserving the existing contract (#2753)
- CodeBlock: new `syntaxTheme` prop for per-instance syntax theme overrides. Shorthand for wrapping a single block in `<SyntaxTheme theme={...}>` — accepts a preset from `@astryxdesign/core/theme/syntax` or a theme created with `defineSyntaxTheme()` (#3360).
- CollapsibleGroup: add a `hasDividers` prop (boolean, default `false`) so FAQ-style accordions get built-in row hairlines instead of hand-rolled borders, plus a `density` prop (`'compact' | 'balanced' | 'spacious'`) controlling row padding. When dividers are enabled the group renders a wrapper div (`astryx-collapsible-group`) and items default to `'balanced'` density; without dividers the group keeps its DOM-less contract and existing renders are unchanged. Borders use the themed `--border-width`/`--color-border` tokens, and nested collapsibles never inherit row chrome (#3487).
- New `incident-console` page template: an on-call incident response console demonstrating the frame-first tracker archetype — grouped dense incident rows (StatusDot severity, Token state), PowerSearch filtering, status segmented control, and a resizable inspector panel with metadata and timeline. Adds the `Tools - Incident Console` template category.
- useLayer: new `positioning: 'custom'` context render option for consumers that author their own position styles (explicit `anchor()` insets, `anchor-size()` covers). Keeps the popover behavior and `position-anchor` wiring but derives no position styles from `placement`/`alignment` — including the automatic RTL mirroring, which becomes the consumer's responsibility (#3389).
- New `messaging-shell` page template: Slack-style column frame (rail | sidebar | stream | thread panel) built on the Chat component family — dense rows, zero cards. Adds the `Shell - Messaging` template category.
- Pagination: the `dots` variant is now keyboard navigable via the shared useListFocus primitive. With a dot focused, Left/Right arrows move between dots and Home/End jump to the first/last, the active page follows focus (roving tabindex), and Up/Down are left to the browser so vertical scrolling is unaffected. (#3681)
- Switch: rename the labelSpacing `"default"` value to `"hug"`; `"default"` keeps working as a deprecated alias. Run `astryx upgrade` to migrate call sites automatically. (#2889)
- Add `useHotkeys` hook for global keyboard shortcuts. Registers one window `keydown` listener per hook instance with handlers kept in a ref (re-renders never re-subscribe). Combos like `'mod+k'` or `'escape'` — `mod` maps to ⌘ on Apple platforms (same detection as Kbd) and Ctrl elsewhere. Skips typing targets (input/textarea/select/contenteditable) unless `allowInInputs`, skips `defaultPrevented` events, and calls `preventDefault()` on match. SSR-safe.

#### Fixes

- Emit derived accent tokens as var(--color-accent) references (#3495)
  Generated themes now emit `--color-text-accent` and `--color-icon-accent` as `var(--color-accent)` and `--color-accent-muted` as `color-mix()` over the same reference, instead of baking resolved hex literals. Overriding `--color-accent` on any scope re-accents the whole subtree at runtime — no second theme build, no per-token overrides. `--color-on-accent` stays resolved because it is a contrast computation CSS cannot express.
- adjustTime guards non-finite deltas and wraps negatives in O(1) (#3583)
  A non-finite deltaMinutes previously spun the wrap-around loop forever (-Infinity — tab freeze) or produced the corrupt string "NaN:NaN" (NaN) that could be committed into consumer form state through DateTimeInput's timeIncrement path. Non-finite deltas now return the input time unchanged, and the negative wrap-around uses double-modulo instead of a loop.
- Forward rest props on AlertDialog and AppShell so consumer `data-*`, `aria-*`, and `id` attributes reach the DOM (#3876)
- Wrap CommandPalette search updates in `startTransition` to resolve a React 19 warning (#3815)
- Derive DropdownMenuItem escape hatches from BaseProps so it accepts `xstyle`, `className`, and `style` (#3687)
- Order rest spread before explicit ARIA props on Item and InputGroup so consumer-set ARIA attributes are no longer clobbered (#3751)
- Avatar: retry a changed src/fallbackSrc after a load error
  A failed image load latched a boolean error flag that never reset, so updating `src` (or `fallbackSrc`) to a valid URL kept rendering the initials fallback forever. The error state now tracks the exact URL that failed, so a changed source gets a fresh load attempt.
- Banner: the expand/collapse toggle is now linked to its content region via `aria-controls`, completing the disclosure pattern (the toggle already exposed `aria-expanded`). (#3719)
- Calendar: mark today's date cell with `aria-current="date"`. Previously "today" was conveyed only visually, so screen-reader users could not identify the current date (WAI-ARIA date-picker pattern). (#3708)
- Calendar: move aria-selected from the day button onto its gridcell wrapper. A plain button (implicit role "button") does not permit aria-selected, which tripped the axe aria-allowed-attr rule; the selection state belongs on the gridcell role in an ARIA grid. (#3343)
- Calendar / DateInput / DateTimeInput: defensively clamp `numberOfMonths` to its `1 | 2` type at runtime. Out-of-range values (e.g. `0` rendered nothing, `1000` locked the page up in `Array.from({length})`) fall back to a single month. DateInput and DateTimeInput inherit the guard since they forward the prop to `<Calendar>` (#2704)
- Calendar: month navigation chevrons now mirror under `dir="rtl"` so "Previous month" points outward (visually right) and "Next month" points left, instead of both pointing inward at the month label. The mirror is a CSS-only StyleX conditional transform keyed on the `dir` attribute; DOM order, labels, and handlers are unchanged. Also fixes the embedded calendars in DateInput, DateRangeInput, and DateTimeInput (#3388).
- Card: draw the `default` variant's border inside its padding and drop the invisible border from the other variants, so a card's total inset (border + padding) matches the spacing token exactly instead of being 1px larger on every side. (#3712)
- Carousel: make the horizontal scroll container keyboard-focusable (`tabIndex={0}`) so keyboard-only users can scroll it with arrow keys. Previously the scrollable region had no keyboard access (axe: scrollable-region-focusable). (#3343)
- Chat components forward pass-through props (data-_, aria-_, id) to the DOM
  `ChatDictationButton`, `ChatLayoutScrollButton`, `ChatMessageMetadata`, `ChatSystemMessage`, and `ChatTokenizedText` declared `BaseProps` but silently dropped `data-*`, `aria-*`, and `id`: they never captured `...rest` nor spread it onto their rendered element. They now capture `...rest` and spread it onto their primary element after the merged className/style, with any component-owned attribute (e.g. `role`) set afterward so it still wins.
- Chat: tool-call rows and the tool-calls group header now expose complete disclosure semantics — expandable call rows announce `aria-expanded` and reference their detail panel via `aria-controls`, and the group header references its content region. Previously an expandable call row was announced as a plain button with no indication it opens anything. (#3720)
- ChatComposerInput preserves composer submit with child onChange (#2330)
- CheckboxInput now forwards rest props (including `data-testid`) to the underlying `<input>`. Previously the component used a closed destructuring list with no `...rest` capture, so any prop not explicitly named — `data-testid`, other `data-*` attributes, etc. — was silently dropped despite `CheckboxInputProps` (via `BaseProps`) typing them as valid. Every sibling input component (TextInput, Selector, Slider, Button, Badge) already forwards rest props; CheckboxInput was the sole outlier. Rest is spread before the component's own named attributes on the `<input>`, so it cannot override `checked`, `disabled`, `type`, or any other explicitly-set prop.
- ClickableCard: remove the faint hover "ring" on borderless variants (everything except `default`) by dropping their invisible border. The `default` variant now draws its border inside the padding so outer dimensions stay identical across variants, and its border color emphasizes on hover. (#3712)
- CodeBlock: announce "Copied" via a polite live region when the copy button is used. Previously success was signalled only by swapping the button's `aria-label`, which screen readers don't reliably announce. (#3709)
- CodeBlock: restart the copied-indicator timer on rapid re-copy
  Each copy click armed an independent 2s reset timer, so copying again within the window let the first click's timer revert the "Copied" indicator early. The timer now restarts on every copy and is cleared on unmount.
- CodeBlock: complete the collapsible header's disclosure pattern. It now shows the standard accent focus ring on `:focus-visible` — previously it defined no focus style and fell back to the browser's default outline, unlike the system's other disclosure controls (Collapsible, TabMenu) — and links to the code region it shows/hides via `aria-controls` (the header already exposed `aria-expanded`). The region stays mounted when collapsed (CSS grid animation), so `aria-controls` is an always-resolvable reference. (#3723)
- Collapsible: link the trigger to its content region with `aria-controls`, and give the content region a matching `id`. Completes the disclosure pattern so assistive tech can move from the trigger button to the region it shows/hides (previously only `aria-expanded` was set). (#3707)
- Collapsible: the trigger button now shows a visible focus ring when focused via keyboard. The trigger's `all: unset` reset removed the browser's default outline without restoring a replacement, leaving keyboard focus invisible (WCAG 2.4.7). (#3722)
- Keep Collapsible self-toggling when uncontrolled with onOpenChange (#3785)
  `useCollapsible` treated the presence of `onOpenChange` as a signal that the component was controlled: its `toggle` handler fired the callback but skipped the internal state update, so an uncontrolled Collapsible given only `onOpenChange` (no `isOpen`) appeared stuck — the callback fired but the content never opened or closed. Control is now determined solely by whether `isOpen` was provided, mirroring how `isOpen` is derived. Uncontrolled usage drives internal state _and_ fires `onOpenChange`; controlled usage still defers entirely to the parent.
- SegmentedControlItem now forwards a consumer onClick, and add composeEventHandlers
  A consumer `onClick` on `SegmentedControlItem` was silently dropped — the internal selection handler clobbered it. It now runs alongside selection (call `preventDefault()` to opt out). The new `composeEventHandlers` utility chains handlers in order and stops when one prevents default, so components that own an interaction can also honor a consumer handler for the same event.
- ContextMenu now anchors the menu to the right-click point relative to its context, so it follows the content on scroll and auto-flips at viewport edges instead of staying at a fixed screen position (#3465).
- DateTimeInput: the embedded time input now carries `aria-describedby` and `aria-busy` like the date input, so screen-reader users keep access to the field's description, status message, and disabled message when focused on the time half. (#3716)
- DateTimeInput: `timeIncrement` is now typed as a literal union of sensible increments (`1 | 5 | 10 | 15 | 30`) instead of an open `number`, so negatives, fractions, and absurd values are rejected at the type level rather than silently accepted. Adds an exported `DateTimeInputTimeIncrement` type (#2725)
- focusableSelector: match only real links (`a[href]`, `area[href]`) instead of any element with an href attribute. Previously non-focusable elements carrying href could be treated as tab stops by useFocusTrap. (#3714)
- useFocusTrap: focus now returns to the previously-focused element when a trap deactivates, so closing a Popover (Escape or light-dismiss) no longer drops keyboard focus to the page body. Components that already restore focus themselves are unaffected — the trap only restores when focus would otherwise be lost. (#3732)
- Forward consumer event handlers in SegmentedControl, CheckboxListItem, and SideNavCollapseButton
  These components set their own `onClick` / `onKeyDown` / `onFocus` / `onBlur` after spreading `{...rest}` (or destructured the consumer's handler and never used it), so a consumer-supplied handler for the same event was silently dropped. They now compose the consumer's handler with the built-in one via `composeEventHandlers`, consumer-first — the consumer's runs and can call `preventDefault()` to opt out of the built-in behavior.
- Grid: with `columns={{minWidth, max}}`, columns that are present now fill the row when fewer than `max` fit. Previously the `max` cap was applied to each track's max size, so a layout collapsing to a single column (e.g. on mobile) left dead space on the right instead of stretching to full width. The cap now limits the column count while letting present columns reach `1fr`. (#3391)
- Icon: allow string (registry) icons to be made meaningful. `aria-hidden="true"` is now applied before the prop spread, so consumers can override it (e.g. `aria-hidden={false}` + `role="img"` + `aria-label`) for a standalone informational icon. Previously registry-mode icons hardcoded `aria-hidden` after the spread, making it impossible to override — inconsistent with component-mode icons, which already allowed it. Default behavior (decorative, hidden) is unchanged. (#3710)
- Layer/Popover: anchor-positioned popovers now mirror in RTL. `placement`/`alignment` `start`/`end` are logical (inline-start/inline-end), so DropdownMenu, Selector, Typeahead, date inputs, and every other context-mode popover opens toward the correct side under RTL automatically via CSS. LTR behavior is unchanged (#3389).
- Lightbox: navigating between images now announces the new image and its position (e.g. "Sunset over the bay, 3 of 12") to screen readers via a polite live region. Previously only the visual counter updated. (#3727)
- MobileNav forwards pass-through attributes and applies consumer className/style
  MobileNav declared `BaseProps` but silently discarded `className`/`style` (destructured to unused vars) and dropped every other pass-through attribute (`id`, `aria-*`, `data-*` beyond `data-testid`, event handlers). It now merges `className`/`style` and spreads the remaining props onto the `<dialog>`, and composes a consumer `onClick` with the backdrop-dismiss handler via `composeEventHandlers`.
- Forward unhandled pass-through attributes (`data-testid`, `aria-*`, `id`, etc.) to the primary rendered element of Switch, Pagination, RadioListItem, SideNavSection, TableHeader/TableBody/TableFooter, and TopNavMegaMenuFeaturedCard. These components previously dropped attributes not explicitly consumed, so test hooks and accessibility attributes silently disappeared.
- NumberInput with hasClear commits null when cleared from the keyboard (#3599)
  Deleting the text and blurring (or pressing Enter) silently reverted to the previous value — only the X button honored the clearable contract. An emptied input now commits onChange(null) on blur/Enter when hasClear is set; non-clearable inputs keep the revert behavior.
- paginateData clamps invalid page numbers instead of slicing from the end (#3593)
  A negative page fed a negative start index to Array.slice, which counts from the end of the data — page -1 returned the dataset's tail dressed up as a page — and fractional pages returned slices straddling two pages. page now gets the same coercion pageSize received in #3380.
- PowerSearch: changes to the visible result count are now announced to screen readers via a polite live region, mirroring Typeahead's wording. Previously the count only updated visually. (#3726)
- ProgressBar: treat a non-finite value/max as empty progress
  A NaN `value` (e.g. an upstream `loaded / total * 100` with total 0) leaked the literal string "NaN" into `aria-valuenow`, the value label, and the fill width style. Non-finite `value`/`max` now route through the same empty-progress handling as `max={0}`.
- ProgressBar: guard the value label against a zero max
  When `max` was `0` (or negative), the default value-label formatter produced `NaN%` (`0/0`) or `Infinity%`. That string was rendered visually and written into `aria-valuetext`, so screen readers announced "NaN percent". Guard it the same way the fill percentage already is (`max > 0 ? … : 0`).
- Resizable: keyboard resizing now works. The keydown handler was attached to a non-focusable child of the separator, so Arrow/Home/End keys never fired for keyboard users; it now lives on the focusable `role="separator"` element per the WAI-ARIA window-splitter pattern. (#3729)
- ResizeHandle: release window drag listeners when unmounted mid-drag
  A drag in flight when the handle unmounts never receives its pointerup, so the window pointermove/pointerup/pointercancel listeners leaked — every subsequent pointer move kept resizing the still-mounted region, and the body cursor/user-select overrides stuck. Unmount now tears down the in-flight drag's listeners and restores the body styles.
- `useTheme()` / `resolveThemeTokens()` now resolve derived tokens that reference other tokens (e.g. `--color-text-accent: var(--color-accent)`) to concrete raw values, following reference chains iteratively. Supported CSS color functions (`color-mix(in srgb, …)`) are evaluated against those values, so canvas/SVG/data-viz consumers get usable colors instead of `var(...)` or `color-mix(...)` strings (#3697).
  Also adds shared color parsing/formatting primitives (`parseHex`, `parseRgb`, `parseColor`, `formatHex`, `formatColor`) under `@astryxdesign/core/utils`, unifying the color parsers previously duplicated across the theme layer.
- SegmentedControl: tabbing through no longer rewrites the value (#3597)
  When value matched no enabled item (initial empty state, stale server value, or the selected item disabled), the roving tab stop fell back to the first enabled radio and selection-follows-focus fired onChange with it — a keyboard user mutated the form just by tabbing past the control. Selection now only follows focus moves within the group (arrow/Home/End); entering focus is a pure focus move, and click selection is unchanged.
- SegmentedControl and SegmentedControlItem forward data-testid to the DOM
  Both components declared `BaseProps` (so `data-testid` and other `data-*` attributes type-check) but silently dropped them: neither captured `...rest` nor spread the remaining props onto its rendered element, so the attribute never reached the DOM. They now capture `...rest` and spread it onto the radiogroup `<div>` / radio `<button>` (the same rest-spread fix applied to `CheckboxInput` in #3738), placed before the component's own `role`/`aria-*` so those can't be overridden.
- SideNav: don't render the empty sticky-bottom container when `collapsible.hasButton` is false. Previously the footer container rendered whenever the sidebar was collapsible — even with the built-in button opted out and no `footer`/`footerIcons` — leaving an empty, bordered container at the bottom of the nav. The container now renders only when it has visible content (a footer, footer icons, or the built-in collapse button). (#3603)
- Markdown/useStreamingText: streaming text now respects `prefers-reduced-motion` — the per-character reveal snaps to the full text and the entry fade is disabled for users who prefer reduced motion, matching the convention already used by Spinner, Skeleton, ProgressBar, and Chat. (#3730)
- Table: always render a numeric aria-valuenow on the column resize handle. The focusable resize separator omitted aria-valuenow before its width was measured, which failed the axe aria-required-attr rule (a focusable role="separator" requires aria-valuenow); it now falls back to the column minWidth. (#3343)
- Table rows re-render when a field is removed from the row object (#3595)
  The row memo compared only the keys of the new item, so a field cleared by omission (optimistic update, server response) never invalidated the memo and the cell kept rendering the deleted value indefinitely. A key-count check now catches removed properties.
- Table selection: select-all no longer reads checked over an empty filtered table (#3591)
  With rows selected and a filter matching nothing, the union-based all-selected check treated the invisible selection as "all selected": the header checkbox rendered checked over an empty table, and deselect-all was a no-op because the hidden keys count as frozen. Zero actionable rows now reads as not-all-selected; the frozen-selection preservation itself is unchanged.
- Table sort: group NaN cells with null instead of corrupting the order (#3585)
  A NaN cell hit the numeric fast path in defaultCompare, and the NaN comparator result reads as "equal" to Array.sort — making the comparator inconsistent and silently mis-ordering the other, valid rows. NaN now sorts to the end alongside null/undefined.
- Table: column headers now render with `scope="col"` so screen readers correctly associate data cells with their column headers. Consumer-provided scope via column header props still takes precedence. (#3715)
- TabList: the overflow tab menu now uses a roving tabindex — one tab stop with arrow-key navigation between items — instead of making every overflow item a separate tab stop. (#3728)
- Document the full themeProps() selector surface and guard it against drift (#3741)
  `theming.targets` is the documented CSS surface of a component — the stable `astryx-*` classes it renders and the visual props it reflects as data attributes. It was hand-authored while the truth lived in `themeProps()` calls in the source, and nothing kept the two in agreement, so it drifted twice (#3652, #3680) and was drifted again.
- Thumbnail: give the labeled root a group role so its accessible name is valid. Previously the file name was set via aria-label on a plain div with no role, which axe flags as aria-prohibited-attr (serious) because a generic element cannot carry a name. (#3343)
- TimeInput: typed-invalid input (e.g. an out-of-range time that will be reverted on blur) now sets `aria-invalid` and announces "Invalid time" via an assertive live region, matching DateInput, NumberInput, and DateTimeInput. Previously only the visual red border signalled the invalid state. (#3718)
- Timestamp: render nothing instead of crashing on an unparseable value
  An unparseable `value` (a malformed date string, or a NaN timestamp from missing data) produced an Invalid Date whose formatting throws "Invalid time value", crashing the whole tree. Invalid values now render nothing and log a console warning instead.
- Timestamp: keep relative time within its own tier
  Relative-time tiers guarded the raw diff with `<` but displayed the count with `Math.round`, so just under a boundary it rendered "60 minutes ago" / "24 hours ago" instead of "1 hour ago" / "1 day ago" (and the same in the future direction). Floor the per-tier count so it can never reach the next tier.
- Toast fallback viewport resolves the app's theme mode instead of OS preference (#3743)
  The fallback mounts via createRoot() on a disconnected tree, so Toast's useTheme() couldn't see ThemeContext and fell back to prefers-color-scheme — when that disagreed with `<Theme mode>`, the toast's inverted-surface text/icon could compute to the same color as its own background. useToast's fallback container now mirrors `<html data-theme>` and `data-astryx-theme` directly (kept live via MutationObserver), and useTheme() itself falls back to reading `<html data-theme>` before assuming OS preference when no ThemeContext ancestor is reachable — the mechanism that actually resolves Toast's JS-computed mode for disconnected trees like this one.
- Toast: onHide fires exactly once, and a paused auto-hide timer survives viewport re-renders (#3589)
  A second dismissal during the exit transition (double-click, auto-timer plus manual dismiss()) double-fired onHide; and because the timer effect depended on the viewport's per-render onDismiss identity, any other toast arriving or leaving silently restarted — and un-paused — every mounted toast's auto-hide timer. Exiting toasts are now tracked in a ref before onHide fires, and the timer reads onDismiss through a ref so it only restarts on a genuine duration change and respects the paused state.
- Typeahead/Tokenizer discard out-of-order async search results (#3587)
  Each search now claims a new generation, so a slow response for an abandoned query can no longer overwrite the results of the current one (previously the last response to resolve always won, and Enter could select an item from a query the user had already replaced).

#### Documentation

- Correct Carousel doc drift and translate its Chinese usage block (#3532)
  The Carousel docs described behaviors the component doesn't have: there is no scroll-driven scale effect on items, and the prev/next buttons are driven by per-edge overflow (each appears when the content can scroll in that direction), not by hover or platform. Descriptions now match the source. Also translates the docsZh usage block, which was still in English.
- DialogHeader: add property-editor defaults and example blocks (#2719)
  The DialogHeader docsite page rendered an empty preview because the properties editor had no default prop values, and it had no example blocks. Add playground defaults (title, subtitle, divider) so the preview is meaningful out of the box, plus example blocks covering a basic header, a header with a close button, and one with start/end content.
- Correct useInteractiveRole isDisabled docs for disabled href (#3786)
  The `isDisabled` JSDoc claimed a disabled `href` "falls back to button". It does not: a disabled `href` is skipped at the link step and resolved by the remaining priority checks, so with no `onClick` and no interactive context it lands on `'inert'` — as `Token` already relies on for disabled links. The `isDisabled` doc, the step-1 inline comment, and the priority summary now describe the actual behavior. Docs only; no runtime change.
- Document when playground.overlay applies: components with no inline containment (MobileNav, Lightbox) use it, while Dialog, AlertDialog, and CommandPalette intentionally keep their contained isInline previews so knobs stay usable. Adds regression tests guarding both shapes (#3657)
- Lightbox Properties preview shows the overlay open trigger instead of an empty stage (playground.overlay)
- Document the full `themeProps()` selector surface in component theming targets. A sweep of every `themeProps()` call against the `theming.targets` entries found 19 gaps across 16 components where a visual prop or state had no documented `data-*` selector, so the CLI theming table hid part of the themeable surface: missing target entries (Citation, ToggleButton, Banner content, OverlayScrim, NavHeadingMenu, NavHeadingMenuItem) and missing `visualProps`/`states` on existing entries (Chat message density, Checkbox, Code color, CodeBlock container, DropdownMenu item size, SegmentedControl item, SelectableCard variant, SideNav item, Timestamp format, Tokenizer status, TopNav item selected, TreeList item density, Typeahead size).

#### Contributors

Thanks to everyone who contributed to this release:

- @AKnassa
- @arham766
- @arman-luthra
- @bhamodi
- @cixzhang
- @dmitriy-bty
- @durvesh1992
- @Geervan
- @jiunshinn
- @josephfarina
- @kentonquatman
- @let-sunny
- @raphaelroshanM
- @syntaxsawdust
- @thedjpetersen

---

# 0.1.4

#### New Features

- Code: add `color` and `size` props. `color` accepts `'primary' | 'secondary' | 'inherit'` and now defaults to `'primary'` (mirroring Text's color subset); previously the color was left to inherit implicitly. `size="inherit"` makes inline code adopt the surrounding text's `font-size` and `line-height`. Exports `CodeColor` and `CodeSize` types (#2846)
- Markdown: support CommonMark link reference definitions. Reference-style "footer" links — full `[text][label]`, collapsed `[text][]`, and shortcut `[text]` (plus their `![alt]` image forms) — now resolve against a `[label]: destination "title"` block, which is stripped from the output instead of leaking as a visible paragraph. Labels match case-insensitively with collapsed whitespace; top-level definitions are collected across the document (so a reference can precede its definition, including in the streaming/incremental parser, whose settled-block cache invalidates when definitions change). Footnotes (`[^1]`) are intentionally left untouched. Known limit: a definition nested inside a blockquote/list resolves within that container but is not yet exposed document-wide. (#3621)
- Native form participation for custom inputs via htmlName (#3343)
  Switch, CheckboxInput, RadioList, Slider, Selector, MultiSelector, and Tokenizer now accept the same `htmlName` prop TextInput and NumberInput already had, so they serialize into native form submission. Components with a real native input (Switch, CheckboxInput, RadioList) forward the name; the synthetic controls render hidden inputs that mirror native semantics — one entry per value for MultiSelector/Tokenizer (like a multi-select), string value for Slider (two entries in range mode), and exclusion from FormData when disabled.
- Add `useTableRowExpansion` — expand/collapse tree rows inline.

#### Fixes

- Button: keep edge compensation working when a ghost button also has a tooltip. The tooltip is now attached via the tooltip hook instead of a wrapper element, so the button stays a direct child of its container — no extra DOM node, no layout shift, and containers (Toolbar, Banner) still detect the edge-compensation marker via their direct-child `:has()` selector and pull the button flush to the optical edge. (#2578)
- Calendar: stop range-highlighting adjacent-month (outside) days, and cap the range highlight where it meets a disabled or adjacent-month day. In the two-month range view the same date renders in both panes, so the spillover copy on the neighbouring month's pane was drawn as part of the selection; outside days now never receive selection, range, or preview state. A highlighted day next to a disabled or outside day now gets a rounded end cap so the run reads as properly terminated instead of running square-edged into the gap. (#2715)
- Code and CommandPaletteEmpty now forward props correctly (#3620)
  `Code` spreads rest props (`aria-*`, `role`, event handlers) onto the DOM element. `CommandPaletteEmpty` applies the `xstyle`/`className`/`style` escape hatches and theme props.
- DateRangeInput: use the label type-size token for the trigger field. The trigger was reading the body size/leading tokens (`--text-body-size`/`--text-body-leading`) instead of the label ones (`--text-label-size`/`--text-label-leading`), so its text rendered a step larger than the other date inputs. (#3655)
- Spinner: promote the canvas to its own compositor layer (`willChange: transform`) so rotation stays smooth on WebKit — fixes wobbly spinning in Safari and Tauri WebViews. (#3628)
- Text: apply the documented `size` prop as a font-size override (#3615)
  `Text` now reflects `size` in theme props and applies the corresponding typography size token after its type-based baseline styles. The override changes font size while preserving the selected text type's line-height, weight, and family behavior.

#### Documentation

- MobileNav previews with an open trigger instead of an empty stage: new playground.overlay for full-viewport overlay components, and inline sub-components can declare their own playground (#3616)

#### Other Changes

- Inherited-columns mode: child rows use the same columns as their parents,
  indented by depth. Injects a chevron column; clicking (or right-click → "Expand/Collapse row") toggles a row's children.
- Headless: the consumer owns `expandedKeys` state; the plugin provides the UI.
  Pair with `useTableRowExpansionState` to flatten a tree into the visible rows.
- Optional expand-all header toggle via `isAllExpanded` + `onToggleExpandAll`.
- Optional `expandOnRowClick` to toggle by clicking anywhere in the row.
- Contributes a context-menu action for expand/collapse (via the
  `contextMenuActions` system).

#### Contributors

Thanks to everyone who contributed to this release:

- @ahfoysal
- @arham766
- @cixzhang
- @durvesh1992
- @humbertovirtudes
- @jiunshinn
- @lexs
- @MeGaurav4

---

# 0.1.3

#### Breaking Changes

- DropdownMenu, ContextMenu, MoreMenu: removed the `hasAutoFocus` prop. Menus now always focus their first item on open (the correct APG menu-button behavior). Previously `hasAutoFocus={false}` left the menu keyboard-unreachable and undismissable — the prop existed only as an escape hatch for documentation previews, which no longer need it.

#### New Features

- Calendar: `weekStartsOn` now also accepts a three-letter day name (`'sun'`–`'sat'`, case-insensitive) in addition to the numeric `0`–`6`, so the starting day is self-documenting at the call site (e.g. `weekStartsOn="mon"`). Numbers keep working unchanged. Adds an exported `DayOfWeekName` type and a `normalizeDayOfWeek` helper (#2843)
- CheckboxInput/Switch/Slider/RadioList/CheckboxList/SegmentedControl/Tokenizer/PowerSearch: disabledMessage prop shows a tooltip explaining the disabled state (#3509)
- DateInput can now be used inside InputGroup with shared addon styling and group label/description/status ARIA wiring (#3520).
- DateTimeInput: add a `timePlaceholder` prop to customize the time-portion placeholder (previously hardcoded to "Select a time" with no override). `placeholder` continues to control the date portion; the focused typing hint (e.g. "e.g., 2:30 PM") is unchanged (#2729)
- Toolbar, TabList, and SegmentedControl now show an ephemeral "← → to navigate" hint on first keyboard focus, teaching sighted users that arrow keys navigate within the group.
  Adds a showcase block and Storybook story for useKeyboardHint.
- Export `themeProps` (and its `ThemeProps`/`ClassProps`/`ClassValue`/`ThemeDataAttributes` types) from `@astryxdesign/core/utils`, so packages building on core can generate the stable astryx class + `data-*` attribute surface through the public API instead of reaching into core internals.
- MultiSelector can now be used inside InputGroup as a decorated single-line control, sharing the group label, description, status, and connected border treatment (#3520).
- Typeahead, DateInput, DateRangeInput, DateTimeInput, and TimeInput: `disabledMessage` prop shows a tooltip explaining the disabled state on hover and keyboard focus, keeping the control focusable via `aria-disabled` while activation stays blocked (#3509)
- Popover: expose hasLightDismiss and add hasEscapeDismiss so consumers can opt out of outside-click and Escape dismissal for explicit-dismiss surfaces like onboarding coachmarks. usePopover accepts the same new hasEscapeDismiss option; with it off, no handler is registered on the shared Escape stack so the key falls through untouched (#3287)
- Selector/MultiSelector: disabledMessage prop shows a tooltip explaining the disabled state (#3347)
- Selector can now be used inside InputGroup as a decorated single-line control, sharing the group label, description, status, and connected border treatment (#3520).
- Stack/HStack/VStack: add `padding`, `paddingInline`, `paddingBlock` (spacing-scale inner padding) and `isScrollable` (`overflow: auto`) props; StackItem also gains `isScrollable`. These match the existing `padding`/`isScrollable` props on `Card`, `LayoutContent`, and `LayoutPanel`, so common frame layouts no longer need inline `style={{}}` for padding or the flex scroll-region pattern.
- Standardize layout component sizing props. Add `maxWidth`/`minHeight` to `Stack`, `Grid`, and `Center` (matching `Section`/`Card`), migrate `Layout`/`LayoutHeader`/`LayoutFooter`/`LayoutPanel` sizing to the shared `SizeValue` type, and drop redundant `xstyle`/`className`/`style` re-declarations on `Stack`, `StackItem`, and `Layout`. No runtime behavior change.
- Add a plugin-contributed right-click context-menu system to `Table`.
  Right-clicking a column header or a row shows a menu of actions aggregated from
  every enabled plugin (instead of the browser's generic menu).
- TabList is now a single tab stop with arrow-key navigation between tabs (roving tabindex) — Arrow keys move focus, Home/End jump to the ends, disabled tabs are skipped, and focus wraps. This does not change the semantic roles (still `<nav>`/`aria-current`); the full tablist/tab/tabpanel conversion is tracked separately in #3335. Reference (#3343).
- TextInput/NumberInput/TextArea/FileInput: disabledMessage prop shows a tooltip explaining the disabled state (#3509)
- Add InputGroup compatibility for TimeInput (#3520)
- TreeList now implements the full WAI-ARIA APG Tree View keyboard pattern. Roving tabindex places a single tab stop on the treeitem rows (defaulting to the selected item or the first enabled row), and arrow keys move focus in visible order: ArrowDown/ArrowUp step between visible rows (skipping disabled), ArrowRight expands a collapsed parent then enters its first child, ArrowLeft collapses an expanded parent or moves to the parent row, and Home/End jump to the first/last visible row. Enter and Space activate the row's action (or toggle a parent without its own action), and typeahead moves focus to the next row whose label matches the typed characters. Each treeitem now also exposes `aria-level`, `aria-posinset`, and `aria-setsize`. Builds on the interim keyboard-expandable toggle in (#3344). Part of the accessibility & keyboard-management program (#3343).
- Add InputGroup support for Typeahead (#3520)
- Add `useAnnounce` — an accessibility hook that speaks messages to screen readers through persistently-mounted, visually-hidden polite/assertive live regions. Because the regions are created once (not together with their content), announcements are reliable. Wired into `Typeahead`/`BaseTypeahead` to announce result counts and "no results found" during search, which were previously silent (#3343).
- Add `useKeyboardHint` — shows an ephemeral "← → to navigate" badge anchored to the focused item when a composite widget first receives keyboard focus. Teaches sighted keyboard users that arrow keys navigate within a roving-tabindex group. Renders in the top layer (`popover="manual"`) with CSS anchor positioning so it is never clipped by overflow containers. Auto-dismisses on first arrow press, timeout, or blur; does not re-show for that instance. `aria-hidden` (visual-only; screen-reader users already hear the role).
- Add `useTypeahead` — a first-character (type-to-focus) search hook, and wire it into `DropdownMenu`. Typing a letter jumps to the next menu item whose label starts with it; repeated presses of the same letter cycle through matches; the buffer resets after 750ms; disabled items are skipped. The hook is additive and collection-agnostic (composes with `useListFocus`/`useGridFocus` via `onMatch`), so menus/listboxes gain APG typeahead which astryx previously lacked (menus-11, infra-14) (#3343).
- `useListFocus` gains opt-in roving-tabindex ownership (`hasRovingTabIndex`), caret-aware arrow handling that leaves keys to nested text inputs and contenteditables (`hasCaretGuard`), RTL horizontal navigation (`isRtl`), a `hasHomeEnd` toggle, and `orientation: 'both'` for four-arrow navigation. `Toolbar` now uses it — it is a single tab stop and no longer steals the caret from a toolbar text input or composer (#3343).
- Add `VisuallyHidden` — an accessibility primitive that renders content in the accessibility tree while hiding it visually. Use for accessible names on icon-only controls, `aria-live` announcement regions, and supplementary screen-reader context. Renders a `<span>` by default; use `as` for block/live-region elements (#3338).

#### Fixes

- Announce file selection, page changes, and multi-select count via the live-region hook (#3343)
  FileInput now announces successful file selection, Pagination announces page changes, and MultiSelector announces selection-count changes, all through the shared visually-hidden polite live region so these previously-silent surfaces are audible to screen-reader users.
- Avatar: an avatar with no `name` or `alt` is now decorative (`role="presentation"` + `aria-hidden`) instead of being announced with the meaningless generic name "Avatar". When named, the inner `<img>` uses an empty `alt` so the accessible name isn't announced twice (once by the `role="img"` wrapper, once by the image) (#3343).
- Breadcrumbs: auto-detected current breadcrumb now places `aria-current="page"` on the item's content element (link/button/span), matching the explicit `isCurrent` path, instead of on the outer `<li>`. When the last breadcrumb is a link, the anchor itself now carries `aria-current` so screen readers announce it as the current page (#3343).
- Breadcrumbs: BreadcrumbItem now forwards remaining BaseProps (id, aria-_, role, event handlers, data-_) to the underlying `<li>` element. Previously these props were accepted by TypeScript but silently dropped at runtime.
- ButtonGroup: remove the invalid `aria-orientation` attribute from the `role="group"` element, which was flagged by axe (aria-allowed-attr). Orientation is still reflected via `data-orientation` and drives keyboard navigation and styling, so behavior is unchanged. Also fixes Schedule, which reuses ButtonGroup internally.
- Calendar: cross-month keyboard navigation now resolves the focused date from the machine-readable `data-date` attribute instead of parsing the localized `aria-label` with `new Date()`. Previously, month-boundary arrow keys and PageUp/PageDown silently stopped working in non-English locales (e.g. fr-FR, ja-JP) where the label was unparseable (#3343).
- Calendar: the month view now uses a valid ARIA grid structure — the weekday names are `columnheader` cells inside the `grid`, each week is a `row` whose direct children are `gridcell`s, and week-number cells are `rowheader`s. Arrow-key navigation now lands on the correct dates when some days are disabled (via `min`/`max`/`dateConstraints`): moving up/down keeps the true 7-column geometry and skips disabled days to the same weekday, instead of shifting to the wrong weekday. (#3343)
- Carousel, Lightbox: keyboard focus is no longer trapped on invisible or unmounted edge controls. Carousel's scroll left/right buttons, when at an exhausted edge (or when there is no overflow), were hidden with `opacity: 0`/`pointer-events: none` but stayed in the tab order, so keyboard users could focus invisible controls (WCAG 2.4.7); they are now `disabled` in that state (still mounted, removed from the tab order and a11y tree). Button-driven scrolling also now respects `prefers-reduced-motion` (uses `behavior: 'auto'` instead of hardcoded `'smooth'`). In Lightbox gallery mode, the Prev/Next buttons previously unmounted at the range ends, so advancing onto the first/last item removed the focused control and dropped focus to `<body>`, dead-ending keyboard navigation; they now stay mounted and become `disabled` at the boundaries so focus stays within the dialog and arrow-key navigation keeps working (#3343)
- Chat composer: the message input now uses `role="combobox"` when triggers (mentions, slash commands) are configured, and stays a plain `role="textbox"` otherwise. Combobox attributes (`aria-expanded`, `aria-haspopup`, `aria-controls`, `aria-activedescendant`) are only valid on a combobox, so applying them to a textbox was flagged by axe (aria-allowed-attr). (#3343)
- ChatMessageList: add an `isStreaming` prop that marks the `role="log"` region `aria-busy` while an assistant message streams in. Previously the polite live region re-announced the accumulating partial text on every token; with `isStreaming` set for the duration of a stream, screen readers wait and announce the completed message once (#3343).
- CheckboxInput: stop setting a redundant `aria-checked="mixed"` on the native `<input type="checkbox">` for the indeterminate state. The native `indeterminate` DOM property (which browsers already map to `aria-checked="mixed"`) is authoritative; the extra attribute could desync from or override the native state (#3343).
- CheckboxList: the checkboxes are now wrapped in a `role="group"` named by the field label via `aria-labelledby` (and associated with the description/error), instead of a flat list with an orphaned label `htmlFor`. Screen-reader users now hear the group's name and context (#3343).
- CheckboxListItem: drop the invalid `aria-checked` from the list row. `aria-checked` is not allowed on `role="listitem"` (axe: aria-allowed-attr); checked state is already conveyed by the row's inner checkbox. This also fixes Markdown task lists, which render task items through CheckboxListItem. (#3343)
- Citation: linked number-variant badges keep their accent-muted background (previously rendered transparent), and the badge now uses the secondary text color (#3508)
- Citation: only apply `role="doc-noteref"` on the linked (anchor) form. On a plain unlinked span the role is not permitted (axe: aria-allowed-role), so it is omitted there while the `aria-label` still names the citation. (#3343)
- Selector/MultiSelector/Typeahead: the highlighted option is now scrolled into view during keyboard navigation, so arrow keys no longer move the highlight off-screen in long lists (matches CommandPalette) (#3343).
- CommandPalette: the empty state ("No results") no longer flashes when typing further characters into an already-empty search. The empty state stays mounted for the full duration of the pending search instead of briefly unmounting and re-appearing.
- ContextMenu: Escape now closes the menu even when it was opened without auto-focus (e.g. table row menus), via a document-level Escape listener instead of one that only fires when focus is inside the menu. Focus is also restored to the previously focused element on close, instead of falling to `<body>`. Escape during IME composition is ignored (#3343).
- ContextMenu: can now be opened on touch (long-press) and by keyboard. A long-press (500ms, cancelled by a 10px finger move) opens the menu at the touch point — previously context menus were unreachable on iOS Safari, which never fires `contextmenu` on long-press. A keyboard-initiated `contextmenu` (Shift+F10 / the Menu key), whose coordinates are (0,0), now anchors the menu to the trigger's box instead of the viewport corner (#3343).
- DateInput/DateTimeInput: the date field's calendar popover can now be opened from the keyboard with `ArrowDown` / `Alt+ArrowDown` (APG combobox), not just by clicking. DateTimeInput's time input no longer uses a hardcoded English `aria-label="Time"` — it defaults to `"{label} time"` (tied to the field label and localizable) and accepts an explicit `timeLabel` prop (#3343).
- DateRangeInput: the preset sidebar is now a labeled `role="group"` of action buttons instead of a `role="listbox"` of `role="option"` buttons. The listbox/option roles announced a single-tab-stop listbox that contradicted the actual Tab-between-buttons interaction (no listbox keyboard model existed). The currently-applied preset is marked with `aria-current` rather than `aria-selected` (#3343).
- docs.mjs: resolve the package directory with fileURLToPath so component docs work on Windows, where URL.pathname yields drive-letter paths like /D:/... that made --list silently print nothing and single-component lookup crash with ENOENT (#3331)
- DropdownMenu: pressing Tab in an open menu now closes it (APG menu-button pattern) and returns focus to the trigger, instead of leaking focus into the page while the menu stayed open (#3343).
- Escape now dismisses only the top-most open layer instead of closing every open layer at once — a popover or menu nested inside a Dialog no longer closes both on a single Escape press. Also guards against IME composition: pressing Escape to cancel a CJK/IME composition inside a Dialog or popover no longer closes the overlay (#3343).
- Vertically center the optional/required indicator in `FieldLabel`.
  The `label` and `optionalRequired` styles never set an explicit `lineHeight`,
  so both fell back to `line-height: normal` (~1.2), producing mismatched line
  boxes (~16.8px for the 14px label vs ~14.4px for the 12px "∙ Required" text).
  With `alignItems: center` the smaller indicator centered within its shorter box
  and rendered visually high relative to the label.
- FileInput: `aria-describedby`, `aria-required`, and `aria-invalid` now sit on the focusable `role="button"` control instead of the visually-hidden `tabIndex={-1}` file input that never receives focus. Screen-reader users now hear the field's help text, required state, and error state. The hidden native input is also marked `aria-hidden` since it is not focusable (#3343).
- useFocusTrap: the focusable-element detection now includes `contenteditable`, media with `controls`, `iframe`, and an open `<details>`'s `<summary>`, and excludes elements hidden via `display:none`/`visibility:hidden` or inside `inert`/`hidden` subtrees. Previously a trapped surface whose only interactive content was (e.g.) a contenteditable composer could let Tab escape (infra-8).
- Grid no longer writes `grid-template-columns`/`grid-auto-rows` as raw inline styles. Track templates now use StyleX dynamic styles (CSS-variable indirection), so consumer `xstyle` overrides — including responsive `@media` overrides — take effect instead of being defeated by inline styles.
- NumberInput, DateInput, and DateTimeInput now set `aria-invalid="true"` and announce a short message (e.g. "Invalid number" / "Invalid date" / "Invalid time") via a visually-hidden `role="alert"` live region while the currently typed input is unparseable, instead of only dimming the text color and then silently reverting the value on blur. Screen-reader users now get feedback that their entry was rejected rather than silence, and the invalid state is no longer signaled by color alone (WCAG 3.3.1 Error Identification, 1.4.1 Use of Color). The revert-on-blur behavior is unchanged. (#3343)
- InputGroup: grouped TextInput and NumberInput controls now include both the group label and their own label in the input name, while preserving the group's description and status associations (#3343).
- InputGroup: the group is now named by the field label via `aria-labelledby` instead of a duplicated `aria-label`, and the label no longer carries an orphaned `htmlFor` (its `inputId` was never handed to a child). Uses the `Field` `isGroupLabel`/`labelID` support (#3343).
- Kbd: the component is no longer entirely `aria-hidden`. It now exposes a spoken accessible name (e.g. "Command + K") built from screen-reader-friendly key labels, while the visual glyphs (⌘, ⇧, ↵, …) are hidden from assistive tech. Previously any shortcut communicated only via `Kbd` — including CommandPalette's footer hints — was invisible to screen-reader users (#3343).
- Use Kbd for arrow-key navigation hints and space the hint farther from focused controls so outlines stay visible.
- Layer/popover entry animations now honor `prefers-reduced-motion`. The shared layer slide/scale keyframes (used by DropdownMenu, Popover, HoverCard, Tooltip, Selector, and other popover surfaces) and the `useEntryAnimation` presets disable their keyframe animation under `prefers-reduced-motion: reduce`, so layers appear instantly instead of translating/scaling in (#3343).
- useLayer: the popover `toggle` event listener is now removed when the layer element detaches or when the handler identity changes (a new `onHide`), instead of accumulating stale-closure listeners on the same element. This prevents duplicate/stale `onHide` firing over a layer's lifetime (#3343).
- Link: hovering now shifts the link color via the hover tint (`color-mix` with `--color-tint-hover`, matching Slider/Switch/RadioList). This gives always-underlined links (`hasUnderline`) a visible hover affordance they previously lacked — their underline never changed on hover — without altering the default link's underline-on-hover behavior (#2852)
- Link: external links (`isExternalLink`) now include visually-hidden "(opens in new tab)" text so screen-reader and cognitive-load users are told about the new-tab context change — previously only a decorative `aria-hidden` icon signalled it. The text is overridable via the new `newTabLabel` prop for localization (#3343).
- DropdownMenu/ContextMenu: the `role="menu"` container now has an accessible name — DropdownMenu names it from the trigger's label, and ContextMenu exposes a `menuLabel` prop (default "Context menu"). ContextMenu also no longer places `aria-haspopup="menu"` on its role-less, non-focusable trigger wrapper, where it conveyed nothing useful to assistive tech (menus-13, menus-15).
- NavHeadingMenu: `onClick`-only items (rendered without an `href`) now activate on Enter and Space. Previously these `role="menuitem"` elements had no keyboard activation, so keyboard and screen-reader users could focus them but not trigger them (#3333)
- Pagination: coerce pageSize to a positive integer so 0/NaN/negative values no longer crash the dots variant (RangeError: Invalid array length) or render Infinity/NaN page counts; the Table pagination plugin applies the same guard since it computes totalPages independently (#3372)
- usePopover: add a `role` (`'dialog' | 'none'`) and `isModal` option so listbox and menu popups no longer announce a false modal dialog. Selector, MultiSelector, BaseTypeahead, PowerSearch, DropdownMenu, TabMenu, and the Chat mention menu now expose their own `listbox`/`menu` role instead of being wrapped in `role="dialog" aria-modal="true"` while focus stays on the trigger. Genuine dialog popovers are unchanged (#3343).
- ProgressBar: determinate progress now uses `role="progressbar"` instead of `role="meter"`. `meter` is for static gauges (disk usage, battery) that screen readers do not treat as live-updating task indicators; a progress bar conveys task completion and should be announced on update. Indeterminate progress was already `progressbar` (#3343).
- RadioList: give an unselected radio group a deterministic keyboard tab stop. When focus enters a group with no selected value, the group now normalizes the entry point — first radio when tabbing forward, last radio when tabbing backward — matching the ARIA radio-group pattern. A selected value keeps its native tab stop, and moving between radios inside the group is never redirected. (#3390)
- RadioList: the group is now named via `aria-labelledby` pointing at the field label element, and the label no longer carries an orphaned `htmlFor` (it pointed at an id no radio used, so clicking it did nothing and the group was double-labeled). `Field`/`FieldLabel` gain optional `labelID` and `isGroupLabel` props to support grouping controls (#3343).
- Table, CodeBlock, and Markdown: the keyboard-focusable scroll containers now use `role="group"` instead of `role="region"`. `region` is a landmark, so multiple same-named scroll regions on one page (e.g. several tables labelled "Table") triggered axe `landmark-unique`. `group` keeps the label and keyboard focusability without creating duplicate landmarks. (#3343)
- CodeBlock/Table/Markdown: overflowing scroll regions are now keyboard-focusable (`tabIndex`, `role="region"`) so keyboard users can scroll long code and wide tables. CodeBlock's Copy button no longer collapses the block when clicked, and is no longer nested inside the collapsible header's `role="button"` (#3343).
- SegmentedControl: a disabled segment (including when the whole control is disabled) is no longer a keyboard tab stop. Previously the selected segment kept `tabIndex={0}` while disabled, so it was focusable but silently dead — arrow keys and activation did nothing (#3343).
- SegmentedControl: keep the radiogroup reachable by Tab even when the current `value` matches no item (or the selected item is disabled). Previously a stale/unmatched value left every segment at `tabIndex={-1}`, so the whole control dropped out of the tab order. The first enabled segment is now promoted to the tab stop (#3343).
- Selector/MultiSelector: `Delete` and `Backspace` now clear the value from the focused trigger when `hasClear` is set, so clearing a selection is no longer mouse-only. The clear button was already keyboard-reachable; this adds the keyboard shortcut path (#3343).
- Selector/MultiSelector (`hasSearch`): the popup's search input is now the combobox — it carries `role="combobox"`, `aria-expanded`, `aria-autocomplete="list"`, `aria-controls`, and `aria-activedescendant`, so screen readers announce the highlighted option as ArrowUp/Down move it. Previously the search input was a bare `searchbox` while `aria-activedescendant` stayed on the (now-unfocused) trigger, leaving highlight changes silent. In `hasSearch` mode the trigger is a plain button that opens the listbox rather than a second combobox (#3343).
- Selector, MultiSelector: the combobox trigger is now keyboard-focusable (`tabIndex=0` when enabled). Previously it was `tabIndex=-1`, so keyboard and screen-reader users could not open or operate the control in the default (non-search) mode. The Clear button is now keyboard-reachable too (#3320)
- useLayer: guard `showPopover()`/`hidePopover()` behind a feature check so overlays degrade gracefully instead of throwing a TypeError on browsers without the Popover API (Safari <17, Firefox <125) (#3343).
- SideNavItem: for split-action items (a collapsible item with its own link/action), `aria-current="page"` now sits on the focusable link instead of the non-interactive wrapper `<div>`, so screen readers announce the current page on the actual navigation element (#3343).
- SideNavHeading: label the product icon link with the heading text so it has an accessible name. When superheadingHref, headingHref, and a menu were all set, the icon link to the heading href rendered with no text or aria-label, so axe flagged it under link-name and screen readers announced an unlabeled link. (#3343)
- Skeleton: the loading placeholder is now `aria-hidden` by default (it's decorative — the surrounding region conveys the loading/busy state) and its pulse animation is disabled under `prefers-reduced-motion: reduce`. The `aria-hidden` default can be overridden by consumers (#3343).
- Spinner: the rotation animation now slows substantially under `prefers-reduced-motion: reduce` (matching ProgressBar) instead of spinning unconditionally. The `role="status"` "Loading" announcement still conveys busy state (#3343).
- Table: proportional() and pixel() no longer throw when called from a React Server Component. The Table barrel carried a 'use client' directive that marked the pure column utilities as client functions; the directive now lives only on the component modules, and Table.doc.mjs documents which parts of the data-driven API are server-safe (#3457)
- TabList: stop rendering aria-orientation on the nav element. aria-orientation is not an allowed attribute on the navigation role, so it triggered a critical axe aria-allowed-attr violation (also surfaced via Toolbar and ToolbarEdgeCompensation stories that reuse the same DOM). The orientation prop still drives arrow-key navigation and the keyboard hint. (#3343)
- TimeInput/DateTimeInput: parse dotted meridiems correctly. "2:30 p.m." was silently accepted as 02:30 and "12 a.m." as noon because the meridiem-detection regex did not allow the dots that the AM/PM regexes accept; hasMeridiem is now derived from those regexes so they cannot drift (#3462)
- Toast: keyboard users can now reach and manage notifications. Pressing `F6` jumps focus into the toast viewport (the newest toast's first control, or the container). Dismissing a toast that holds focus now hands focus to a remaining toast — or restores the element focused before entering the viewport — instead of dropping to `<body>`. Auto-hide timers also pause while the window is blurred and resume on focus, so a toast no longer silently expires while you're in another window or tab (#3343)
- Toast: remove the invalid `aria-modal` attribute from the notifications viewport. `aria-modal` is only valid on `role="dialog"` / `alertdialog`, so declaring it on the `role="region"` viewport was flagged by axe (`aria-allowed-attr`). Because the viewport renders on every page, this surfaced the violation across the whole app (#3343).
- Tooltip: satisfy WCAG 1.4.13 (Content on Hover or Focus). Tooltips can now be dismissed with `Escape` while visible, and stay open when the pointer moves from the trigger onto the tooltip surface (a short hover bridge). `useLayer` context render props gain `onMouseEnter`/`onMouseLeave` on the layer container to support hoverable overlays.
- TopNavHeading: give the logo an accessible name when it links to a destination. The logo image is decorative, so a logo wrapped in `headingHref` produced an unnamed link (axe: link-name). It is now labelled from `heading` (or a new optional `logoLabel` prop for logo-only headings). (#3343)
- TreeList: parent rows can now be expanded and collapsed from the keyboard. Any item with children renders a real focusable toggle button with `aria-expanded`, so expansion no longer requires a mouse — previously items without an `onClick`/`href` had no focusable control at all (#3343).
- Typeahead/Tokenizer: close the results dropdown when focus leaves the input (e.g. tabbing away), matching the existing outside-click and Escape dismissal. Previously the menu could stay open after the trigger lost focus.
- ContextMenu and NavMenu heading menus now support first-character typeahead (type a letter to jump to the matching item), via the shared `useTypeahead` hook — matching DropdownMenu. MoreMenu inherits it through DropdownMenu (#3343).
- useListFocus (menu/toolbar keyboard navigation): arrow keys, Home, and End now skip disabled items instead of stalling on one whose `.focus()` silently no-ops. This unfreezes keyboard navigation in NavHeadingMenu and Toolbar/ButtonGroup when a disabled control is present. The default item selector also now matches `menuitemradio`/`menuitemcheckbox` (#3343).

#### Documentation

- Document Carousel's hasEdgeFade and padding props, supported by the component but missing from the props table, docsZh, and docsDense (same omission previously fixed for Text's justify and ToggleButton's isIconOnly). Also correct the Fade edges anatomy row to optional, since the mask is suppressible via hasEdgeFade (#3332)
- Fix stale references in the core README: rename the "XDS CLI" section to "Astryx CLI", correct component names to their current bare exports (Layout, AppShell, TopNav, SideNav), and update remaining XDS brand mentions to Astryx.
- Link: document `type="inherit"` for inline links. The value was already supported (forwarded to `Text`, which renders `font-size`/`line-height: inherit`), but undocumented — clarified the `type` prop JSDoc, added an inline-link example, and added regression tests covering the inherit/default-body behavior (#2927)
- MetadataListItem: its docs page preview now renders inside a MetadataList wrapper with realistic defaults (#3318)

#### Other Changes

- Consolidated 5 inline visually-hidden style blocks into the shared VisuallyHidden primitive (Button, Link, ProgressBar, Switch, TextArea); no behavior change.
- Rename the Field `labelElementID` prop to `labelID`, matching the `(part)ID` naming convention used by the sibling props (`inputID`, `descriptionID`, `messageID`). The disambiguation between "the id applied to the label element" and `inputID` ("the control the label points at") now lives in the prop JSDoc rather than the name. Also renamed on FieldLabel and updated the RadioList/CheckboxList/InputGroup consumers. No behavior change. (#3343)
- `useGridFocus` gains `hasRovingTabIndex`, `handleFocus`, and `isRtl`, matching the `useListFocus` API. Calendar now uses `useGridFocus` to own its roving tab stop, removing the unpublished `useCalendarRovingTabindex` hook.
- SegmentedControl now uses the shared useListFocus roving-tabindex primitive instead of its inline keyboard handler and tab-stop repair effect; no behavior change.
  The component's ~60-line inline ArrowLeft/Right/Home/End handler and useIsomorphicLayoutEffect tab-stop repair are replaced by useListFocus({hasRovingTabIndex: true, wrap: true, orientation: 'horizontal'}), which owns the single roving tab stop, skips disabled radios, wraps, handles Home/End, and repairs the stop on mount/disable. Selection-follows-focus (APG radiogroup) is preserved via a container onFocus handler that selects the focused radio's value.
- Move `@stylexjs/stylex` from `dependencies` to a required `peerDependency` (`^0.18.3`). A consumer who authors their own StyleX now shares a single runtime with astryx — resolution dedupes to their own install in both browser and Node — instead of silently getting a second copy on version drift. An incompatible StyleX version is now flagged at install (npm errors, pnpm/yarn warn) instead of resolving silently. Consumers who don't author StyleX are unaffected: the runtime is still required to render astryx components and is auto-installed by npm 7+ and pnpm.
- New `TableContextAction` type and an optional `contextMenuActions` field on
  `HeaderCellRenderProps` / `BodyCellRenderProps`. Plugins append their actions
  inside the existing `transformHeaderCell` / `transformBodyCell` transforms;
  the table concatenates them across plugins (never overridden), the same way
  `styles` are merged.
- The cell components (`TableHeaderCell` / `TableCell`) own the menu wrapper and
  render it around their own content via the `ContextMenuActions` prop, so the
  cell controls how the wrapper interacts with padding / content sizing — and
  row menus work without invalid `<tr>` nesting. Actions group with dividers and
  show a checkmark for the active item; when none are contributed, the native
  browser menu passes through.
- `contextMenuActions` accepts either an array or a getter
  (`() => TableContextAction[]`); the getter is resolved lazily when the menu
  opens, so plugins with state-derived actions don't build arrays on every
  render. `useTableSortable` uses a getter so its checked/clear state always
  reflects the latest sort.
- First contributor: `useTableSortable` adds "Sort ascending / Sort descending
  / Clear sort" on sortable headers.
- TabList now uses `useListFocus`'s built-in roving-tabindex support (`hasRovingTabIndex`) instead of a hand-rolled tab-stop repair effect. The hook owns the single tab stop — stamping tabindex 0/-1, repairing it on mount and as stops mount/unmount or toggle disabled, and keeping it in sync after clicks/programmatic focus via `handleFocus` on the nav. Individual Tabs still render `tabIndex={isSelected ? 0 : -1}` as the initial source of truth, which the hook's repair preserves. No behavior change.
- useTreeFocus gains `hasRovingTabIndex` + `handleFocus` for internal tab-stop management; TreeList drops its inline `activeId` state and lets the hook own the roving tab stop (#3488).

#### Contributors

Thanks to everyone who contributed to this release:

- @AKnassa
- @arham766
- @athz
- @cixzhang
- @durvesh1992
- @ejhammond
- @humbertovirtudes
- @IFAKA
- @imdreamrunner
- @thedjpetersen

---

# 0.1.2

#### Breaking Changes

- `Text`, `Heading`, `Link`, and `Timestamp` rename the `color="active"` value to `color="accent"`, now mapping to the dedicated `--color-text-accent` token (legible accent text ink) instead of `--color-accent`. Run `astryx upgrade` to migrate call sites automatically. (#2863)

#### New Features

- Button: add `isInterruptible` to keep the button clickable while a `clickAction` is pending — the spinner and `aria-busy` still show, but the button is not disabled or deduped, so a re-click interrupts the in-flight action. ToggleButton's async toggle now runs through this path, staying interruptible.
- Add a prebuilt UMD bundle (`dist/astryx.umd.js`, global `Astryx`) plus `unpkg`/`jsdelivr` fields, so the library works directly from a CDN via a `<script>` tag with no bundler. React/ReactDOM stay as peer globals; the StyleX runtime is bundled in.
- Add `useTableStickyColumns` — pin a contiguous run of `Table` columns to
  the start and/or end edge with cumulative offsets and scroll-aware drop shadows.
  Configure with `{ startKeys, endKeys }`; an empty config is a valid no-op.

#### Fixes

- AvatarGroupOverflow now forwards rest props (data-_, aria-_, event handlers, id, role, tabIndex) to the rendered element, matching the behavior of Avatar and AvatarGroup.
- Fix HoverCard SSR hydration mismatch when used inside an SSR Client Component (#3107). The floating layer now renders inline instead of portaling to `document.body`, so server and client markup match. No API change.
- Kbd: use the `--color-border-emphasized` token for its bottom border instead of `--color-border` (#2850)
- useLayer now treats `anchor-name` as a comma-separated list, so multiple layers can anchor to the same element (e.g. two TopNavMegaMenus in one nav) without clobbering each other's anchor. Previously the second menu lost its anchor and rendered over the nav.
- Fix mobile nav drawer not re-opening after it is closed (#3091)
  The AppShell mobile drawer mounts `MobileNav` inside an `<Activity>` that
  switches to `mode="hidden"` when the drawer closes. On close, React runs the
  drawer effect's cleanup (with a stale `isOpen`) instead of re-running the
  effect with `isOpen=false`, so the deferred `dialog.close()` never fired and
  the native `<dialog>` was left `open` in the hidden subtree. The next open then
  skipped `showModal()` (the dialog was already open), so the drawer could be
  opened and closed once but never re-opened. The effect cleanup now closes the
  dialog if it is still open, keeping the native dialog state in sync so a
  subsequent open cleanly calls `showModal()` again.
- Core components (`Banner`, `EmptyState`, `Markdown`) no longer render a `<p>` by default — they render `<div>` (appearance unchanged). This avoids hydration mismatches when block content lands in a `<p>`. `Markdown` paragraphs use `role="paragraph"`; pass `components={{paragraph: 'p'}}` to opt back into `<p>`.
- `Pagination`'s `changeAction` is now interruptible — page changes run in a transition with optimistic page state, so rapid prev/next clicks advance through pages instead of being dropped. `Button`'s `clickAction` keeps its single-fire guard.
- make the `Slider` default track color visible on muted backgrounds
  The background track painted with `--color-background-muted` — the same token
  used for muted surface fills — so the track disappeared on muted backgrounds.
  The track now uses the dedicated `--color-track` channel token, which is
  designed to stay legible against body/muted surfaces.
- Polish `useTableStickyColumns` pinned-cell backgrounds so they match the
  rest of the row:
- Table: the header row no longer picks up the `hasHover` row highlight — hover (and striped) styling now applies to body rows only. Adds an internal `isHeaderRow` flag on the row component so the header row in `<thead>` opts out (#2734)
- `Timestamp` now renders the current time (and small clock skew up to ~30s in the future) as "now" instead of "in a few seconds" (#3099).
- ToggleButton onPressedChange receives the click event for preventDefault opt-out
  `onPressedChange` now receives the originating click event as a second
  argument. Calling `event.preventDefault()` skips `pressedChangeAction`, so a
  consumer can handle the toggle entirely in `onPressedChange` without firing the
  action — matching how `Switch`'s `onChange` and `Button`'s `onClick` already
  gate their action props. Existing `(isPressed) => void` handlers keep working;
  the event is an added trailing argument.
- Tokenizer/PowerSearch: align end content (clear button, resultCount) with the field's inline padding instead of hugging the border (~3px). It now uses spacing-2 (8px) to match the text/start-icon inset (#2849)
- Tooltip and HoverCard: add ARIA roles to the floating layers — `role="tooltip"` on Tooltip (completing the ARIA tooltip pattern; the trigger already links via `aria-describedby`) and `role="dialog"` on HoverCard. Plumbed via a new optional `role` on the layer render props. (#3240; Popover already exposes `role="dialog"`.)

#### Documentation

- Document Banner's `defaultIsExpanded` prop, which controls whether the collapsible content area starts expanded but was missing from the docsite properties tab
- Rename the ClickableCard and SelectableCard examples to follow the "Component — Variant" title convention (`Clickable Card — Nested Button`, `Selectable Card — Multi-select`), and add playground defaults to both card docs so their docsite previews show realistic card content (#2877)
- Declare playground scaffolds for the Chat sub-components so they preview at a realistic width (ChatComposer and ChatComposerDrawer wrap in a sized container, and the drawer seeds default content), and drop the redundant visible value label from the ChatComposerDrawer "With Progress" example while keeping the accessible label (#2877)
- Document two public props missing from the docsite properties tab: List's `start` (ordered-list counter start) and CheckboxInput's `isReadOnly`
- Restore the Icon and Skeleton properties-tab previews on the docsite. Icon now seeds a default `icon` (it was a required, non-generatable prop), and Skeleton renders with concrete preview dimensions instead of collapsing at `100%` (#2848, #2875)
- Document Heading's `justify` prop, which was supported by the component but missing from the docsite properties tab (#2847)
- OverflowList: seed example items via playground defaults so the docsite properties-tab preview renders a real list instead of an empty container (#2872)
- Document Section's `paddingBlock` prop (block-axis padding override), which was supported by the component but missing from the docsite properties tab
- Give the `Skeleton` properties-tab example explicit dimensions so it is visible
  The `Skeleton` doc had no `playground` config, so the interactive
  properties-tab preview fell back to the prop defaults of `width: '100%'` /
  `height: '100%'`. With no sized parent, the skeleton collapsed to a zero-size
  (invisible) element. The doc now sets a `playground.defaults` of
  `width: 320` / `height: 80` so the shimmer placeholder renders visibly.
- Update stale `facebookexperimental/xds` doc/JSDoc links to the current `facebook/astryx` namespace in source comments (theme/syntax `@see` references). The old org 301-redirects, so these weren't broken — just stale — and this matches the canonical org used elsewhere
- Document Table's `verticalAlign` and `textOverflow` props, which were supported by the component but missing from the docsite properties tab
- Document TabList's `layout` prop ('hug' | 'fill') for tab sizing, which was supported by the component but missing from the docsite properties tab
- Document Text's `justify` prop, which was supported by the component but missing from the docsite properties tab (same omission previously fixed for Heading) (#2847-adjacent)
- Restore the Timestamp properties-tab preview on the docsite. `value` is a required prop with no semantic default, so the preview rendered "Invalid time value"; it now seeds a valid ISO 8601 date (#2877)
- Document ToggleButton's `isIconOnly` prop, which was a supported public prop but missing from the docsite properties tab
- Make the Toolbar "Table Filter" example use real Selector controls for its Status and Priority filters instead of buttons styled to look like dropdowns, and add meaningful playground defaults plus richer slot options (buttons, icon buttons, tabs, segmented controls, selectors) to the Toolbar docs (#2877).

#### Other Changes

- Pinned cells paint an opaque base via the overridable
  `--table-sticky-background` variable (defaults to `--color-background-card`),
  fixing a grey mismatch in themes/modes where `surface !== card` (e.g. neutral
  dark). Consumers on a different backdrop override the variable.
- The row's overlay (striping and/or hover) is replayed on the pinned cell via
  a background-image gradient. `TableRow` publishes its current overlay color as
  the inheritable `--table-row-overlay` variable, so pinned columns mirror the
  row exactly — striped when the table is striped, hover when enabled, nothing
  otherwise (no phantom stripes) — transitioning in lockstep with the row.
- `background-clip: padding-box` keeps the row divider visible on pinned cells.
- New `transformScrollWrapper` hook (+ `ScrollWrapperRenderProps`) lets plugins attach a `ref`
  to the horizontal scroll container and inject before/after chrome.
- `transformHeaderCell` / `transformBodyCell` now receive `columnIndex` and the
  full ordered `columns` list (also surfaced on the render props), enabling
  position-aware plugins such as sticky columns. Existing plugins are unaffected
  — the new args and methods are additive and optional.

#### Contributors

Thanks to everyone who contributed to this release:

- @cixzhang
- @durvesh1992
- @ernesttien
- @humbertovirtudes

---

# 0.1.1

#### Breaking Changes

- Rename `xdsTokenDefaults` export to `tokenDefaults`
  The token-defaults constant is renamed from `xdsTokenDefaults` to
  `tokenDefaults` (exported from `@astryxdesign/core/theme`). Update imports
  accordingly. Part of removing xds naming from the public API.

#### Fixes

- Increase trailing padding on `ChatLayoutScrollButton` when a label is shown
  With a label (e.g. "New messages"), the chevron icon sits on the leading edge
  and the text on the trailing edge. The symmetric inline padding left the label
  text cramped against the pill's rounded corner. The trailing inline padding is
  now widened when a label is present, giving the text comfortable breathing room
  from the rounded edge. The icon-only (collapsed) state is unchanged and stays
  balanced.
- Prevent `DateInput` from crashing the page while typing an incomplete
  date. Typing a leading `0` or `1` (e.g. starting to enter `01` for January)
  could coerce the in-progress value into an invalid date with a year of `0`,
  which then threw a `RangeError` and crashed the surrounding page. Partial,
  not-yet-complete input is now treated as incomplete instead of being parsed
  into a date, so the field stays usable as you type.
- Remove doubled focus ring on `Selector`. The inner combobox button drew
  its own `:focus-visible` outline on top of the wrapper's `:focus-within` ring,
  producing a stacked, rounded outline over the trigger after selecting an option
  or navigating with the keyboard. The button now defers to the wrapper's focus
  ring, matching `TextInput` and `NumberInput`.
- `<Layout>…</Layout>` no longer renders a blank page. `Layout` is
  slot-driven (`content`/`header`/`start`/`end`/`footer`), and the natural nested
  form `<Layout><LayoutContent /></Layout>` previously type-checked and built
  green while dropping its children at runtime — an empty shell. Children now
  render as a shorthand for the `content` slot (`<Layout>{main}</Layout>` is
  equivalent to `<Layout content={main} />`), matching how `Card` and `Section`
  accept content; an explicit `content` prop still wins when both are provided.
- ToggleButton runs pressedChangeAction in an interruptible transition with optimistic state
  `pressedChangeAction` was fired as a non-awaited promise, so the documented
  loading spinner never appeared and the toggle ignored the action's lifecycle.
  It now runs inside a transition with an optimistic pressed state, matching
  `Switch`:

#### Other Changes

- The optimistic pressed state flips immediately on click; the spinner is
  debounced so a fast action shows the new state without a spinner flash.
- The action is interruptible — clicking again while it is pending starts a
  new transition with the next optimistic state (e.g. true -> false -> true),
  instead of being dropped or guarded out.
- Synchronous handlers are supported too: a `pressedChangeAction` (or
  `onPressedChange`) that synchronously triggers a suspending update, such as
  a router navigation that suspends on data, also drives the pending state.
  `pressedChangeAction` now accepts `void | Promise<void>`.

#### Contributors

Thanks to everyone who contributed to this release:

- @cixzhang
- @ejhammond
- @josephfarina

---

# 0.1.0

#### Breaking Changes

- Rename theme-token helpers off the XDS name
  The `@xds/core/theme` token helpers are renamed: `resolveXDSThemeTokens` ->
  `resolveThemeTokens`, `resolveXDSThemeToken` -> `resolveThemeToken`,
  `xdsTokenVar` -> `tokenVar`, `xdsTokenVars` -> `tokenVars`, and the option types
  `ResolveXDSThemeToken(s)Options` -> `ResolveThemeToken(s)Options`. Update imports
  from `@xds/core/theme` / `@xds/core/theme/tokens`. Part of removing `xds` naming
  from the public API.
- Remove the XDS-prefix compatibility layer — astryx is now the only public surface
  This release erases all `xds` naming from the public API; there is no compatibility
  window. Consumers must migrate (we own all consumers pre-OSS):
- Remove the daily, brutalist, and default themes; neutral is the new baseline
  Three theme packages are removed from the repo and will no longer be published:

#### New Features

- Underline links by default in the Markdown component
  Markdown links now render with a persistent underline instead of only underlining on hover, making links clearly distinguishable from surrounding text and improving accessibility. The accent color is unchanged.

#### Fixes

- Markdown: parse ordered lists using the `)` marker delimiter, not just `.` (#2994)
  CommonMark 5.2 allows an ordered-list marker to end in `.` or `)` (e.g. `1)`), but the parser only matched `\d+\. `, so `1) First` lists rendered as literal paragraph text. Lists now capture their delimiter — a `.` → `)` change starts a new list, including across streamed chunks — and paragraph interruption follows CommonMark (only a marker value of 1, including zero-padded like `01.`, may interrupt).

#### Other Changes

- **Component names:** the `XDS*` aliases are gone — use bare names (`Button` not
  `XDSButton`, `useTheme` not `useXDSTheme`, `ButtonProps` not `XDSButtonProps`). The
  `drop-xds-prefix-imports` codemod automates this.
- **CSS classes:** components emit only `.astryx-*` (the dual `.xds-*` class is gone).
  Update custom CSS selectors `.xds-button` -> `.astryx-button` (prop/state value classes
  like `.primary`/`.sm` are unchanged).
- **data attributes:** only `data-astryx-theme` / `data-astryx-media` are written; update
  custom selectors and SSR root attributes off `data-xds-*`.
- **CSS layers:** `@layer xds-base` / `xds-theme` are renamed to `astryx-base` /
  `astryx-theme`; update your `@layer` order line and any PostCSS `layersBefore` config.
  `@astryxdesign/build`'s default library layer is now `astryx-base`.
- **Pre-compiled stylesheet:** the `@astryxdesign/core/xds.css` export is removed — import
  `@astryxdesign/core/astryx.css`.
- **CSS custom properties:** the `--xds-*` padding fallback is gone; set `--astryx-*`.
- **CLI config key:** `@astryxdesign/cli` reads the package.json `"astryx"` field (was `"xds"`).
  Rename the block; a stale `"xds"` key silently drops the package from discovery.
- `@astryxdesign/theme-daily`
- `@astryxdesign/theme-brutalist`
- `@astryxdesign/theme-default`
- import {defaultTheme} from '@astryxdesign/theme-default/built';
  - import {neutralTheme} from '@astryxdesign/theme-neutral/built';
- <Theme theme={defaultTheme}>...</Theme>
  - <Theme theme={neutralTheme}>...</Theme>

  ```

  ```

- Rename the npm package scope from `@xds/*` to `@astryxdesign/*`
  All published packages move to the new `@astryxdesign` scope (e.g. `@xds/core` → `@astryxdesign/core`), along with the workspace lockfile, build/runtime scope-directory scans, and docsite slug derivation. Consumers must update their imports and dependency names. The internal ESLint plugin namespace (`@xds/*` rules) is intentionally untouched and tracked separately. Existing `@xds/*` codemods continue to target the old scope so projects still on `@xds/*` can migrate.

#### Contributors

Thanks to everyone who contributed to this release:

- @cixzhang
- @ejhammond
- @kentonquatman
- @lexs

---

# 0.0.15

This release makes **bare component names canonical**: `Button`, `Stack`, `useTheme`, etc. are now first-class, and the `XDS*` / `useXDS*` names become compatibility aliases. Existing prefixed code keeps working through the alias layer — migrate when you're ready with the codemod below. It also lands several prop/component renames for cross-component consistency, each with its own codemod.

#### Breaking Changes

- **Un-prefix migration — bare names are canonical** — Every `XDS*` component, hook, and type now has a bare alias (`XDSButton` → `Button`, `useXDSTheme` → `useTheme`, ~634 identifiers across 100 barrels). The prefixed names still work as aliases during the compat window, so this is non-breaking if you do nothing — but bare names are the new default for docs, discovery, and new code. (#2941)
  **Codemod:** `npx astryx upgrade --codemod drop-xds-prefix-imports`
- **`@xds/core` un-prefix** — `XDSMetaAppShell` → `MetaAppShell` and related meta-app exports drop the `XDS` prefix. (#2957)
  **Codemod:** `npx astryx upgrade --codemod drop-xds-meta-prefix`
- **DatePicker components renamed to Input** — `XDSDateTimePicker` → `XDSDateTimeInput` and `XDSDateRangePicker` → `XDSDateRangeInput` (plus their props, size, and hour-format types), for consistency with `DateInput`/`TextInput`/`NumberInput`. (#2276)
  **Codemod:** `npx astryx upgrade --codemod rename-date-picker-to-input`
- **Stack `element` → `as`** — `XDSStack`, `XDSHStack`, `XDSVStack`, and `XDSStackItem` use `as` instead of `element`, matching other polymorphic components. (#2441)
  **Codemod:** `npx astryx upgrade --codemod rename-stack-element-to-as`
- **Chat `isStreaming` → `isStopShown`** — On `XDSChatComposer` and `XDSChatSendButton`, the prop that controls the stop-button affordance is renamed to describe what it does rather than implying a streaming state. (Unchanged on `XDSMarkdown`/`XDSChatReasoning`.) (#2333)
  **Codemod:** `npx astryx upgrade --codemod rename-isStreaming-to-isStopShown`
- **Imperative handles move to `handleRef`** — `XDS*` components reserve `ref` for the root DOM element. Components exposing an imperative handle (`XDSCalendar`, `XDSChatComposerInput`, `XDSPowerSearch`, `XDSTokenizer`, `XDSChartStreamGL`) now expose it via `handleRef`; `XDSSideNavCollapseButton`'s `sideNavRef` is also renamed to `handleRef`. (#2363)
  **Codemod:** `npx astryx upgrade --codemod rename-imperative-ref-to-handleRef`
- **Menu/Selector trailing content: `children` → `endContent`** — `XDSDropdownMenuItem`, `XDSContextMenuItem`, and `XDSSelectorOption` use `endContent` for trailing badges, status icons, shortcuts, and other end-aligned content; the previous trailing-content `children` prop is removed. (#2802)
  **Codemod:** `npx astryx upgrade --codemod migrate-item-children-to-endcontent`
- **Selector custom rendering: function-children → `renderOption`** — `XDSSelector` and `XDSMultiSelector` use the `renderOption` prop for custom option rendering; the previous function-as-children renderer is removed. (#2821)
  **Codemod:** `npx astryx upgrade --codemod migrate-selector-children-to-render-option`
- **CheckboxList loading is now per-item** — The group-level `isLoading` on `XDSCheckboxList` is removed in favor of `isLoading` on `XDSCheckboxListItem`. In collection mode the toggled item shows its spinner automatically while its `changeAction` is pending. (#2903)
- **Chat `messageGap` → `gap`** — `XDSChat` renames `messageGap` to `gap`. (#2325)
- **FileInput `onChangeAction` → `changeAction`** — Aligns `XDSFileInput` with the React 19 action-prop convention used across the system. (#2288)
- **PowerSearch preset types → `*FilterPreset`** — Preset type exports are renamed for clarity. (#2925)
- **`CenterAxis` → `XDSCenterAxis`, `DateRange` unprefixed** — Type-export naming cleanups for consistency. (#2289, #2922)
- **Stepper moved to `@xds/lab`** — `XDSStepper`/`XDSStep` move to the lab package while the API is reworked; import from `@xds/lab`. (#2335)

#### Upgrade

```bash
npx astryx upgrade --apply
```

This runs the release codemods in sequence. The bare-name migration (`drop-xds-prefix-imports`, `drop-xds-meta-prefix`) and the theme data-attribute migration (`migrate-theme-selectors-to-data-attrs`) are optional — run them explicitly when you're ready, e.g.:

```bash
npx astryx upgrade --codemod drop-xds-prefix-imports --codemod-only --apply
```

#### New Components

- **XDSLightbox** — Image/media lightbox with overlay presentation. (#2298)
- **XDSItem** — Shared item primitive with `compact`/`balanced`/`spacious` density and `startContent`/`endContent` slots, now composed by `XDSListItem`. (#2259)
- **XDSOutline** — Sliding-indicator outline/nav with density variant and CSS anchor positioning. (#2347, #2746)
- **useXDSInteractiveRole / XDSInteractiveRoleContext** — Coordinate interactive-role semantics across nested components. (#2399)

#### New Features

- **Bare-name subpath exports** — `@xds/core/Heading`, `@xds/core/Code`, `@xds/core/HStack`, `@xds/core/VStack` ship as convenience subpaths. (#2420)
- **Field `width` prop** — Field-based components accept a `width` (`SizeValue`) applied to the outer `XDSField`, so label, control, and status size together and stay aligned. Additive and backward compatible. Affects `XDSTextInput`, `XDSTextArea`, `XDSNumberInput`, `XDSDateInput`, `XDSDateRangeInput`, `XDSDateTimeInput`, `XDSTimeInput`, `XDSFileInput`, `XDSSelector`, `XDSMultiSelector`, `XDSTypeahead`, `XDSTokenizer`, `XDSSlider`, `XDSCheckboxInput`, `XDSCheckboxList`, `XDSRadioList`, `XDSSwitch`, and `XDSField`. (#2755)
- **`lg` size on all input components** — Inputs gain a large size option. (#2324)
- **Markdown `autolink="gfm"`** — `XDSMarkdown` gains an opt-in `autolink` prop enabling GitHub-Flavored Markdown autolink-literal rules (bare `https?://…`, `www.…`, `<scheme:url>`, `<email>`, `user@host`), skipping code spans, existing links, and image alt text. Also exposed on `parseMarkdown`, `parseInline`, and `parseMarkdownIncremental` via a new `ParseOptions` argument; the existing positional signature is preserved. Default behavior unchanged. (#2394)
- **Markdown `display="inline"`** — Render inline markdown spans that inherit surrounding typography, for doc text and table cells without block-level wrappers.
- **Visual props reflected as data attributes** — Components dual-emit `data-*` attributes for their variant/state axes (e.g. `data-variant`, `data-size`) alongside legacy bare variant classes, giving themes a stable selector surface. (#2792)
- **Spinner `shade="inherit"`** — Paints the ring from inherited `currentColor` (with a translucent track) so it always matches the parent's resolved foreground regardless of theme or variant.
- **Text/Heading `justify` prop** — Justified text alignment on `XDSText` and `XDSHeading`. (#2438)
- **AspectRatio `isCircle`** — Circular containers via `XDSAspectRatio`. (#2632)
- **Link renders a button when `href` is undefined** — `XDSLink` produces a semantic `<button>` for action links without an href. (#2507)
- **Carousel `hasEdgeFade` + padding props** — Edge-fade affordance and padding control; the scale animation is removed. (#2566)
- **Tab `isLabelHidden`** — Icon-only tabs omit empty label nodes so selected indicators align with the visible icon.
- **Menu placement options** — Additional placement controls for menu surfaces. (#2770)

#### Fixes

- **Button/Spinner loading contrast** — Fix poor loading-spinner contrast on themed variants; the spinner inherits the true variant foreground and the label hides correctly on destructive. (#2717)
- **Spinner centering** — Fix `XDSSpinner` rendering off-center inside the icon-only `XDSButton` loading state at fractional device pixel ratios; loading overlay and wrapper use `display: grid` + `place-items: center`.
- **ChatComposer caret** — `XDSChatComposerInput` preserves the caret when the parent updates the controlled `value`, fixing the caret jumping to offset 0 after slash-command picks.
- **Icon slots** — `renderIconSlot` renders semantic icon-name strings through `XDSIcon`; new `getIconRegistry()` lets tooling derive icon-name options from the same registry.
- **CommandPalette inline scroll** — `XDSCommandPaletteItem` no longer scrolls highlighted items into view on initial mount inside an inline dialog, preventing doc-page scroll jumps.
- **Docsite autofocus** — `XDSDialogHeader` skips title autofocus inside `XDSDialog isInline`; `XDSCommandPaletteInput` reads the shared dialog inline context.
- **HoverCard font** — Apply the theme body font token to XDS layer roots so portaled HoverCard content inherits the configured font family.
- **Info status icon** — The default `info` status icon uses a solid fill (matching `success`/`error`/`warning`) for better visibility at small sizes.
- **List/Item density** — `XDSListItem` passes density (`compact`/`balanced`/`spacious`) through to the shared `XDSItem`, fixing `balanced`/`spacious` collapsing to the same padding.
- **Markdown loose lists** — Join blank-line-separated same-style list items into a single loose list (CommonMark §5.3) and forward a non-default `start` onto the rendered `<ol>` for assistive tech and copy-paste.
- **AppShell mobile nav** — Fix mobile nav with a heading-only `XDSTopNav`; remove `useXDSSlotPresence`. (#2243)
- **Theme CSS prose regression** — Fix built theme CSS that broke Markdown typography in the docsite (headings lost block margins) after the un-prefix migration. `astryx theme build` now uses a single CSS generation path (`@xds/core`'s generator) and a failed `@xds/core/theme` import is a hard build error instead of a silent fallback. (#2964)
- **Escape-hatch & base-prop hygiene** — Many components had redundant `xstyle`/`className`/`style` re-declarations removed and now consistently extend `XDSBaseProps`, forward escape hatches, and expose `displayName` (require-base-props / require-ref-prop lint rules). (#2300, #2310, #2835, #2858)
- **Toast barrel export** — Export `XDSToast` and its props from the `@xds/core` barrel so docsite playground previews resolve Toast examples.
- **Typeahead id-less rows** — `XDSBaseTypeahead` uses a shared key fallback for search results without `id` values, so id-less rows no longer all render as selected.
- **SelectableCard transitions tokenized; ResizeHandle gains `className`.** (#2966)

#### Contributors

Thanks to everyone who contributed to this release:

- @cixzhang
- @czarandy
- @ejhammond
- @ernestt
- @imdreamrunner
- @josephfarina
- @kentonquatman
- @lexs
- @nynexman4464
- @rubyycheung

---

# 0.0.14

#### Breaking Changes

- **`on*Action` → `*Action` (React 19 convention)** — `onChangeAction` → `changeAction`, `onClickAction` → `clickAction`, `onPressedChangeAction` → `pressedChangeAction`, `onScrollToTopAction` → `scrollToTopAction`. Aligns with React 19 action prop naming. (#1942)
  **Codemod:** `npx astryx upgrade --codemod rename-action-props`
- **Status naming: `positive`/`negative` → `success`/`error`** — Converge status variant naming across all components. (#2175)
  **Codemod:** `npx astryx upgrade --codemod rename-status-variants`
- **Section `wash` → `muted`** — Rename variant for consistency with XDSCard. (#2063)
  **Codemod:** `npx astryx upgrade --codemod rename-section-wash-to-muted`
- **Stack `direction` defaults to `vertical`** — `XDSStack` no longer requires an explicit `direction` prop; omitting it gives vertical layout. (#1945)
- **Table `textOverflow` default changed to `truncate`** — Was `wrap`, now truncates by default with tooltip on hover. (#2096)
- **Remove deprecated `*Raw` token aliases** — Migrate any `*Raw` usage to standard tokens. (#2095)
- **Remove runtime font loading from `defineTheme`** — Fonts are now handled at the CSS level only. (#2226)

#### Upgrade

```bash
npx astryx upgrade --apply
```

This runs all three codemods (`rename-action-props`, `rename-status-variants`, `rename-section-wash-to-muted`) in sequence.

#### New Components

- **XDSAvatarGroup** — Stacked avatar display for teams and lists (#2183)
- **XDSInputGroup** — Combine multiple inputs into a single visual group (#2207)
- **XDSStepper / XDSStep** — Multi-step flows and progress indicators (#2206)
- **XDSButtonGroup** — Group related buttons with shared styling (#2202)
- **XDSContextMenu** — Right-click context menus with nested items (#2195)
- **XDSFileInput** — File upload with drag-and-drop support (#2184)
- **XDSDateRangePicker** — Date range selection with calendar UI (#2201)
- **XDSDateTimePicker** — Combined date and time input (#2199)
- **XDSBlockquote** — Styled blockquote component (#2198)
- **XDSOverlay** — Scrim + media theme overlay with CSS-first hover and touch support (#1912)
- **XDSNavHeadingMenu** — Container component with size and keyboard nav (#1999)

#### New Features

- **Link `to` prop** — Pass `to` alongside `href` for router compatibility (#2237)
- **Selector `hasSearch`** — Enable filtering/searching within selector options (#2142)
- **CodeBlock `container` prop** — Control width and border on code blocks (#2132)
- **Heading `display` type variants** — Large display headings for hero sections (#2054)
- **Text custom theme-defined types** — Support arbitrary text types from your theme (#1840)
- **Table structural children mode** — Use `<XDSTable>` with JSX children + Markdown integration (#2098)
- **Table content-aware column widths** — Auto layout for children mode (#2105)
- **Table responsive horizontal scroll** — Default column min-widths (#2043)
- **TabList carousel overflow** — Arrow navigation for overflowing tabs (#1978)
- **PowerSearch `components` map** — Per-type token and editor overrides (#2076)
- **Markdown `components` map** — Custom component injection + XDSCitation extraction (#2073)
- **Markdown `inlinePlugins`** — Custom text pattern rendering (#1917)
- **SideNav built-in resize** — Integrate `useXDSResizable` directly (#1877)
- **Resizable pill placement offset** — Auto-collapse flipping (#1876)
- **Theme `--color-track` token** — Spinner consumes it for fully tokenized track (#2170)
- **Server-safe utility subpath exports** — `@xds/core/server` for RSC (#1981)
- **XDSLinkProvider adoption** — All link-rendering components now use the provider (#1906)

#### Fixes

- **Chat composer paste** — Fix silently dropped paste when no forwarded ref (#2179)
- **Citation** — Prevent rest spread from overriding accessibility props; extend XDSBaseProps (#2217, #2092)
- **Field** — Neutral gray hover shadow, focus border on input, horizontal-labels grid, z-index containment, click-to-focus on wrapper (#2157, #2059, #1890, #1839)
- **FormLayout** — Equal-width horizontal children via CSS Grid (#2058)
- **Link `label`** — Make optional; aria-label harms AT on text links (#2031)
- **TopNav** — Stop click propagation on heading links, remove hover delay, add selected state to xdsClassName (#2135, #2133, #1997)
- **Spinner** — Simplify color resolution with useXDSTheme (#2124)
- **Markdown tables** — Reset container padding, alignment and width fixes (#2121, #2109)
- **Calendar** — Add isolation to day cell container (#2001)
- **CommandPalette/MultiSelector** — Prevent iOS zoom on input focus (#1993)
- **Dialog** — Target-based backdrop detection for native popup compat (#1892)
- **Typeahead** — Propagate generic type; prevent empty popover after selection (#2014, #1943)
- **Selector/MultiSelector** — Resolve nested button HTML violation (#1853)
- **ClickableCard** — Merge caller xstyle with internal interactive styles (#1893)
- **RadioList** — Extend XDSBaseProps for standard prop inheritance; fix typography tokens (#2093, #1902)
- **Tokenizer** — Add status to xdsClassName for theme targeting (#1995)
- **List** — Wrap header + list in column container for flex parents (#2017)
- **Section** — Propagate explicit padding to nested sections (#1972)
- **AppShell** — Match flex layout properties on sticky sidenav container (#1850)
- **Menu hover** — Gate behind `(hover: hover)` media query (#2046)
- **ResizeObserver** — Migrate all usage to shared singleton for performance (#1990)
- **Layout** — Container-driven edge compensation via :has() (#1987)
- **Missing `xdsClassName` hooks** — Added to components using border tokens (#2244)
- **ProgressBar** — Add xdsClassName to track for theme targeting (#2079)
- **z-index isolation** — Add isolation to components with leaky z-index (#2004)
- **`use client` directives** — Added to CommandPalette barrel, CodeBlock, ClickableCard, and others (#2069, #2048, #1833)
- **Thumbnail** — Focus ring clipped by overflow hidden (#2264)
- **DropdownMenu** — Light-dismiss + click-toggle race on touch browsers (#2186)
- **Theme** — Baseline media theme color-scheme flip, standalone theme text styling fixes (#1921, #1831)

#### Contributors

Thanks to everyone who contributed to this release:

- @cixzhang
- @czarandy
- @ernestt
- @josephfarina
- @kentonquatman
- @lexs
- @marie-lucas
- @nynexman4464
- @rubyycheung
- @rumble
- @saivazian
- @tedmcdo
- @thedjpetersen
- @zurfyx
- @imdreamrunner

---

# 0.0.13

#### Breaking Changes

- **Toolbar `density` → `size`** — `XDSToolbar` replaces the `density` prop with `size`, adds `XDSSizeContext` cascade for child components. (#1448)
- **Icon renames: `checkCircle`/`xCircle` → `success`/`error`** — Default icon registry renames for semantic clarity. (#1503)
- **`XDSChatComposerAttachments` → `XDSChatComposerDrawer`** — Renamed for clarity. (#1714)
- **Remove deprecated `XDSSelectorItem`** — Internalized `XDSSelectorOption`; use `XDSSelector` directly. (#1582)
- **Tighten `XDSBaseProps`** — Omits `title` and obscure HTML attributes; adds `data-*` index signature. (#1505, #1502)

#### New Features

- **XDSClickableCard & XDSSelectableCard** with `useClickableContainer` hook (#1707)
- **useResizable hook + XDSResizeHandle** — Drag-to-resize for panels and sidebars (#1754)
- **AlertDialog** — Dedicated confirmation dialog component (#1370)
- **`isInline` prop** on Dialog, AlertDialog, and CommandPalette for embedded usage (#1676)
- **Card `transparent` variant** (#1655)
- **`defaultOpen` prop** on XDSTooltip and XDSHoverCard (#1672)
- **Stack `width`, `height`, `align`, `justify` props** — Convenience aliases on HStack, VStack, Stack (#1778, #1703)
- **Text `type` defaults to `'body'`** — No longer required (#1702)
- **Carousel** — Always show nav buttons when content is scrollable (#1772)
- **AppShell `defaultIsMobile`** for SSR-safe mobile nav detection (#1755)
- **SideNav/TopNav hover-to-open menus** via `useXDSMenuHover` (#1419)
- **DropdownMenu compound-component mode** (#1372)
- **MobileNav auto-detect drawer side** from trigger position (#1395)
- **Dialog `padding` prop** (#1169)
- **Grid unified responsive columns** API (#1422)
- **Selector/Typeahead/Tokenizer** size cascade to dropdown list items (#1442)
- **Icon slots standardized to `ReactNode`** across all components (#1746)
- **Tailwind v4 theme bridge** (#1649)
- **Theme `expandColorScale`** — Derive full color token ramp from a single accent hex (#1452)
- **Theme derived var expansion** — CSS properties to internal vars (#1467)
- **Table column alignment and row vertical alignment** (#1362)
- **TabList visual polish** — ghost hover, primary colors, divider overlap; remove density prop (#1357, #1418)
- **TreeList visual polish** (#1367)
- **SideNav/TopNav heading icon toggle** (#1371)
- **CodeBlock highlight ranges** — range-based highlighting support (#1470)
- **Page and block template system** with 100+ component showcase blocks (#1393)

#### Fixes

- Truncation: use Range API for multi-line detection (#1816)
- PowerSearch: add `xdsClassName` for theme targeting (#1813)
- ToggleButton: fix theming + Chat barrel export (#1812)
- Component audit: AppShell BaseProps, AspectRatio RTL, Badge header (#1748)
- Component audit: data-autofocus on BaseTypeahead, displayName on TreeListBranches (#1692)
- Component audit: SegmentedControl, Slider extend XDSBaseProps (#1519)
- Component audit: PowerSearch token, RadioList exports (#1359)
- Hardening audit: AlertDialog BaseProps, CheckboxList className, Table xdsClassName, use-client directives (#1518)
- Remove internal-only exports from public API (#1603)
- Add XDS prefix to StackAlignment type, fix StatusDot header (#1561)
- SSR: replace `useLayoutEffect` with SSR-safe alternatives (#1721)
- Focus: use `:focus-visible` instead of `:focus-within` for outlines (#1511)
- Focus: remove `outline` from transition to prevent black flash (#1731)
- iOS Safari: prevent auto-zoom on input focus (#1468)
- Dialog/MobileNav: replace `:where([open])` with prop-driven open styles (#1652)
- className/style clobber by `stylex.props` spread + lint rule (#1462)
- Collapsible: remove trigger padding, add capsize to label (#1770)
- Breadcrumbs: onClick-only items match link color (#1773)
- Grid: cap column count via track-max (#1761)
- Tokens: update palette border colors from DSP color ramp (#1760)
- Slider: keep tooltip visible during thumb drag (#1751)
- AppShell: targeting class names on sticky wrappers (#1764), detect empty slots via presence registration (#1377)
- Icon: use secondary color for input startIcon slots (#1765), default to `inherit` (#1588)
- SideNav: section custom styles, item collapsible+action split (#1666), design tokens for drag handle transition (#1381)
- Table: container padding to directional vars (#1621)
- Toast viewport: reset UA popover background (#1644)
- Selector: forward extra HTML attributes from XDSBaseProps (#1444)
- TextArea/TimeInput: a11y and input consistency fixes (#1443)
- Token: add `'use client'` directive, TopNav context naming conventions (#1465)
- Chat: anchor trigger menu to cursor position (#1354)
- Banner, Breadcrumbs, Spinner, StatusDot, TabList, Text, TextArea, TimeInput: extend XDSBaseProps (#1780, #1640, #1405)
- CodeBlock: Safari span fallback, per-line token perf (#1487, #1369)
- TextInput/TextArea: default value to empty string (#1439)
- MobileNav: close drawer on nav item activation (#1438)
- Divider: remove opaque background from label (#1426)
- Field: move description into XDSFieldLabel (#1458)
- Theme: sync `data-xds-theme` to `<html>` for root provider (#1587)
- Edge compensation model redesigned for toolbars (#1539)

#### Performance

- CodeBlock: content-visibility chunking for range mode, eliminate stylesheet mutations (#1457)

#### Upgrade

Codemods are available for all breaking changes in this release:

```sh
npx astryx upgrade --apply --to 0.0.13
```

Preview changes first (dry run): `npx astryx upgrade --to 0.0.13`
Run a specific codemod: `npx astryx upgrade --apply --codemod toolbar-density-to-size`
List all available codemods: `npx astryx upgrade --list`

---

# 0.0.12

#### Breaking Changes

- **Button `isIconOnly` required for icon-only mode** — `XDSButton` and `XDSToggleButton` now require explicit `isIconOnly` for icon-only rendering. (#1257)

#### New Features

- **XDSThumbnail** component (#1255)
- **XDSChatLayout** with fixed composer dock and container queries (#1249)
- **XDSToast** notification system (#1194)
- **Chat reasoning components** — Reasoning, ToolCall, ToolCallGroup (#1192)
- **useXDSImperativeDialog** — show/hide without state management (#1239)
- **Theme syntax system** with 11 community presets + `defineTheme({ syntax })` (#1217, #1219)
- **XDSMediaTheme** for inverted surface theming (#1211)
- **Card background color variants** (#1213)
- **Daily theme** with Figtree font, Lucide icons (#1201)
- **SideNav/TopNav menu popover and heading variants** (#1272)
- **TextInput `onEnter` prop** for consistency with NumberInput (#1223)
- **Button `isPressed` prop** for toggle state (#1202)
- **CLI programmatic API** — `@xds/cli/api` (#1208)
- **ChatComposer `headerActions` + `headerContext`** replacing `contextToolbar` (#1242)
- **Chat trigger menu system** for ComposerInput (#1193)

#### Fixes

- Dialog: reset inherited edge signals, prevent ghost button margin shift (#1237)
- CodeBlock: syntax highlighting missing on scroll + perf improvements (#1221)
- Chat: harden bubbles, scroll button, drawer animation, status (#1245)
- Chat: use `color-neutral` for message bubble background (#1271)
- SegmentedControl: consistent border-radius for sm size (#1206)
- Omit `children` from XDSBaseProps — require explicit opt-in (#1246)
- Theme: ship built theme modules to prevent double CSS injection (#1247)
- Theme: support bare state keys in `parseStyleKey` (#1233)
- ProgressBar/Section: migrate to XDSBaseProps, fix RadioList double-apply (#1253)
- CodeBlock: use semantic `--text-code-size` token for md size (#1273)
- Input: forward native event handlers via `...rest` spread (#1259, #1291)

#### Upgrade

Codemods are available for all breaking changes in this release:

```sh
npx astryx upgrade --apply --to 0.0.12
```

Preview changes first (dry run): `npx astryx upgrade --to 0.0.12`
Run a specific codemod: `npx astryx upgrade --apply --codemod add-is-icon-only`
List all available codemods: `npx astryx upgrade --list`

---

# 0.0.11

#### Patch Changes

- Version bump and publish infrastructure fixes
- No breaking changes

---

# 0.0.10

#### Breaking Changes

- **StatusDot and ProgressBar single size** — Both components now have a single fixed size (8px). The `size` prop has been removed. (#966)

#### New Features

- **Layout `defaultHasDividers`** — Container-controlled dividers via context (#969)
- **Button `href` support** — Link-styled buttons (#935)

#### Fixes

- Dialog: propagate `maxHeight` to layout via `--container-max-height` (#965)
- Popover: embed surface styles in `useXDSPopover` hook (#964)
- Dialog: lock body scroll on iOS Safari (#948)
- Dialog: scrollable content, mobile visibility, container styles (#942)
- Menu components: icon sizing, item density, section headings (#946)
- Avatar status dot sizes + icon non-semantic colors (#944)
- Table: truncate overflowing cell text with ellipsis (#933)
- AppShell: default variant to "elevated" (#934)
- DialogHeader: re-add capsize with visual adjustment (#956)
- Hardening sweep (#968)

#### Upgrade

Codemods are available for all breaking changes in this release:

```sh
npx astryx upgrade --apply --to 0.0.10
```

Preview changes first (dry run): `npx astryx upgrade --to 0.0.10`
Run a specific codemod: `npx astryx upgrade --apply --codemod remove-size-props`
List all available codemods: `npx astryx upgrade --list`

---

# 0.0.8

#### Breaking Changes

- **Button `endSlot` → `endContent`** — Renamed on XDSButton and forwarded object literals (e.g. XDSDropdownMenu button prop). (#895)
- **Token renames** — Intermediate token names from v0.0.6 renamed to final v0.0.8 convention per the token spec.

#### Fixes

- Align cyan, pink, and yellow token colors with WWW (#907)
- Dialog hardening (#775)
- ListItem: support ReactNode for description, fix whiteSpace nowrap breaking line-clamp (#896)
- Table: default minWidth for proportional columns (#891)
- Button: prevent text wrap, add ellipsis truncation (#892)
- ListItem: fixed inline padding (#887)
- Slider hardening — style clobber, a11y, pointer handling (#882)
- TextArea hardening — counter a11y, soft maxLength, disabled states (#849)
- Field hardening — a11y, auto-IDs, disabled styles (#848)
- Calendar hardening — a11y, keyboard nav, date constraints (#837)
- CheckboxInput, Button, Switch hardening (#765, #768, #769)
- DateInput, FormLayout hardening (#771, #772)
- CSS layer ordering for dist path theming (#806)
- Rename `@layer xds-reset` to `@layer reset` (#833)
- Tokenizer truncation behavior (#880)
- Correct neutral gray token semantics across components (#852)
- Formalize container padding tokens, prevent internal var access (#847)

#### Upgrade

Codemods are available for all breaking changes in this release:

```sh
npx astryx upgrade --apply --to 0.0.8
```

Preview changes first (dry run): `npx astryx upgrade --to 0.0.8`
Run a specific codemod: `npx astryx upgrade --apply --codemod rename-endslot-to-endcontent`
List all available codemods: `npx astryx upgrade --list`

---

# 0.0.7

#### Breaking Changes

- **Banner `variant` → `container`** — Renamed the `variant` prop on XDSBanner to `container`. Type references `XDSBannerVariant` → `XDSBannerContainer` and `XDSBannerVariantMap` → `XDSBannerContainerMap`. (#814)

#### Upgrade

Codemods are available for all breaking changes in this release:

```sh
npx astryx upgrade --apply --to 0.0.7
```

Preview changes first (dry run): `npx astryx upgrade --to 0.0.7`
Run a specific codemod: `npx astryx upgrade --apply --codemod rename-banner-variant-to-container`
List all available codemods: `npx astryx upgrade --list`

---

# 0.0.6

#### Breaking Changes

- **Token renames** — Design tokens renamed per naming audit: `positive` → `success`, `negative` → `error`, `divider` → `border`, etc. (`migrate-token-names`)
- **Shadow tokens** — Elevation tokens renamed to `shadow-base`/`shadow-menu`/`shadow-hover`/`shadow-dialog` + `insetshadow-border-*` (`migrate-shadow-tokens`)
- **`XDSCollapse` → `XDSCollapsible`** — Component and prop rename (`migrate-collapse-to-collapsible`)
- **Radius tokens** — Semantic radius tokens renamed to numeric scale (`migrate-radius-tokens`, `migrate-skeleton-radius`)
- **Badge `children` → `label`** — Content passed as children now uses the `label` prop (`migrate-badge-children-to-label`)

#### New Features

- **Dynamic theming primitives:** `radiusScale`, `motionScale`, `typeScale` in `defineTheme`
- **Motion tokens:** duration, easing, and component migration to token-based transitions
- **Ratio-based type scale** with `typeScale` in `defineTheme` and 4px grid snapping
- **Mobile-responsive AppShell:** responsive mobile nav API, `autoMobileTopBar`, entry animations
- **TopNav mobile rendering:** responsive menu, MegaMenu composed children API + mobile drawer
- **SideNav:** collapsible sidebar (`isCollapsible` prop), resizable sidebar with drag handle
- **PowerSearch:** filter implementation with nested filters
- **TreeList** component
- **NavItem** component
- Shared theme CSS generation, removed XDSFontWrapper

#### Fixes

- Badge: hardcoded height → spacing token; add `label` prop for API consistency (#709)
- CheckboxInput & Switch: focus rings + indeterminate aria (#723)
- Kbd: platform detection for mod key (#722)
- MegaMenu: uniform border radius, TopNav menu positioning/keyboard/focus trapping
- Popover: background transparency, DropdownMenu elevation tokens
- Collapsible: hardcoded fontSize/transition → tokens
- AppShell: hardcoded spacing → spacing tokens
- Dist CSS layer renamed from `@layer xds` to `@layer xds.core.base`
- `color-scheme` in reset.css for lightningcss light-dark() compatibility
- Sync package.json exports (NavItem, remove stale typography.css)
- Type-scale: use Math.round for 4px grid snapping in computeLeading

#### Upgrade

Codemods are available for all breaking changes in this release:

```sh
npx astryx upgrade --apply --to 0.0.6
```

Preview changes first (dry run): `npx astryx upgrade --to 0.0.6`
List all available codemods: `npx astryx upgrade --list`

---

# 0.0.5

> **Note:** v0.0.5 was the published version. Codemods for this release are registered under v0.0.6 in the CLI. Use `--to 0.0.6` to run them.

See 0.0.6 above for breaking changes and upgrade instructions.

---

# 0.0.4

#### New Components

- **XDSTreeList** — Hierarchical tree list component with expand/collapse (#609)
- **XDSPowerSearch** — Advanced search component with result count, filtering (#561, #593)

#### Features

- **AppShell variant system** — New `variant` prop (#597)
- **AppShell contentPadding** — New `contentPadding` prop (#612)
- **AppShell auto height mode** — Sidenav and sticky backgrounds (#615)
- **startIcon** support (#584)

#### Fixes

- Removed deprecated `isFullBleed` prop from Card and Section (#610, #598)
- Layout: `padding={0}` treated as equivalent to `isFullBleed` (#595)
- SideNav: consistent spacing (#601)
- Nav: consistent gap and heading text sizes (#616)

#### Refactors

- Popover, HoverCard, Tooltip moved to top-level directories (#557)

---

# 0.0.3

#### Patch Changes

- Bundle StyleX runtime — consumers no longer need @stylexjs/stylex as peer dependency (#545)
- Add stable token export path at @xds/core/tokens (#544)
- Replace null style overrides with explicit values, add lint rule (#547)
- Fix theme packages to produce proper JS/TS module output via tsup (#541)
- Sync package.json exports map
- Add verify-exports CI check (#537)

---

# 0.0.2

#### Breaking Changes

- CSS-based theming replaces StyleX theme system — `defineTheme()` API
- `className` and `style` props on all components
- Numeric spacing scale for `padding` and `gap`
- RSC-compatible icon registry (`registerIcons`/`getIcon`)
- React 19 ref prop migration
- Renames: TopNavTitle → TopNavHeading, SideNavHeader → SideNavHeading, useXDSIcon → getIcon
- `gap="space4"` → `gap={4}`, `isFullBleed` → `padding={0}`
- Badge dot → StatusDot

#### Upgrade

Codemods are available for all breaking changes in this release:

```sh
npx astryx upgrade --apply --to 0.0.2
```

Preview changes first (dry run): `npx astryx upgrade --to 0.0.2`
List all available codemods: `npx astryx upgrade --list`

12 codemods included:

- `rename-selector-items-to-options` — Selector `items` → `options`
- `unify-visibility-to-onOpenChange` — onHide/onClose/onShow/onToggle → `onOpenChange`
- `unify-uncontrolled-to-defaultX` — initialIsOpen/initialIsExpanded → defaultX
- `rename-banner-endButton-to-endContent` — Banner `endButton` → `endContent`
- `rename-form-tooltip-startIcon` — Form `tooltip` → `labelTooltip`, `startIcon` → `labelIcon`
- `rename-isShown-to-isOpen` — Dialog/Popover `isShown` → `isOpen`
- `rename-topnav-title-to-heading` — TopNav `title` → `heading`, TopNavTitle → TopNavHeading
- `rename-sidenav-header-to-heading` — SideNav header → heading, SideNavHeader → SideNavHeading
- `migrate-useXDSIcon-to-getIcon` — `useXDSIcon()` → `getIcon()`
- `migrate-gap-to-numeric` — `gap="space4"` → `gap={4}`
- `migrate-isFullBleed-to-padding` — `isFullBleed` → `padding={0}`
- `migrate-badge-dot-to-statusdot` — Badge `shape="dot"` → StatusDot

---

# 0.0.1

- Initial release
