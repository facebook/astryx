# @xds/core

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
