# @xds/core

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
