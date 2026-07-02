# @xds/core

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
