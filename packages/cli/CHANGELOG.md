# @xds/cli

# 0.5.0

#### Breaking Changes

- Banner: the collapse axis moves onto one `collapsible` prop, and content can opt out of collapsing (#5255)
  Banner inferred its disclosure from its content: any `children` got a chevron in the header and were hidden until it was pressed. There was no way to show content without a toggle — the case a banner most often wants, a list of the three fields that failed validation — and `defaultIsExpanded` was the only knob, with no controlled mode.

  The whole axis is now one `boolean | CollapsibleConfig` prop, following the boolean-or-config convention `SideNav.collapsible` set, and backed by the shared `useCollapsible` hook rather than Banner's own state:

  ```tsx
  <Banner status="error" title="3 fields need attention">…</Banner>  // unchanged: collapsible, starts closed
  <Banner collapsible={false}>…</Banner>                             // new: always visible, no toggle
  <Banner collapsible={{defaultIsOpen: true}}>…</Banner>             // replaces defaultIsExpanded
  <Banner collapsible={{isOpen, onOpenChange}}>…</Banner>            // new: controlled
  ```

  **The default is unchanged** — a banner that never mentioned `defaultIsExpanded` behaves exactly as it did. The breaking part is the prop itself: `defaultIsExpanded` is removed in favour of the config, which is a type error at every JSX call site that names it.

  **Codemod:** `npx astryx upgrade --codemod banner-collapsible-content`

  It rewrites `defaultIsExpanded` to `collapsible={{defaultIsOpen: true}}` and drops `defaultIsExpanded={false}`, which is now the default. Banners that never set the prop are left alone.

  **One case the codemod and the compiler both miss: a spread.** `defaultIsExpanded` inside a props object is out of the transform's scope. A props object in a typed position still fails to compile — but an inferred one that is spread, `<Banner {...args} />`, does not, because TypeScript does not excess-property-check a spread. The prop then falls through to the DOM and the banner quietly starts collapsed. **Grep for `defaultIsExpanded` after running the codemod** and migrate any spread sites by hand.

#### New Components

- Promote `Stepper` and `Step` from the canary-only Lab package to Core. The stable package now ships their existing horizontal/vertical layouts, separated and on-track indicators, semantic status, density, and non-linear navigation, plus Core documentation and rendered examples. The default `aria-label` is now localized.
  Advancing one step now animates the connector. Every connector the four layouts draw — the separated bars and the on-track segments alike — grows its accent fill out of the segment's leading edge instead of swapping a background color, so moving forward reads as progress travelling the track. That one gesture is the only thing that animates: going back, jumping forward by more than one step, and mounting mid-flow all apply at once, as does any change under `prefers-reduced-motion`. Retreats are deliberately instant — run in reverse the same transition ends on a shrinking stub of accent, and a remnant still on the track reads as unfinished where the identical curve growing forward reads as arrived — and multi-step jumps are instant because a jump is a navigation rather than a progression, so sweeping a front across the crossed segments only makes the user sit out a journey they asked to skip. Where one span is drawn by several segments (the on-track layouts split a span between two steps, three when a content slot sits between them) the segments take abutting slices of the span's time and run linearly, so the fill reads as one line growing at a constant speed rather than pieces lighting in turn.

  Five visual fixes land with the promotion. Horizontal steps now divide the track evenly instead of sizing to their own labels, so every progress segment is the same width regardless of how long a step is named. Number indicators shrink from 20px to 16px to match the check, ring, and custom-icon indicators, so a step swapping its number for a check as it completes no longer nudges the label beside it. A step description now occupies a 16px box rather than a 24px one — it previously inherited the page's line box instead of applying its own leading, which opened an 8px gap under the label. A step's content slot now starts flush with the label above it at every density: the slot renders outside the density-padded label area, so it was hanging one pad short of it. And a vertical on-track step carrying content keeps its connector unbroken — the content renders below the row that draws the line, so the track used to split open around any step with content (#5201).

#### New Features

- AspectRatio: emit `ratio` as a class-level declaration instead of a hard inline style, so the ratio can be overridden responsively: StyleX consumers pass an `aspect-ratio` rule via `xstyle` (including under `@media`/`@container` conditions), and plain-CSS/Tailwind consumers override `aspect-ratio` from their own unlayered rules, which beat the `astryx-base` cascade layer regardless of specificity. The mixed-gallery template's hero now switches 3:1 to 3:2 when the grid stacks with a one-line override on a single element, replacing the duplicated hero markup the fixed inline ratio previously forced (#3883, closes #2798)
- CLI: `astryx theme targets` lists every component theming target — the `defineTheme` key, the class it paints, and the props and states it accepts — for one component or the whole system, with `--json` for lint and audit scripts. `astryx theme --help` now points at component overrides instead of reading as a build-tool menu. The listing and `theme build`'s override validation share one enumeration of the component docs, so neither can drift from the components (#5115).

#### Fixes

- neutral theme: darken the light-mode error red from `#e33f4a` to `#c9303a` so the filled `Badge variant="error"` label clears WCAG 2.1 AA. White on `#e33f4a` is 4.14:1 and the badge label is 12px/weight 500, so the 4.5:1 normal-text threshold applies rather than the 3:1 large-text allowance; `#c9303a` gives 5.29:1 while holding the hue (OKLCH H 21.9 -> 22.8, C 0.200 -> 0.189). StatusDot and the ProgressBar `--color-error` rebinding move with it — both are documented as tracking the badge fill so the dot and its badge read as one status language. Dark mode is untouched (dark text on `#ff705d`, 6.60:1). Adds `scripts/check-badge-contrast.test.mjs`, which resolves every theme's badge label/fill pair through `light-dark()`, `var()` indirection and alpha compositing, and holds all of them to 4.5:1 (#4446).
- Unified search and build now include components contributed by integrations, so a component registered through an integration is findable and buildable alongside the built-in set instead of silently missing from both (#5259).
- Table - Grouped page template: wrap the rows in `TableBody`
  The template rendered `<TableRow>` straight into `<Table>`, so the emitted DOM was `<table><tr>`. `<table>` cannot contain a row directly: the HTML parser inserts an implied `<tbody>` when it parses server-rendered markup and React does not when it renders on the client, so anyone who copied the template into an app as a server-rendered page inherited a hydration mismatch in their own app. Client-only the DOM is still invalid — nothing reparents the rows, so the table ends up with `<tr>` children and no `<tbody>` at all, and any CSS or query aimed at `tbody` silently misses.

  The rows now sit in `<TableBody>`, the same element the data-driven `data={...}` path renders, so styling, dividers, and column widths are unchanged (#5278).

#### Other Changes

- Public component theming vars are enumerable, and guarded against being documented but unsettable
  `collectThemingVars` joins `collectThemingTargets` as part of the one enumeration the theming surface is read from. Two guards ride on it: a documented public var no component reads compiles to a declaration that never applies, and a var the component writes inline outranks every cascade layer, so no theme can reach it. Both had shipped; neither is visible in the generated theme CSS the jsdom suites assert on (#5409).

#### Contributors

Thanks to everyone who contributed to this release:

- @AKnassa
- @andrskr
- @cixzhang
- @ernestt
- @freddymeta
- @jiunshinn
- @rubyycheung

---

# 0.4.7

---

# 0.4.6

#### New Features

- An integration can contribute reference-doc topics: point `docs` at a root in `astryx.integration.*` and every `{topic}.doc.{ts,mjs,js}` under it is served by `astryx docs`, indexed by `astryx search`, and named in the agent-docs block, beside the built-in topics. A topic may also declare `replaces: '<topic>'` to take over an existing one (renaming it leaves the old name resolving as an alias) or `extends: '<topic>'` to merge onto one section by section. A name that collides without declaring either is an `invalid_doc` issue rather than a silent override, and `validate-integration` reports it. (#5311)
  Also fixes the agent-docs block's topic list, which scanned for `\w+` and so silently dropped every hyphenated topic — `getting-started`, `cli-integrations`, `browser-support`, `styling-libraries` and `working-with-ai` were missing from every block ever written, and an agent cannot ask for a topic it was never told about.
- Five dashboard page templates: `dashboard-cohort-funnel`, `dashboard-data`, `dashboard-executive-summary`, `dashboard-project-status` and `dashboard-service-monitoring`. Each is a complete page — layout, realistic sample data, and the component choices that go with the shape of the data — so `astryx template <name>` gives you something to edit rather than a blank frame (#5245).

#### Fixes

- `component` built the import specifier for an integration component by joining the package name and the component name, which assumes every component is exported from a subpath named after itself. Components are commonly grouped behind a single entry point named after the concept, so the suggested import pointed at a subpath the package does not export and did not resolve (#4810).
  The specifier is now resolved against the owning package's `exports` map, keyed on the directory the component's doc file sits in, and falls back to the package root when that directory is not an exported subpath. A specifier a doc file states for itself is also no longer overwritten.
- The upgrade codemod no longer collapses significant JSX whitespace when it renames an element tag. Renaming `<OldName>` next to text and a `{expression}` (e.g. `hello {name} world`) previously dropped the adjacent space (`hello {name}world`); element-tag renames are now spliced into the output so the surrounding JSX is left untouched (#5149).
- The XDS-prefix codemod no longer produces a file that will not compile. Dropping the prefix renames `XDSButton` to `Button`, but if the file already had a local binding called `Button` the rewrite collided with it and shadowed one of the two. The import is now aliased instead, so both survive and the file still typechecks (#5225).

#### Contributors

Thanks to everyone who contributed to this release:

- @ejhammond
- @josephfarina
- @kentonquatman
- @rubyycheung

---

# 0.4.5

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

- `astryx theme build` takes any number of theme files — `astryx theme build themes/*.ts` compiles them all in one process, so an app with several themes no longer hand-rolls a loop that re-enters the CLI once per theme. Outputs are byte-identical to the serial invocations; the run stops at the first failure and names the theme that failed. The CLI's Node floor (>=22.13) is now declared in `engines`, so a package manager can enforce it at install instead of the build failing later (#5121).
- `defineTheme`: `color.accent` accepts a `[light, dark]` tuple (#2279)
  `ColorScaleConfig.accent` now takes either a single hex or a `[light, dark]` tuple, matching `TokenValue`. With a tuple, `expandColorScale` derives the light half of every generated `light-dark()` pair from the light seed's palettes and the dark half from the dark seed's, so each scheme gets a consistent derived palette (muted, on-accent, neutrals) instead of the `tokens['--color-accent']` workaround that skips scale generation. Single-string configs are unchanged, token for token. Also documents the precedence between `color` and `tokens` for accent-derived values: `tokens` entries win token by token, the `var(--color-accent)` reference tokens follow a `--color-accent` override at runtime, and the baked `--color-on-accent` stays derived from the `color.accent` seed.

#### Fixes

- Bottom Sheet showcase block: the filter checkboxes are interactive again (#5157).
  `CheckboxInput` is fully controlled — `value` is required and the input only moves when the owner updates it. The showcase passed a literal `value={false}` with no `onChange`, so the three filters ("In stock", "On sale", "Free shipping") rendered but could never be toggled: on the docs site the first thing a reader tries in a Bottom Sheet does nothing, and anyone copying the block inherits three dead controls. Each filter now has its own `useState` and `onChange`, matching the checkbox wiring already used in the Bottom Sheet Switcher showcase.
- An integration whose manifest fails to load is no longer silent. A manifest that throws on import — the common case being one still calling a `create*` authoring factory, removed in 0.3.0 — contributes nothing, and the CLI treated that as if the package had never been configured: `astryx discover` answered `No integrations configured.` while `astryx.config.mjs` plainly configured one, and no command said a word. The only way to find out was to already suspect it and run `validate-integration` by name. Meta's internal `@nest/xds-meta` sat invisible to CLI discovery for a week that way, and the app team's conclusion was that the components did not exist (#5119).
  The load error now counts as an integration issue, so the existing one-line stderr nudge fires on `component`, `template` and `upgrade`, and `discover` — the command whose whole job is listing integrations — nudges too, as does `search`. `discover` also stops reporting `configured: false` for a project that configured an integration that failed to load; the empty state now distinguishes "you configured nothing" from "what you configured contributed nothing", which is the distinction `meta.configured` was introduced to carry.

  Nothing becomes fatal: the warning is best-effort, stderr-only, suppressed under `--json`, and never changes an exit code. Broken contributions are still skipped exactly as before.

#### Contributors

Thanks to everyone who contributed to this release:

- @cixzhang
- @imdreamrunner
- @jiunshinn

---

# 0.4.3

#### Fixes

- The unloaded-font advisory is a notice, not a warning. A theme file cannot load a font — Astryx sets `--font-family-*` and loading is the app's job — so #5045's advisory fires on any theme naming a webfont, including a perfectly correct one. As a warning that made a clean build read as defective, and it put the shipped template permanently in violation of its own "compiles with no warnings" guard (#5079 had to allowlist the template's two font names in that assertion).
  The `theme.build` receipt now separates the two: `warnings` are defects the author should fix, `notices` are advisories about a correct theme. The font advisory moves to `notices` and to stdout with the rest of the build's progress; stderr stays for defects. The template guard is back to `warnings` being empty, and no longer needs to know which fonts the template names.

  Programmatic callers reading `data.warnings` for font advisories should read `data.notices`; the message text is unchanged.

- `extends` now reaches the CSS. A theme that extended another built a stylesheet holding only the declarations it stated itself: the base's tokens, component overrides and surface rules were all absent, and because each theme is `@scope`d to its own `data-astryx-theme` value, loading the base's stylesheet alongside could not fill the gap either. Every consumer of an inheritance chain silently got stock geometry, elevation and type with a new palette painted over it (#5067). Nothing warned; the loss only showed up by diffing two generated stylesheets token by token.
  The cause was `theme build` shadowing its own inputs. It writes `<name>.js` next to `<name>.ts`, and the loader resolved a plain `./<name>` specifier to that generated artifact before the source — so the second build of a family read the artifact, which carries no `components` and exports `<name>Theme` rather than whatever the source exports. A named import that missed became `extends: undefined`, and `defineTheme` treated an absent base as no base at all. The loader now resolves source extensions first, which is also the resolution the author's TypeScript sees, so the CSS a build emits matches the theme that type-checked.

  Three things behind it are fixed too, so the failure cannot come back by another route. `defineTheme` **throws** when `extends` is present but is not a theme, naming the likely cause, instead of inheriting nothing — the one behavior change here, and it turns a silent stylesheet into a build error. A theme's `onDark`/`onLight` surfaces and its `__inputTokens` are now inherited like its tokens and components were, so a child no longer reverts its base's inverted-surface customizations to the defaults or loses its `[light, dark]` tuples. And a built theme module now carries the resolved `components` and surfaces alongside its tokens, so extending one — the `./built` subpath every shipped theme exposes — is no longer lossy. `theme build` also stopped hand-picking fields when it re-resolves a plain object theme file, which dropped `extends`, `color` and `syntax` on the way in.

  An extended theme is flat: everything it inherits is resolved into its own output, and its stylesheet stands alone. Measured on a 14-theme family (one base, 13 palettes extending it): each palette went from 25 custom properties and no component rules to the base's full 175 and 70, with its own colours still winning.

#### Contributors

Thanks to everyone who contributed to this release:

- @cixzhang

---

# 0.4.2

#### New Features

- `astryx theme build` warns when a theme names fonts it does not load. The resolved `--font-family-*` tokens and component-override `fontFamily` values are checked against CSS generics and known system families; anything else gets one warning per family in the receipt and, after the install instructions, the `<link>`/`@font-face` snippet to add. `astryx docs typography` gains a Loading Custom Fonts section (Google Fonts and self-hosted recipes, `font-display: swap`, real fallback stacks), and the theme docs' production-build section points at it (#5015).
- `astryx theme template` writes an annotated theme template into your project (#5048).
  New sibling of `theme add`: where `add` starts you from a theme we ship, `template` starts you from a blank annotated one. `astryx init --features theme` calls the same leaf, so project setup writes it too — it previously printed a one-line hint and wrote nothing, which is the weakest form of the help a theme author needs, since the first problem is not knowing the command but not knowing what the theme surface contains. The file is `theme.template.ts`: every `defineTheme` field with a note on when to reach for it, the token families, the component override syntax, and the consumption steps (providing the theme, loading the fonts you name, building for SSR), each section naming the CLI command that prints its authoritative reference. An existing file is never clobbered.

  This came out of a vibe test (#5047): agents given an annotated template reached twice as far into the theme surface as agents given only the docs (17 component targets vs 8, and the only arm to use interaction states, custom variants and `onDark`), and shipped a third of the contrast defects.

  A template that lies is worse than no template, so its claims are machine-checked against live sources rather than trusted: `scripts/check-theme-template.test.mjs` fails when a `defineTheme` field is added and left undocumented, when a token family is missing from the inventory, when a CSS variable or component key it names does not exist, when it cites a docs topic that does not, or when a theme source drops its SYNC reference. `theme build` compiles it warning-free in CI, and the CLI typecheck now covers it.

#### Fixes

- Heading's `type` is a documented theming target, and the docs stop teaching a CSS variable that does not exist (#5016).
  `Heading` reflects `type` as a theme selector — `typography.scale` generates `heading: {'type:display-1' …}` rules for it — but `theming.targets` listed only `level` and `color`, so `astryx theme build` warned `Unknown prop "type" on component "heading"` on every theme that sets a type scale, including the shipped `neutralTheme`. The drift guard missed it twice over: it read a conditional spread (`{level, color, ...(type && {type})}`) as an unknown bag, and it only checked a component against a doc file in its own directory, so `Heading/` — documented from `Text/Text.doc.mjs` — was never checked at all. Both are fixed, which brings three more previously unchecked directories under the guard.

  Separately, the theme docs' component-override example set `--button-press-scale`, which no component defines: copying it produces CSS that silently never applies. It now sets a real public var, and the example no longer declares the same `button` key twice.

- Two guards left failing on `main` by their own landings, so every PR since has been red through no fault of its own. #4963 gave Thumbnail's remove button a coarse-pointer hit-area var and did not document it, which the derived-var guard reads as an undocumented private var; the var is an `inset` on a `::after` overlay, so it is documented as private and listed alongside the other vars no standard CSS property maps onto. #5026 moved `borderDefaults` into `CoreTokenName` — the landing the theme-template guard was explicitly waiting for (its comment says "when #5017 lands, this guard starts requiring the template to cover it") — so the template's token inventory now names `--border-width`.

#### Documentation

- MobileNavToggle preview simulates a mobile AppShell instead of an empty stage: new playground.appShellMobile for components that render nothing without AppShell mobile context (#4983)

#### Contributors

Thanks to everyone who contributed to this release:

- @AKnassa
- @cixzhang

---

# 0.4.1

#### Fixes

- `astryx theme build` no longer warns `Unknown prop` for documented state override keys. Component docs declare state-driven selectors under `theming.targets[].states` (`radio` → `checked`/`disabled`, `calendar-day` → `today`/`selected`, …), but override validation only loaded `visualProps`, so the state syntax the Theming Infrastructure wiki documents — `components: {radio: {checked: {...}}}` — warned on every build. The CSS was always generated correctly; only the warning was wrong. 30 targets across core were affected (#4778).

#### Contributors

Thanks to everyone who contributed to this release:

- @cixzhang

---

# 0.4.0

#### Breaking Changes

- DropdownMenu's two item modes are peers again. Compound mode gains a `DropdownMenuDivider` component (aliased as `ContextMenuDivider` and `BreadcrumbMenuDivider`), which the data path also renders, so `{type: 'divider'}` and `<DropdownMenuDivider />` produce identical DOM, spacing, and theme target. Data mode gains `endContent` and `description`, so an `items` row can carry a shortcut hint or secondary text without dropping to compound mode. Its `label` widens from `string` to `ReactNode`, matching compound mode: the narrowing existed only because rows were keyed by label, and they no longer are (#4953).
  The bare names now belong to those components, so the data-mode option types take the `Data` suffix their sibling `DropdownMenuItemData` already carries: `DropdownMenuDivider` → `DropdownMenuDividerData`, `ContextMenuDivider` → `ContextMenuDividerData`, `BreadcrumbMenuDivider` → `BreadcrumbMenuDividerData`. TypeScript cannot re-export a value and a type under one name from a single barrel, so the rename is what makes the components exportable at all. Run `astryx upgrade --apply` to rewrite the type imports; a missed one fails at compile time rather than silently.

#### New Features

- Add the `migrate-table-rowexpansion-to-tree` codemod (runs on `astryx upgrade`): rewrites the removed `useTableRowExpansionState` tree pattern to `useTableTreeState` + `useTableTreeData`. Detail-panel usage (`renderExpanded`) is left untouched. (#4884)
- Add a self-documenting layer to the CLI: typed, colocated `.doc.mjs` for every command, every `@astryxdesign/cli/api` function, and every authored schema (config, integration, codemod, the response envelope, and the doc-types themselves). Adds the `FunctionDoc`, `SchemaDoc`, `CommandDoc`, and `EnumDoc` authoring types with sealed parsers. (#4714)
  Every command's `--help` and its `astryx manifest` entry are now built from that command's colocated `CommandDoc` via a `defineCommand` converter, so the docs and the CLI can no longer describe different things. The migration is behavior-preserving: help text, command output, error paths, and exit codes are byte-identical.

  The CLI README's command, error-code, and response-type tables are now generated from the manifest and the `EnumDoc`s, correcting real drift — the error-code table listed two codes that do not exist and omitted several that do, and the command table was missing `blog`, `build`, `layout`, and `validate-integration`.

  Kept honest by a drift harness (docs vs the live CLI), `check:cli-structure` (each doc-type and `api/` leaf ships its full file set), and lint rules for the CLI's layering.

- Add themeable indicators — the componentized check, checkbox, and radio visuals. `defineTheme({indicators: {check: RadioIndicator}})` replaces one by name, and every component drawing it follows. (#4712)
  Theme targets now follow the component-name convention: `checkbox-indicator`, `radio-indicator`, `radio-indicator-dot`. The old names (`checkbox`, `radio`, `radio-dot`) are still emitted on the same element, so existing themes keep working — migrate at your convenience; they go away in the next major.

  Migration: menu radios use those shared targets now. `dropdown-menu-radio-dot` is removed — target `radio-indicator-dot`; `astryx upgrade` rewrites it for you.

#### Fixes

- The generated agent cheat sheet hardcoded a shell recommendation ("Full page → AppShell; sidebar nav → SideNav", "pick the shell (AppShell / Layout+LayoutPanel)"), which answers a question that depends on the app archetype and duplicates guidance `astryx docs layout` already maintains. The two layout rules now send agents to that doc instead, so shell choice, region budgets, and the responsive contract have one source of truth. (#4772)
  The rule cites the command rather than the docsite URL, in the block's established `astryx <cmd>` form that the header maps to the project's real invocation (`pnpm exec astryx`, `npx @astryxdesign/cli`, …). `astryx docs` reads the docs shipped inside the installed version, so an agent can't be shown an API that release doesn't have.
- The `migrate-grid-minchildwidth-to-columns` codemod bailed without changes when a `<Grid>` had both `columns` and `minChildWidth`, leaving the now-invalid `minChildWidth` prop in place and failing type-checking on 0.3.0. (#4792)
  When `columns` is a numeric literal, it now migrates losslessly to the 0.3.0 object form. This mirrors the old (0.2.0) Grid runtime, where `minChildWidth` dominated and the numeric `columns` capped the column count under `auto-fit`: `<Grid columns={3} minChildWidth={280}>` becomes `<Grid columns={{minWidth: 280, max: 3, repeat: 'fit'}}>`. Object or dynamic `columns` values remain a deliberate bail.
- The documented `hook` example referenced `useToggle`, which is not a hook in the design system — running it failed with `ERR_UNKNOWN_HOOK`. It now uses `useFocusTrap`. (#4742)
  This shipped in two places a consumer sees: `astryx manifest --json`, which agents read to learn the CLI, and the `hook` CommandDoc that feeds `--help`. Replaced in both.
- CLI internals: a true `foundation/` bottom layer, and generated `./authoring` types (#4736).
  `foundation/` no longer imports `api/`, and ESLint now enforces that direction alongside the existing `authoring/` and `api/` rules. Two things were reaching upward: `Project` pulled template discovery out of `api/template`, whose adapter imported `Project` straight back, and both `Project` and `integration-warnings` imported `validateLoadedIntegration` from the `validate-integration` command. Neither was misplaced logic, just misplaced files — the adapter now lives at `foundation/discovery/template-adapter.mjs` and the validators at `foundation/integrations/validate-contributions.mjs`. To be precise: `Project` and the template adapter still import each other, so that module cycle remains, contained within foundation instead of spanning two layers. Behavior-preserving — the CLI's observable surface is byte-identical across 84 invocations.

  The published `./authoring` type declarations are now generated from their JSDoc instead of hand-written, the same way `./api` already works. The 13 hand-maintained `.d.mts` files are gone; `scripts/sync-api-types.mjs` emits both trees at `prepack`, stamped `@generated`. A hand-written declaration shadows the JSDoc in its `.mjs`, so it could disagree with the implementation and still compile — and both failure modes had shipped: a missing declaration made a strict consumer resolve that parser as `any`, and a stale `parseDoc` return union silently dropped `SchemaDoc`, `CommandDoc` and `EnumDoc`. Also fixes `parseFunction`, a bare re-export of `parseHook` that published `HookDoc` instead of the general `FunctionDoc`.

- Scaffolding a template that references demo video (e.g. `LightboxVideo`) no longer replaces the video source with the image placeholder data URI, which the generated `<video>` element couldn't play. `stripTemplateAssetRefs()` treated every demo-media reference as an image regardless of extension; video extensions (`.mp4`, `.webm`, `.mov`, `.ogv`) are now stripped to an empty `src` instead — there's no equivalent self-contained inline placeholder for video, so the scaffolded example is honest about needing the builder to supply their own file rather than pointing at something that can't play. (#4863)
- Stepper templates: the scaffolded Stepper blocks gain the a11y, theming and responsive-label hardening from the component audit, and their doc blocks match what they render (#4917).
- cli: add `theme build --icons-specifier` so the generated module's icon import can be fully specified (#4620)
  The generated theme module imports the icon registry rather than inlining it, because the registry holds React elements. `astryx theme build` scraped that specifier out of the TypeScript source and emitted it verbatim, so `./icons` — valid TypeScript, invalid ESM — reached the generated `.js`. Every published theme's `/built` entry therefore failed to load in Node, including under Vite SSR and Next.js Pages Router, while bundlers papered over it by guessing the extension.

  No single extension is correct: the same source compiled by tsup lands at `icons.mjs` in a package with no `"type"` field and at `icons.js` in one with `"type": "module"`, and the generator runs before the compile step that produces either. The caller knows; now it can say so. Without the flag the specifier is emitted unchanged, so the default no-`--out` flow — where the neighbour is an uncompiled `icons.tsx` that only a bundler can resolve — is unaffected.

  The seven theme packages now declare `--icons-specifier ./icons.mjs` in their build scripts.

#### Other Changes

- The scaffolded login pages use `Center`'s `padding` prop instead of a hand-written `var(--spacing-6)` style object (#4764).
- Self-host template demo imagery in the repo instead of streaming it (#3973)
  from the internal `lookaside.facebook.com` CDN.
- Template demo images are now committed under
  `apps/docsite/public/template-assets/` and referenced by root-relative `/template-assets/*` paths (previously Meta-internal CDN URLs invisible to external contributors).
- `stripTemplateAssetRefs` still swaps these paths for the inline `data:` URI
  placeholder on scaffold, so generated projects render with zero setup and no network dependency — no image is ever copied into a scaffolded project.

#### Contributors

Thanks to everyone who contributed to this release:

- @cixzhang
- @ejhammond
- @ernestt
- @HelloOjasMutreja
- @humbertovirtudes
- @imdreamrunner
- @jiunshinn
- @josephfarina

---

# 0.3.0

#### Breaking Changes

- CLI — authoring is consolidated into a single entrypoint, `@astryxdesign/cli/authoring`, that exposes only TYPES (the plain objects authors write) and PARSERS (the CLI's load-boundary validators). Zod is sealed inside each parser and never exported.
- Remove long-deprecated compatibility APIs from core and CLI. Run `astryx upgrade` first to migrate the supported replacements for authoring imports, Dialog logical positions, Switch label spacing, and Table root props.

#### New Features

- CLI human (non-`--json`) output now renders through a small, documented formatter kit: consistent, plain-ASCII `key: value` records/sections that mirror `--json` and are greppable by field. Every command was migrated onto it (a lint rule keeps output funneled through the single `emit` sink), and `astryx --help` documents the output contract. `--json` output is unchanged. (#4686)
- `defineTheme`: make `color.accent` optional (#2279)
  A theme can now restyle the neutral ramp (`neutralStyle`, `contrast`) without adopting an accent. An accent-less config seeds the neutral palettes from the default accent's hue but leaves `--color-accent`, `--color-accent-muted` and `--color-on-accent` ungenerated, so they fall through to the token defaults — the same fall-through `expandColorScale` already applies to status, categorical and on-dark tokens. Configs that pass an accent are unchanged, token for token.

#### Fixes

- theme build: generated custom Button variants now type-check through the public `@astryxdesign/core/Button` subpath.
- Remove the `@xds/theme-default` → `@astryxdesign/theme-neutral` collapse from the v0.1.0 upgrade codemods (module-specifiers, css-surfaces, and declare-module). `theme-default` was dropped at the v0.1.0 scope move, so no v0.1.x consumer imported it — the collapse was dead and could rewrite unrelated source (including `@xds/theme-default/theme.css` CSS imports) to a `@astryxdesign/theme-neutral` package the app never declared. The `@xds/theme-daily` → `theme-neutral` collapse (and its `defaultTheme` → `neutralTheme` export remap) is unchanged.
- cli — confine user-controlled file paths, close DoS vectors, and repair paths broken by the authoring reorg (#4637)
- cli hardening pass — validate inputs at the API layer, close path-safety gaps, and prevent agent-docs content loss. The API is a public surface (`@astryxdesign/cli/api`), so guards that lived only in the CLI wrapper are pushed into the API.
  Path safety (the guard the write commands all depend on):
- cli — rename the `search`/`build` verbose flag to `--verbose`, resync the bundled themes, and fix `unwrap-authoring-factories` edge cases (#4639)
- `astryx doctor`'s peer-dependency check is now version-aware and names scoped packages correctly. Two problems are fixed: (1) the install hint was built with `name.split('@')[0]`, which for a scoped peer like `@stylexjs/stylex` returned an empty string, printing a bare `npm install ` with no package; and (2) the check only verified a peer was _present_, not that its installed version satisfied the declared range — so an out-of-range version (e.g. `@stylexjs/stylex@0.10.1` against a `^0.19.0` peer) was reported as satisfied. The check now flags out-of-range peers and its fix pins the required range, e.g. `npm install @stylexjs/stylex@^0.19.0`.
- theme build: validate component override keys from documented theming targets so subtargets like Chat bubbles and SideNav items no longer warn as unknown.
- `astryx theme build`: hyphenated component-override keys now resolve their built-in visual-prop values, and the `KNOWN_COMPONENTS` prop lists match what each component renders (#4109)
  `loadKnownValues` mapped a theme key to its core component directory by stripping non-letters from only the directory name, so a hyphenated key (`text-input`, `dropdown-menu`, `app-shell`, ...) never matched its `TextInput`/`DropdownMenu`/`AppShell` dir and the built-in prop values were silently dropped. It now strips non-letters from both sides before comparing, so hyphenated keys resolve. The `KNOWN_COMPONENTS` visual-prop lists are also synced to each component's `theming.targets[].visualProps` (e.g. `text-input`/`date-input`/`number-input`/`time-input`: `size`, `status`; `side-nav`: `mode`; `aspect-ratio`: `shape`), correcting stale/empty entries.

#### Documentation

- Document the core codemod staging workflow and add release-time automation that promotes `transforms/next` codemods into the resolved release version folder.
- Document the `@astryxdesign/core` StyleX peer dependency — add `@stylexjs/stylex` to the Getting Started / Quick Start install commands in both READMEs, and add an `astryx init` next-steps reminder to ensure the `@stylexjs/stylex` peer dependency is met, with a pointer to `astryx doctor`. StyleX is the styling runtime every component calls, and not all package managers auto-install peers.
- Surface the React 19 peer-dependency requirement everywhere a user would look for it (root README, core README, docsite hero, and the CLI getting-started guide), and add a sync test that keeps those surfaces naming the same React major as the core peer range.

#### Other Changes

- **The `create*` factories are removed** (`createConfig`, `createIntegration`, `createComponentDoc`, `createFunctionDoc`, `createDoc`, `createPageTemplate`, `createBlockTemplate`, `createCodemod`, `createConfigCodemod`). Author a plain object and stamp its `type` directly (`{type: 'component', ...}`, `{type: 'page', ...}`, `{type: 'code', ...}`); config and integration manifests are plain objects with no discriminant.
- **Import authoring types from `@astryxdesign/cli/authoring`** — the doc types `ComponentDoc`, `HookDoc`, `ReferenceDoc`, `TemplateDoc`, and the project-file types `AstryxConfig`, `AstryxIntegration`, `AstryxCodemod`. The old split surfaces (`@astryxdesign/cli/{config,doc,integration,template,codemod}` and the authoring exports of `@astryxdesign/core`) are superseded.
- **Doc field types are renamed to explicit, domain-prefixed names** so the surface reads clearly: `PropDoc → ComponentPropDoc`, `ThemingTarget → ComponentThemingTarget`, `ComponentVar → ComponentThemingVar`, `DerivedVar → ComponentThemingDerivedVar`, `ElementDescriptor → ComponentSlotElement`, `GroupDoc → ComponentGroupDoc`, `TranslationDoc → ComponentTranslationDoc`, `ExampleDoc/AnatomyElement/BestPractice/PlaygroundConfig → Component*`, and `ContentBlock/TokenPreviewType → Reference*`. The authorable entry types (`ComponentDoc`/`HookDoc`/`ReferenceDoc`/`TemplateDoc`) are unchanged.
- **`astryx upgrade` migrates you automatically.** Three codemods ship in this release: `unwrap-authoring-factories` rewrites every `create*` call to the plain stamped object, `migrate-authoring-imports` repoints the import specifiers to `@astryxdesign/cli/authoring`, and `rename-authoring-doctypes` applies the doc field-type renames (imports, type references, and JSDoc `@type` refs).
- CLI — the public `@astryxdesign/cli/api` type surface is now generated from the runtime JSDoc, and the injectable logger is consolidated into one `Logger`.
  Consumer-visible changes to `@astryxdesign/cli/api` (types only — runtime imports are unchanged):
- **Precise return types.** `component`, `docs`, `blog`, `discover`, `build`, `swizzle`, `upgrade`, `init`, and `themeBuild` previously resolved to `Promise<any>`; they now return their precise `{ type, data }` response unions. Code that leaned on `any` may surface new (correct) type errors.
- **Response types are now exported by name** — e.g. `ComponentDetailResponse`, `SearchResponse`, `UpgradeRunResponse` — alongside `themeAdd`/`themeList`/`listThemes` and a new shared `logger` value + `Logger` type.
- **Breaking:** the per-command return-union aliases `ComponentResult`, `DiscoverResult`, `DocsResult`, `HookResult`, and `TemplateResult` are no longer exported. Use `Awaited<ReturnType<typeof component>>` (still works), or import the member response types directly.
- `theme build --out`/`<file>`, the `validate-integration` manifest roots (`components`/`templates`/`codemods`), and `layout --file` are now confined with `assertWithin`. An escaping integration root reports a validation issue instead of importing and executing files outside the package; `layout --file` is also size-capped (5 MB) and rejects non-files, so a stream like `/dev/zero` can't exhaust memory.
- Fuzzy-match (Levenshtein), the layout value parser, and the layout expander gained bounds — a very long search query, a deeply nested attribute value, and a huge repeat count (`Box*999999999`) can no longer spin the CPU, blow the stack, or exhaust the heap.
- Docs topic lookup uses a null-prototype map so `__proto__`/`constructor` as a topic name can't bypass the unknown-topic guard. The shipped getting-started docs and the sandbox registry generator point at the current CLI source path again (both broke in the authoring reorg).
- `assertWithin` now canonicalizes symlinks (realpath of the deepest existing ancestor) — a symlink inside the project root pointing outside no longer lets a write escape. Also rejects a NUL byte in the path. This closes the escape for every command that writes through the guard (swizzle/template/upgrade/theme/layout/agent-docs).
- `search()`: non-positive/non-integer `limit`, empty query, unknown `--type` → `ERR_INVALID_ARGUMENT` (previously `limit: 0` returned the full unclamped set).
- `swizzle()`: the component name is sanitized so `..`/separators can't escape the `--output` base.
- `swizzle()` import rewriting: dynamic `import('../Sibling/…')` is now rewritten (was left pointing at a non-existent sibling in the output dir); a two-levels-up asset import (`../../locales/x.json`) maps to the exported subpath instead of the invalid `<pkg>/..`; and `../theme/tokens.stylex` keeps its full subpath (the StyleX compiler needs the dedicated `./theme/tokens.stylex` export — collapsing it to `<pkg>/theme` broke StyleX resolution). Component-local `.stylex` files that aren't subpath exports keep the working barrel collapse.
- `template()` copy: refuses to clobber without `overwrite: true` (`ERR_FILE_EXISTS`); adds an `overwrite` option.
- `upgrade()`: the `--path` scan dir is confined to cwd (`--apply` rewrites files in place).
- `init()`: template scaffold refuses to clobber an existing `page.tsx` (`ERR_FILE_EXISTS`); an unknown `--agent` now throws `ERR_UNKNOWN_AGENT` (was silently ignored).
- `layout`: rejects an unknown `--form` (`ERR_INVALID_OPTION`) and empty expression (`ERR_INVALID_ARGUMENT`).
- `layout expand`: text payloads containing `<`, `>`, `{`, or `}` (e.g. `Text"5 < 3"`) are emitted as JSX string-expression children so the generated TSX is valid — previously they produced syntactically-broken output.
- `layout expand`: a top-level repeat or group that expands to multiple sibling elements (`B"x"*3`, `(B"a" + B"b")`, an outline `repeat` block) is now wrapped in a fragment — previously the generated TSX had adjacent root elements with no parent and failed to compile (the wrapper decision counted AST roots instead of expanded elements).
- `layout` (expand/check): an empty expression now surfaces `ERR_MISSING_ARGUMENT` and a missing `--file` surfaces `ERR_FILE_NOT_FOUND` (was a generic `ERR_UNKNOWN` / a raw `ENOENT` errno, with a stack leak in human mode).
- `layout` parser: a pathologically deep compact expression (`V > …` nested past 512 levels) is rejected with a located `ERR_LAYOUT_PARSE` instead of blowing the call stack and surfacing a raw `RangeError` (→ `ERR_UNKNOWN`).
- `layout check --form …` printers: a string containing a quote (e.g. a Button `label="Don't panic"`) now round-trips — the printer picks a delimiter the string doesn't contain instead of always single-quoting, so the emitted compact/outline surface re-parses (was producing an unparseable token).
- `resolveTheme`: a non-string `astryx.theme` in package.json (number/array/object/boolean) degrades to null instead of crashing `astryx component` with a raw `TypeError` (parity with the empty-string / unknown-slug paths).
- `jsonOut`: serializes the envelope BEFORE marking the emission handled, so if a command returns unserializable `data` (circular ref / BigInt — an author bug) the bin error boundary still emits a JSON error envelope instead of leaving a `--json` consumer with empty stdout.
- package scanner: a dependency's `astryx.docs` that is a non-string (number/array) is skipped instead of crashing the whole scan with a raw `TypeError`, and a `docs` path that escapes its own package dir is skipped rather than surfacing foreign docs; a non-string package `name` is coerced to a string.
- `component --package <pkg> --showcase`/`--blocks`: route to the right leaf instead of falling back to `component.detail`.
- `discover`/`docs` leaves: empty query/section errors instead of matching everything via `.includes('')`.
- `docs()`/`discover()`: a non-string `topic`/`section`/`query` now throws a stable coded error (`ERR_UNKNOWN_TOPIC` / `ERR_UNKNOWN_SECTION` / `ERR_INVALID_ARGUMENT`) instead of a raw `TypeError` the CLI downgraded to `ERR_UNKNOWN` (parity with the `component`/`hook` non-string guards).
- `blog()` detail: a non-string slug throws `ERR_INVALID_ARGUMENT` (was a raw `TypeError` the CLI downgraded to `ERR_UNKNOWN`), and fails fast before any network fetch.
- `hook()`/`component()` dispatchers: a non-string `name` or `category` throws a coded error (`ERR_UNKNOWN_HOOK` / `ERR_UNKNOWN_COMPONENT` / `ERR_UNKNOWN_CATEGORY`) instead of a raw `TypeError` with no `.code` from the leaf's `.toLowerCase()`/`.replace(...)`.
- `theme add`: a write failure where an ancestor of the target dir is a file now surfaces `ERR_WRITE_FAILED` (the `mkdir` moved inside the write try/catch) instead of leaking a raw fs errno (`EEXIST`/`ENOTDIR`) + absolute path.
- `validate-integration`: a path-unsafe `[package]` spec (`..`/absolute) is reported as an `invalid_package_spec` diagnostic instead of crashing with a raw stack (human) / generic `ERR_UNKNOWN` (`--json`).
- `doctor`: no longer crashes (raw stack in human mode / `ERR_UNKNOWN` in `--json`) when multiple `astryx.config.*` files coexist — it reports a `config` FAIL. Version-alignment skips (info) instead of a spurious drift WARN with a `NaN.undefined.x` fix when either version isn't comparable semver (e.g. `workspace:*`).
- `manifest`: subcommands are sorted by name (same stability guarantee the top-level command list makes), so reordering `.command()` calls can't silently change the agent-facing manifest.
- `build`: the CLI wrapper now propagates the API's error `code` into the `--json` envelope (bogus `--type` / non-positive / non-integer `--limit` → `ERR_INVALID_ARGUMENT` instead of a generic `ERR_UNKNOWN`), and delegates `--limit` validation to the API (parity with `search`).
- `layout check`: exits `1` in BOTH `--json` and human mode for an invalid (but parseable) layout — the exit code no longer depends on the output mode, so it works as a CI gate / agent check without parsing stdout.
- `upgrade` config codemods: a `findConfigPath` throw (multiple `astryx.config.*` files) is surfaced as a structured per-codemod error instead of crashing the whole upgrade run — config codemods run before the strict loader, so this restores the per-codemod isolation every other failure path honors.
- CLI dispatch: the belt-and-suspenders postAction "completed without emitting an envelope" error carries a `code` (`ERR_UNKNOWN`) so every error envelope is branchable on `code`.
- `toErrorEnvelope`/`AstryxError`: attach `suggestions` only when it's a real array.
- `injectXdsBlock`/`removeXdsBlock` no longer drop, duplicate, or orphan user content on malformed managed blocks (END-before-START, duplicate/nested blocks, or a start marker with no end). They locate a single well-formed block (END searched after START) and refuse to touch an ambiguous/half-written file instead of corrupting it.
- The codemod source scan no longer follows symlinks (a symlinked file under the scanned path could rewrite its target OUTSIDE the project) and skips generated-output dirs (dist/build/out/.next/coverage) — codemods rewrite source, not artifacts or dependencies.
- `resolvePackageDir` rejects an integration spec that isn't a bare package name (no `..`, no absolute, must stay in node_modules) — a config spec can no longer point the loader at an arbitrary module.
- A broken integration manifest (throws on import or fails schema validation) no longer crashes `Project.load` (and thus every command). It's recorded and surfaced via `issues()`, restoring the documented skip+warn policy; other integrations still load.
- The `--radius-*`, `--shadow-*`/`--elevation-*`, and `--color-*` token-migration codemods no longer rewrite a longer consumer-defined token that merely shares a prefix (e.g. `--radius-container-custom` → `--radius-3-custom`, `--radius-innermost` → `--radius-0most`, `var(--shadow-10)` → `--shadow-base0`, `--color-positive-custom` → `--color-success-custom`). The boundary lookahead was binding only to the last alternative in the pattern (and two codemods had no boundary at all); it now wraps the whole alternation, so only exact token names migrate.
- `migrate-badge-children-to-label` no longer emits a duplicate `label` prop when the badge already has one (`<XDSBadge label="x">Active</XDSBadge>` produced an invalid `label="x" label="Active"`); it now skips a badge that already declares `label`.
- `readDocMeta` no longer reads a `group:`/`hidden:` field nested inside a `propDescriptions` block (a docsZh/docsDense translation export) as the component's group — that leaked a translated prop description as a group key in the default English `component --list` (e.g. a Chinese string appeared as a group). The field regexes now match top-level fields only (<=2 spaces).
- `astryx search`/`build` verbose output was unreachable: the boolean `--detail` flag collided with the root program's value-taking `--detail <level>`, so `search button --detail` errored `argument missing`. The boolean is now `--verbose` (the global `--detail <level>` is unchanged).
- The themes bundled for `astryx theme add` had drifted from source — the `neutral` bundle was missing a WCAG AA light-mode `text-secondary` contrast fix and a StatusDot color block, so `astryx theme add neutral` scaffolded a theme below AA. All bundles are regenerated to match source, guarded by a new drift test.
- The `unwrap-authoring-factories` upgrade codemod produced broken output for a shorthand `type` property (emitted `{'component'}`) and for no-argument factory calls (left a call referencing the just-removed import). Both now emit the correct plain object.

#### Contributors

Thanks to everyone who contributed to this release:

- @AKnassa
- @cixzhang
- @ejhammond
- @imdreamrunner
- @jiunshinn
- @joeyfarina
- @josephfarina

---

# 0.2.0

#### Breaking Changes

- cli/json: remove the central `CLIAnyResponse`, `CLIResponseType`, and `CLIResponseDataMap` types. `jsonOut` is now a structural serializer and `parseResponse` / `assertResponse` return the structural `CLIResponse` (`{type, data, meta?}`) instead of the discriminated union, so `result.data` is `unknown` until you narrow it yourself.
  Runtime output is unchanged (every `--json` envelope is byte-identical). This only affects consumers importing those types or relying on `parseResponse` / `assertResponse` to auto-narrow `.data`.
- component/hook `--json` list responses collapsed. `--detail compact`/`full` previously emitted distinct `component.brief`/`component.full` (and `hook.*`) envelopes; they now all emit `component.list` (resp. `hook.list`) with a `data.detail: 'names' | 'compact' | 'full'` field. Migrate: switch on `data.detail`, not the `.brief`/`.full` discriminator. Removed types: ComponentBriefResponse, ComponentFullResponse, HookBriefResponse, HookFullResponse.

#### New Features

- CLI: `blog` is now a normal, agent-facing command — it appears in `--help` and the capability manifest and supports `--json` (emitting `blog.list` / `blog.detail` envelopes), instead of being hidden. Human output is unchanged; the reader still consumes the public RSS feed. Also scriptable through the `./api` barrel as `blog(slug?)`.
- CLI: `init` is now fully scriptable through the `./api` barrel — the non-interactive installer (agent-docs cheat sheet, starter template, `--remove-agents`) lives in `api/init` and returns a typed receipt (`init.run` | `init.remove`), with the CLI reduced to a thin parse → API call → render wrapper. Human output is emitted through an injectable logger, so a scripted `init()` stays silent while the CLI output is byte-identical for existing usage.
- CLI: `theme build` is now fully scriptable through the `./api` barrel — the ~1,000-line theme compiler (defineTheme extraction, CSS generation via `@astryxdesign/core/theme`, variant/type-declaration + icon-module generation, override validation) lives in `api/theme/build` and returns a typed `theme.build` receipt, with the CLI reduced to a thin parse → API call → render wrapper. Human progress is emitted through an injectable logger, so a scripted `themeBuild()` stays silent while the generated CSS/JS/.d.ts, the `--json` envelope, and human output stay byte-identical for existing usage. Watch mode remains a thin CLI loop.
- CLI: `upgrade` is now fully scriptable through the `./api` barrel — the version-to-version pipeline (codemods + agent-docs refresh) lives in `api/upgrade` and returns a typed receipt (`upgrade.list` | `upgrade.status` | `upgrade.run`), with the CLI reduced to a thin parse → API call → render wrapper. Human progress is emitted through an injectable logger, so a scripted `upgrade()` stays silent while the CLI output and `--json` envelopes are unchanged for existing usage.
- Timestamp: new `tooltipEntries` prop renders the hover tooltip across several time zones and/or formats at once — one line per entry, each with an optional `timezoneID` (IANA id; omit it or pass `'local'` for the viewer's zone), `format` (every non-relative `TimestampFormat` plus `'full'`), and `label`. The default is unchanged: with no entries the tooltip stays the single full absolute line in the viewer's zone. Configuring entries also attaches the tooltip to absolute formats, which previously had none — note that this gives those timestamps a tab stop and focus ring, as relative timestamps already have, so a column of them gains one tab stop per row. `hasTooltip={false}` still suppresses the tooltip, and an empty array counts as no configuration. Also corrects `isTimezoneShown`'s documentation, which claimed it applied to the `system_date_time` and `system_time` formats; it never has, and those formats stay machine-readable. (#4188)

#### Fixes

- `astryx theme build`: component-override keys for multi-word components (TextInput, DateInput, NumberInput, DropdownMenu, SideNav, TopNav, etc.) now match the hyphenated class the component actually renders. The known-component registry used de-hyphenated keys, so overrides authored against them emitted dead selectors (`.astryx-textinput` instead of `.astryx-text-input`) that silently never applied (#4109).

#### Other Changes

- CLI: blog reorganized into api/blog leaf shape — list/detail leaves projecting a shared RSS adapter (`_adapter.mjs` owns all network fetch + feed parsing), with `blog.mjs` kept as a dispatcher+barrel so the same `blog` export, the CLI wrapper, api/index.mjs, and the --json/human output stay byte-identical.
- CLI: `build` reorganized into the `api/build` leaf shape — `build.mjs` is now a dispatcher + barrel that routes no-query → `build.help` (`api/build/help/help.mjs`) and a query → `build.kit` (`api/build/kit/kit.mjs`), with each leaf projecting its single `{type, data}` envelope. Pure reorganization: the `build` export, the `./api` barrel, and the CLI consumer are unchanged, and the `--json` and human output stay byte-identical for existing usage.
- CLI: `component` reorganized into the `api/component` leaf shape over a shared `_adapter` resolver — `component.mjs` is now a dispatcher + barrel that routes to per-type leaves (`list`, `detail`, `detail/props`, `detail/source`, `detail/showcase`, `detail/blocks`), each a thin projection of a subject the adapter resolves once (core/external/scoped/integration ownership, ambiguity handling, and fuzzy search, deduped). Pure reorg: every `--json` envelope and human output stays byte-identical across all modes.
- CLI: discover reorganized into api/discover leaf shape (list, detail, detail/doc, search) behind a shared _adapter that owns external-package discovery and doc loading; discover.mjs is now a dispatcher+barrel keeping the same exports. Pure reorg — `--json` and human output are byte-identical and api/index.mjs + the CLI consumer are untouched. Adds colocated leaf tests.
- CLI: docs reorganized into api/docs leaf shape — `docs()` in `api/docs/docs.mjs` is now a dispatcher + barrel that routes by argument shape into three leaves (`api/docs/list`, `api/docs/detail`, `api/docs/detail/section`), each projecting into a single `{ type, data }` envelope. The discovery, overlay loading, and topic resolution shared by ≥2 leaves live in `api/docs/_adapter.mjs`. Pure reorganization: the `docs` export, `api/index.mjs`, the CLI consumer, and all `--json` and human output are unchanged (byte-identical).
- CLI: hook reorganized into api/hook leaf shape — `hook.mjs` is now a dispatcher+barrel routing to colocated leaves (`list/list.mjs` → hook.list, `detail/detail.mjs` → hook.detail, `detail/params/params.mjs` → hook.detail.params) over a shared `_adapter.mjs` resolver. Pure reorg: `--json` and human output are byte-identical across all modes, and the `hook` export surface (api/index.mjs + CLI) is unchanged.
- CLI: init reorganized into api/init leaf shape — `init.mjs` is now a dispatcher + barrel that routes to `api/init/run/run.mjs` (the default / `--features` / `--all` install path) and `api/init/remove/remove.mjs` (the `--remove-agents` path), with the shared plain-logger contract in `api/init/_adapter.mjs`. Pure reorg: `getNextSteps`, `noopInitLogger`, and the `InitOptions` / `InitLogger` types stay re-exported from the barrel, so api/index.mjs, the CLI command, and the programmatic API are unchanged. Human and `--json` output are byte-identical.
- CLI: layout reorganized into the api/layout leaf shape — a shared `_adapter.mjs` (`analyze`/`loadBlocks`/`formatIssue` over `lib/xle`) with thin `expand/`, `check/`, and `grammar/` leaves, plus a `layout.mjs` barrel. `api/index.mjs` and the CLI are unchanged (they import via the barrel). Pure reorg: `layout expand`/`check`/`grammar` `--json` envelopes and human output are byte-identical.
- CLI: swizzle reorganized into api/swizzle leaf shape — the flat command splits into `api/swizzle/list` (`swizzle.list`) and `api/swizzle/copy` (`swizzle.copy` receipt, incl. `rewriteImports`), with shared @astryxdesign/core discovery + component listing deduped in `api/swizzle/_adapter.mjs`, and `swizzle.mjs` reduced to a dispatcher + barrel that keeps its existing exports (`swizzle`, `rewriteImports`). Pure reorganization with no behavior change: human output and every `--json` envelope stay byte-identical, and the CLI command, the `./api` barrel, and the central `types/swizzle` declarations are untouched.
- CLI: template reorganized into api/template leaf shape (shared helpers preserved on the barrel). Pure reorg — `--json` and human output stay byte-identical: shared discovery/IO moved to `api/template/_adapter.mjs`, the command modes split into `list`/`show`/`skeleton`/`copy` leaves, and `template.mjs` becomes a dispatcher + barrel that re-exports every previously-exported symbol (template, discoverTemplates, discoverAll, discoverAllWithErrors, discoverIntegrationTemplatesForOne, findShowcase, findRelatedBlocks, stripTemplateAssetRefs, listTemplates, extractComponents, and the DiscoveredTemplate/TemplateDiscoveryError types) so component/layout/search/init/discover/validate-integration and lib/project keep resolving `api/template/template.mjs` unchanged.
- CLI: `theme add`/`list` are reorganized into the fractal `api/theme/` leaf shape — a shared `_adapter.mjs` (bundled-theme manifest reader + slug resolver) with thin `add/` (copy → `theme.add` receipt) and `list/` (`theme.list`) leaves over it, plus a `theme.mjs` barrel, mirroring the `theme build` extraction (#4462). `themeList()` is now exported from `@astryxdesign/cli/api` alongside `themeAdd`. Pure reorg: `theme list`/`add` `--json` envelopes and human output are byte-identical, with new direct-API tests for both leaves.
- CLI: upgrade reorganized into api/upgrade leaf shape — the flat pipeline is split into a dispatcher+barrel (`upgrade.mjs`), a shared `_adapter.mjs` (version detection + agent-docs refresh + codemod selection/execution machinery), and `list`/`status`/`run` leaves (`upgrade.list` | `upgrade.status` | `upgrade.run`). Pure reorg: the `./api` barrel + CLI consumer are unchanged, and both the human output and `--json` envelopes are byte-identical.

#### Contributors

Thanks to everyone who contributed to this release:

- @AKnassa
- @cixzhang
- @josephfarina

---

# 0.1.9

#### New Features

- CLI: full API coverage for the `build`, `swizzle`, `layout`, and `validate` commands — each is now scriptable through the `./api` barrel with the CLI as a thin parse → API call → render wrapper. `build` gains `--json` output. Behavior is unchanged for existing command usage. (#4302)

#### Fixes

- Align two `--json` contract shapes with what the CLI actually emits
- Register all emitted response types in the `--json` envelope union
  Three response types were defined, exported, and emitted by commands but never added to `CLIAnyResponse` — the union that `jsonOut()` type-checks payloads against: `component.full`, `component.detail.blocks`, and `upgrade.status`. Because their discriminators were missing from the map, `jsonOut('upgrade.status', …)` (and the two component variants) were rejected by the type-checker, and their payload shapes weren't actually being validated. `build.help` had no response type at all. Added a `BuildHelpResponse` type and wired all four into the union so every `--json` envelope the CLI can emit is now type-checked against a declared shape.
- Type `detectPackageManager` honestly so `astryx doctor`'s "no lockfile" branch is reachable
  `detectPackageManager` returns `'npx'` as the sentinel for "nothing detected", but its return type only listed `'yarn' | 'pnpm' | 'bun' | 'npm'`. Type-checkers therefore treated `doctor`'s `pm !== 'npx'` guard as a dead comparison — the "No lockfile detected — defaulting to npm/npx" message looked unreachable and was at risk of being "cleaned up". The return type is now `PackageManager | 'npx'` and detection narrows via a shared type predicate, so the guard is honest and the branch is preserved.
- Make the CLI's `.mjs` sources fully strict-typecheckable (checkJs + JSDoc)
  Annotated the entire CLI package so `tsconfig.strict.json` (full `strict` `checkJs` over `src`, `bin`, `scripts`, `docs`, and the emitted `templates`) reports zero errors — down from 1717. Fixes are JSDoc-only: no runtime logic changed, `.mjs` stays `.mjs`. Strict checking also surfaced and corrected several type-contract drifts: the `upgrade.run` response type (declared a `depsUpdated` field the command never emits, and omitted the real `integrations`/`filesChanged`/`transformsApplied`/`errors`), registered the emitted `theme.list`/`theme.add`/`layout.*` response types in the `--json` envelope union, and added `category?` to `ReferenceSection` in core's docs types (reference docs already emit it).
- Drop the dead `cwd` parameter from `getLatestVersion`
  `checkForUpdate` called `getLatestVersion(cwd)` and the JSDoc advertised a `cwd` parameter, but the function takes no arguments — it only reads the `$ASTRYX_LATEST_VERSION` env var, so the passed `cwd` was silently ignored. Removed the phantom parameter and its doc so the signature matches the behavior. No functional change to the update-nudge output.

#### Other Changes

- `swizzle.copy` payloads always include `package` and `usesStyleX` (both covered by tests), but `SwizzleCopyResponse.data` didn't declare them — the call site cast the payload to `Record<string, unknown>` to sidestep the mismatch. Added both fields to the type and dropped the loose cast so the payload is type-checked.
- The error `suggestions` shape was declared as `{name, reason}` (reason required) in the JSON envelope / API error contract, but some call sites emit bare `{name}` (e.g. candidate component names on swizzle). Introduced a single canonical `Suggestion` type (`reason?` optional) and referenced it everywhere so the contract matches the emitted data.

#### Contributors

Thanks to everyone who contributed to this release:

- @josephfarina

---

# 0.1.8

#### Breaking Changes

- Avatar and AvatarGroup adopt Icon's abbreviated size scale — `size` now takes `xsm`/`sm`/`md`/`lg`/`xl` instead of `tiny`/`xsmall`/`small`/`medium`/`large`. Pixel values are unchanged (20/24/36/48/128px) and the default is now `md` (still 36px, formerly `small`). Avatar's tiers stay larger than Icon's because avatars align with media rather than glyphs. Run `astryx upgrade` to migrate call sites. (#2672)

#### New Features

- `astryx init --features agents` now defaults to creating root `AGENTS.md` — the tool-agnostic standard that Codex/Copilot, Cursor, and most agents read — instead of the Claude-specific `.claude/CLAUDE.md`. Claude output is now opt-in via `--agent claude` (→ `.claude/CLAUDE.md`), and `--agent all` still writes both. Projects with existing agent-doc files are unaffected: init still discovers and updates every file already present, so this only changes the from-scratch default. (#4216)
- "Foolproof init": both `@astryxdesign/core` and `@astryxdesign/cli` now print a postinstall nudge pointing you to `npx @astryxdesign/cli init`, `astryx` commands nudge you to finish setup until init has run, and `astryx init` runs non-interactively (no TTY required) so it works in CI and agent environments. (#4147, #4153, #4154, #4155)

#### Fixes

- Stop suggesting bare `npx astryx` before the CLI is installed — it resolves to an unrelated package on the npm registry.
  The CLI now emits an install-aware invocation everywhere it prints a command:
- Extend the v0.1.0 upgrade codemods to cover test files that mock `@xds/core` modules, which were previously left half-migrated and broke after upgrade:
- `astryx upgrade` now keeps the managed agent-docs block (`<!-- ASTRYX:START --> … <!-- ASTRYX:END -->`) in sync with the installed version on **every** path — including the up-to-date and no-codemods short-circuits that previously returned before any refresh, leaving AI agents reading a stale component index and superseded rules. The block documents the installed library, so it's now refreshed up front (independent of codemods) and reported in the `--json` receipt as `agentDocs`. One detection pass covers three cases: a stale block is rewritten (`--apply`) or reported as a pending change (dry-run, which no longer writes); a project with core installed but no managed block is nudged to run `astryx init --features agents`; an already-current block stays silent. (#4168, #4169)

#### Documentation

- Add a `cli-integrations` CLI docs topic (`astryx docs cli-integrations`) so the integration-authoring guide (originally written by @ejhammond) is discoverable through the CLI and docsite instead of an unreferenced markdown file. Rewrite the CLI README's Configuration section to match the current strict config schema (`integrations`, `issuesUrl`, `hooks.postCodemod`, `experimental.xle`) and reframe the Integrations section around the two-file API.

#### Other Changes

- Installed / global / dev runs suggest `<pm> astryx <cmd>` (e.g. `pnpm exec astryx …`), unchanged.
- One-off runs (launched via `npx`/`pnpm dlx`/`yarn dlx`/`bunx`) suggest the scoped package `<dlx> @astryxdesign/cli <cmd>`, which always resolves to us.
- **migrate-xds-module-specifiers**: rewrite the mocked-module path in `vi.mock`/`vi.doMock`/`jest.mock`/`jest.doMock` (and bare `mock`) calls, plus `import(...)` specifiers used in TS type positions (`typeof import('@xds/core/Text')`), so the mock still intercepts the renamed `@astryxdesign/*` import.
- **drop-xds-prefix-imports**: un-prefix partial-mock override keys inside an `@xds/core` mock factory (e.g. `useXDSTruncation` → `useTruncation`) so the override matches the renamed export instead of silently overriding nothing. Scoped to recognized `@xds/core` mock factories only; unrelated object keys are untouched.

#### Contributors

Thanks to everyone who contributed to this release:

- @cixzhang
- @ejhammond
- @joeyfarina
- @josephfarina

---

# 0.1.7

#### New Features

- Export the authoring factories from `@astryxdesign/core`: `createConfig` at `@astryxdesign/core/config` and `createIntegration`/`createPageTemplate`/`createBlockTemplate`/`createComponentDoc`/`createFunctionDoc`/`createDoc` at `@astryxdesign/core/authoring`. Authoring a config or integration no longer requires depending on the CLI. Existing `@astryxdesign/cli/*` imports keep working via re-export.
- Add the finalized doc-authoring API to `@astryxdesign/cli/doc`: `createComponentDoc`, `createFunctionDoc` (any function, including hooks), and `createDoc` (generic reference/topic docs). Each factory stamps a `type` discriminant and is validated at the load boundary against a matching per-kind schema. The legacy loose `export const docs = {...}` format keeps loading unchanged, and `.ts`-authored hook/function sources now derive their import path to a tree-shakeable subpath instead of the bare package root.
- New codemod for the Table `tableProps` deprecation: lifts object-literal `tableProps` keys into direct props on `<Table>`, keeps colliding or dynamic values in place with a TODO note. **Codemod:** `npx astryx upgrade --codemod migrate-table-tableprops-to-direct-props` (#3679)
- New docs topic `internationalization` covering how to localize astryx components, provide translation catalogs, override default strings, coexist with existing i18n libraries (react-intl, i18next, next-intl), swap languages at runtime, and validate coverage with the shipped pseudo locale. Run `npx astryx docs internationalization` or read it at https://astryx.atmeta.com/docs/internationalization.
- template: accept `.template.{ts,mjs,js}` as the canonical suffix for template-spec files, alongside the legacy `.doc.*` suffix. Template specs export `createBlockTemplate`/`createPageTemplate` — a scaffoldable template, not documentation — so they now get a descriptive name. Core, external-package, and integration discovery (`findShowcase`, `--blocks`, `astryx template <id>` scaffolding) all treat `Foo.template.ts` identically to a legacy `Foo.doc.mjs`; same-stem `.tsx` source resolves for either suffix, and `.template.ts` authoring is loaded via jiti. Additive only — no existing files are renamed.

#### Fixes

- Translated component docs no longer drop props
  A `docsZh` / `docsDense` block that carried its own `props` array replaced the English component doc **wholesale** rather than overlaying it, so any prop the translation had not caught up with simply ceased to exist. `astryx component Button --zh` silently omitted `isInterruptible` and `isIconOnly`; ten components were affected, including `MobileNav`, `Popover` and `Stack` through the multi-component `components[]` shape.
- Anchor --dense / --zh doc overlays to their base sections (#2182)
  The compressed and translated reference docs were merged into the base doc **by array position**, so an overlay whose sections were ordered differently — or which omitted one — grafted every title onto the wrong body.
- template: inline full demo-image URLs in the Avatar blocks and theme-showcase page so scaffolding strips them to a clean placeholder. Templates that stored only the CDN base in a `const` and appended the filename via interpolation (`` `${CDN}/File.png` ``) previously scaffolded a malformed `src` — the placeholder data URI with the filename glued onto the end — plus a dead `const CDN = 'data:…'`. (#4027)

#### Documentation

- Document the minimal `package.json#exports` recipe an integration needs so its block templates are importable by a bundler-resolution consumer and type-check under `moduleResolution: bundler`: `"./templates/*.tsx": "./templates/*.tsx"` plus an extensionful `import('@acme/widgets/templates/…/…Showcase.tsx')`. Adds `packages/cli/docs/integration-authoring.md` and a fixture test proving the recipe against the repo's own `tsc` and `esbuild`.

#### Contributors

Thanks to everyone who contributed to this release:

- @AKnassa
- @ejhammond
- @imdreamrunner
- @nynexman4464

---

# 0.1.6

---

# 0.1.5

#### New Features

- Add a v0.1.5 upgrade codemod that renames `labelSpacing="default"` to `labelSpacing="hug"` on Switch. (#2889)
- New `incident-console` page template: an on-call incident response console demonstrating the frame-first tracker archetype — grouped dense incident rows (StatusDot severity, Token state), PowerSearch filtering, status segmented control, and a resizable inspector panel with metadata and timeline. Adds the `Tools - Incident Console` template category.
- New `messaging-shell` page template: Slack-style column frame (rail | sidebar | stream | thread panel) built on the Chat component family — dense rows, zero cards. Adds the `Shell - Messaging` template category.

#### Fixes

- Fill viewport height across CLI page templates so the background covers the full page (#3762)
- `astryx init --features agents` now supports `--agent hermes`. The preset injects the component index into an existing `.hermes.md`/`HERMES.md` (Hermes Agent's top-priority project-context files) and otherwise creates root `AGENTS.md`, which Hermes loads from the project root — unlike the `.claude/CLAUDE.md` default. Additive only: existing `claude`/`cursor`/`codex`/`all`/auto-detect behavior is unchanged. (#2187)
- cli: `astryx doctor` now detects `@astryxdesign/theme-*` packages in pnpm projects. pnpm installs packages as symlinks into `node_modules/.pnpm`, and the theme scan only accepted real directories, so every symlinked theme package was skipped and doctor warned that none were installed (#3530).
- Make `astryx theme build`'s color-scheme declaration mode-aware, so built themes with `light-dark()` tokens no longer defeat `<Theme mode="light|dark">` forcing (#3660)
- `runCodemods` now returns `writtenFiles`, so `astryx upgrade`'s post-codemod hooks (prettier/eslint formatting) actually run on core-codemod changes.
  The runner built the `writtenFiles` list internally but omitted it from its return object, so `upgrade.mjs` read `codemodResult.writtenFiles ?? []` as always-empty and the configured `hooks.postCodemod` (e.g. `prettier --write`, `eslint --fix`) received no files and silently skipped. As a result, jscodeshift's default double-quote output (`"@astryxdesign/core/Button"`) was never reformatted to the project's style, failing `prettier-format` lint on migrated apps. The sibling `integration-runner` already returned `writtenFiles` correctly, so integration-codemod changes were formatted while core-codemod changes were not.
- `astryx swizzle`: swizzled components ship raw StyleX source that needs a build-time StyleX compiler, and without one they render unstyled with no error. The command now prints a StyleX build-setup note after copying (including the Next.js caveat that the StyleX Babel plugin disables SWC and breaks `next/font`, so an SWC-based transform is required), and `astryx docs styling` gains a "StyleX Build Setup" section covering per-bundler setup. (#3373)
- `astryx theme build`: custom component variants declared in a theme (e.g. `button['variant:accentOutline']`) now generate a type augmentation against the component's real interface (`ButtonVariantMap`) instead of a non-existent `XDS`-prefixed one, so `variant="accentOutline"` type-checks. Props with no augmentation point (closed unions like Button `size` or Heading `type`) are skipped instead of emitting dead augmentations, and the generated `.variants.d.ts` is now referenced from the theme's `.d.ts` so the augmentation actually loads. (#3371)

#### Documentation

- CodeBlock: terminal-style dark block template (syntaxTheme preset)
- Add cascade-layer safety guidance to the migration guide (`astryx docs migration`): a Cascade Layer Safety audit checklist (unlayered styles and later layers both beat `astryx-base` regardless of specificity, classify every stylesheet into a layer deliberately, layer Tailwind preflight on both v3 and v4) and a Foundation Smoke Test section (one page with Button/TextInput/Card/Table plus a non-zero-padding assertion) so a broken layer order fails before feature work instead of after N migrated screens. The getting-started guide now points to it from the theme CSS step.
- NavHeadingMenu: add a playground config and showcase block so the Overview tab has a working preview (#2698)
- NavHeadingMenu: constrain the showcase SideNav to a shorter height so the heading no longer appears to float at the top of the Overview preview (#2698)

#### Contributors

Thanks to everyone who contributed to this release:

- @arman-luthra
- @cixzhang
- @ejhammond
- @harjothkhara
- @is-jain
- @jiunshinn
- @josephfarina
- @let-sunny
- @thedjpetersen
- @zeroryu

---

# 0.1.4

#### Fixes

- `astryx component <Name>` now prints the correct `defineTheme` component-override key. The theming example stripped a stale `xds-` prefix (left over from the astryx rename) instead of `astryx-`, so it advertised keys like `astryx-base-table` / `astryx-button`. Those double-prefix to `.astryx-astryx-*` selectors at runtime and silently match nothing. Keys are now the stable class name minus `astryx-` (e.g. `base-table`, `button`), which is what `generateThemeRules` expects (#3458).
- Harden the v0.1.0 upgrade codemods against three cases surfaced while migrating consumer apps:

#### Documentation

- Add a browser-support guide (`astryx docs browser-support`) documenting the support tiers, the modern platform features Astryx depends on (Popover API, CSS anchor positioning, `light-dark()`), which components are affected, and how consumers can support older browsers for their own audience.

#### Other Changes

- **drop-xds-prefix-imports**: when un-prefixing an `@xds/core` import (e.g. `XDSCodeBlock` → `CodeBlock`) would collide with a same-named local binding in the file (such as a local `export function CodeBlock` wrapper), alias the import to `Astryx<Name>` and rewrite its usages instead of producing a duplicate declaration that breaks the build.
- **migrate-xds-css-surfaces**: rewrite CSS `@import` of `@xds/*` package stylesheets (both `'…'`/`"…"` and `url(…)` forms), including the `@xds/core/xds.css` → `@astryxdesign/core/astryx.css` file rename and the `theme-default`/`theme-daily` → `theme-neutral` collapse.
- **migrate-xds-module-specifiers**: when collapsing `@xds/theme-default`/`@xds/theme-daily` to `@astryxdesign/theme-neutral`, remap the `defaultTheme` export to `neutralTheme`, aliasing back to the original local name (`neutralTheme as defaultTheme`) so downstream usages keep working.

#### Contributors

Thanks to everyone who contributed to this release:

- @cixzhang
- @ejhammond
- @ryanda9910

---

# 0.1.3

#### New Features

- Add a hidden `astryx blog` command that reads the blog over the site's RSS feed and prints a post's plaintext (`.txt`) variant. The command is not shown in `--help` or the manifest and always reads from the canonical site origin.
- Component discovery is now package-ownership aware: --package scoping, source resolution for integration components, and package-qualified JSON listings.
- Strict config + integration v1 schema (integrations, issuesUrl, hooks.postCodemod) and new @astryxdesign/cli/integration export.
- File-based codemod API (createCodemod/createConfigCodemod) with the @astryxdesign/cli/codemod export and integration codemod discovery in upgrade.
- component, template, and upgrade now print a one-line non-blocking warning when a configured integration has validation issues, pointing to validate-integration.
- Add a Kanban Board page template: color-coded status columns, draggable task cards with priority tags, and board toolbar. Based on a design by @cg-hub18.
- Add frame-first layout guidance: new `astryx docs layout` topic (shell choice, region budgets, app archetypes, cards-vs-rows policy, responsive contracts), layout rules in the generated agent cheat sheet, and layout anti-patterns in `docs principles`.
- Add a v0.1.3 config codemod that migrates astryx.config layout.components to experimental.xle.components.
- Add v0.1.0 codemods for migrating `declare module "@xds/core/..."` type augmentations and `.xds-*` / `[data-xds-theme]` / `@layer xds-theme` CSS surfaces to their `@astryxdesign`/`astryx-*` equivalents.
- Introduce the Project configuration API as the single entry point for reading resolved project config, components, templates, codemods, and issue routing, replacing loadConfig. Misconfigured integrations are now skipped with a warning during upgrade instead of hard-failing, and a new --skip-codemod flag lets you re-run past a failed codemod.
- Add a Shell page-template category to the CLI: Top Nav, Side Nav, and Shell Nav app-shell scaffolds (#3245, #3246, #3247)
- Static template authoring API (createPageTemplate/createBlockTemplate) with the @astryxdesign/cli/template export and type-driven, package-scoped template discovery.
- Swizzle can now copy integration-owned components, rewrites escaping imports to the owning package, and routes maintainer feedback through config and integration issue URLs.
- `astryx theme build --watch`: rebuild a theme automatically whenever the source file changes, until interrupted with Ctrl-C. Removes the manual re-run step (and the stale-CSS confusion that comes with forgetting it) from the theme-authoring loop. Each rebuild runs in a child process so a build error is contained and the watcher keeps running. Not supported with `--json`. (#3375)
- Add the validate-integration command and integration issue model for checking an Astryx integration package's manifest and contributions.
- XLE app-component registration moved into validated config under experimental.xle.components (object form), replacing the unvalidated layout.components read.

#### Fixes

- Align the CLI error-code type declarations with the runtime error codes (add the missing ERR_AMBIGUOUS_TEMPLATE declaration).
- Correct the `doctor` theme-wiring hint to reference the real `astryx.theme` config field (was `xds.theme`) and update the agent-docs check wording to say "Astryx".
- Update the API/CLI parity harness for the package-qualified `component --list` shape, and make the component API reject a non-string name with a clean error instead of throwing.
- The XDS-prefix drop codemod now runs as a mandatory v0.1.0 upgrade step, so upgrading from 0.0.x rewrites prefixed imports (useXDSTheme, XDSButton, XDSIconRegistry, ...) to their bare names alongside the @xds/_ → @astryxdesign/_ scope rename.
- upgrade now runs core codemods before loading config, so a config codemod can repair an otherwise-invalid config; dry-run reports a fixable config and suggests the command to apply it.

#### Documentation

- Blockquote: add "With Attribution" and "Testimonials" examples (#3385)
- DateTimeInput and DateRangeInput: add example blocks so their docs pages have populated Examples sections and playground links (#2724)
- Add copyable example blocks to 46 component docs pages that previously showed only a hero visual and an empty Examples section (#3481)
- HoverCard: give the "Link Preview" example an interactive `Link` trigger so there is something to hover over (#2728)
- Lightbox: add Gallery, Video, and Zoom examples and fix the playground preview (#3301)
- Remove lingering references to the removed gap-report feature and swizzle gap flags; docs now reflect swizzle's maintainer feedback link.
- Tab: add an interactive example showing `icon` and `selectedIcon` on the Tab docs page (#2765)
- ToggleButtonGroup: add a vertical example block showing orientation="vertical" with single- and multi-select groups (#2707)

#### Other Changes

- Integration codemod and template-doc loading now use the shared module-loader util instead of duplicating the jiti/import logic.
- Extract the shared module-loading + conventional-file-discovery helpers used by config and integration loading into one internal util (no behavior change).
- Remove the standalone gap-report command. Swizzle now prints a short maintainer feedback link instead of filing issues.
- Load and validate user-authored config, integration, codemod, and template modules through one shared module loader; create\* factories are now type-only and validation happens at load.
- Remove the obsolete xds config-surface migration codemod and unify config codemod execution on the shared (file, api) runner used by integration codemods.

#### Contributors

Thanks to everyone who contributed to this release:

- @AKnassa
- @cg-hub18
- @ejhammond
- @ernestt
- @harshavardhan194
- @josephfarina
- @kentonquatman
- @mohitWeb-lab
- @pollychen-lab
- @thedjpetersen

---

# 0.1.2

#### Breaking Changes

- `Text`, `Heading`, `Link`, and `Timestamp` rename the `color="active"` value to `color="accent"`, now mapping to the dedicated `--color-text-accent` token (legible accent text ink) instead of `--color-accent`. Run `astryx upgrade` to migrate call sites automatically. (#2863)

#### New Features

- Let `astryx.config.mjs` integrations contribute package docs, gap-report hooks, template fetching hooks, upgrade codemods, and post-codemod hooks.
- Add `astryx theme add <slug> [path]` (and `astryx theme list`) to scaffold a theme's source into your project as editable files you own, with theme sources bundled into the CLI

#### Fixes

- align `astryx init` theme instructions with the runtime built-theme recommendation (#3080)
  `astryx init` now points users at the pre-built theme path (`@astryxdesign/theme-neutral/built` + `theme.css`) and the base CSS imports, matching the runtime `<Theme>` console guidance, instead of the slower runtime style-injection import that left apps unstyled.
- `astryx theme build` now derives every output file (.css/.js/.d.ts) from the theme name so they share one naming scheme, shows import paths as bare `./<name>` specifiers (instead of a cwd-rooted `./src/...` path that was wrong when your file already lives under src/), and no longer warns about the `variant` prop on `card`

#### Documentation

- Rename the ClickableCard and SelectableCard examples to follow the "Component — Variant" title convention (`Clickable Card — Nested Button`, `Selectable Card — Multi-select`), and add playground defaults to both card docs so their docsite previews show realistic card content (#2877)
- Declare playground scaffolds for the Chat sub-components so they preview at a realistic width (ChatComposer and ChatComposerDrawer wrap in a sized container, and the drawer seeds default content), and drop the redundant visible value label from the ChatComposerDrawer "With Progress" example while keeping the accessible label (#2877)
- Rename the DateInput "Date Range" example to "Min/Max Constraints" — it demos a single input constrained to a min/max window, not a date-range picker (#2692)
- Wire local state into more showcase examples that were frozen (static value + no-op onChange): TextInput, TextArea, NumberInput, SegmentedControl, RadioList, Tab, TabList, and TabMenu. Follows the same fix as the Slider/Selector/MultiSelector showcases so the docsite previews are actually interactive
- Wire local state into the Typeahead, Tokenizer, and FileInput showcase examples (static value + no-op onChange → frozen previews). Completes the interactive-showcase fixes started for Slider/Selector/MultiSelector (#3187-#3189) and the input/tab batch
- Wire local state into the Slider, Selector, and MultiSelector showcase examples so they are interactive — they were controlled components with a static value and a no-op/missing onChange, so the docsite previews appeared frozen (#3187, #3188, #3189)
- Add a LinkProvider example block showing how to swap in a framework router link (e.g. Next.js Link) for client-side routing (#2733)
- Add a showcase block for Outline so its docs page has a hero preview, alongside the existing example blocks (#2871)
- Remove the "MoreMenu — In Toolbar" example block — it rendered incorrectly and was redundant with the other MoreMenu examples (#2870)
- Add rendered example blocks for the two column-axis Table plugin hooks,
  shown on their own subcomponent pages:
- Move the "ToggleButton — Group" example to the ToggleButtonGroup page, where it belongs (it demonstrates grouped toggle behavior) (#2842)
- Make the Toolbar "Table Filter" example use real Selector controls for its Status and Priority filters instead of buttons styled to look like dropdowns, and add meaningful playground defaults plus richer slot options (buttons, icon buttons, tabs, segmented controls, selectors) to the Toolbar docs (#2877).

#### Other Changes

- `useTableStickyColumns — Pinned Columns` (on /components/useTableStickyColumns)
- `useTableColumnResize — Draggable Columns` (on /components/useTableColumnResize)

#### Contributors

Thanks to everyone who contributed to this release:

- @cixzhang
- @durvesh1992
- @ejhammond
- @humbertovirtudes
- @rubyycheung

---

# 0.1.1

#### New Features

- Add `astryx build` command for page composition, with natural-language search ranking.
  `build "<idea>"` returns a composition kit — the closest page template, the
  blocks that cover parts, and components to fill gaps, plus a Compose suggestion.
  `build` with no args prints the how-to-build playbook. The shared search ranking
  now handles oblique natural-language queries via tokenization + stopwords, a
  synonym/intent map, light stemming, and page-template keyword enrichment.
- Make generated agent docs build-first and restructure `init` output.
  The generated `CLAUDE.md` now leads with the `build` workflow (search reframed as
  a neutral universal find), and includes a required-CSS setup note
  (`reset.css` + `astryx.css`) so components never render unstyled. `init` now
  points agents at `astryx build`/`astryx search` instead of dumping page-template
  names.
- Improve `astryx build` output into a complete composition kit.
  `build "<idea>"` now returns an agent-ready kit grouped by role: a START line
  (scaffold vs compose), the closest PAGE template, an always-on FRAME (page
  shell) and FOUNDATION (layout/typography/action primitives), idea-specific
  BLOCKS and DOMAIN COMPONENTS (with a relevance floor to cut noise), and a SETUP
  reminder. The always-on FRAME/FOUNDATION groups fix low recall of the
  structural primitives every page needs but that never keyword-match an idea
  (measured: component recall 15% to 71% on an agent-grounded eval).
- Densify agent docs + tailor styling guidance to the project's configured system
  Tightened the generated `CLAUDE.md`/`AGENTS.md` block from ~48 lines to ~26
  (the per-topic `docs` dump collapsed to one line, `build`/`search`/`component`
  no longer duplicated between workflow and reference, run-prefix stated once,
  filler prose removed) — same information, far denser.

#### Fixes

- `npx astryx` now works when the CLI is installed as a real npm package.
  The bin imported its `../src/*` modules relative to the invoked path, so running
  through the `node_modules/.bin/astryx` symlink made them resolve outside the
  package (`ERR_MODULE_NOT_FOUND: .../node_modules/src/...`) on Node versions that
  don't realpath the bin entry. It now resolves siblings via the bin's real path
  (realpath of `import.meta.url`), working whether invoked via symlink, copy, or
  Windows shim. Also fixes the non-interactive `init`/`theme` error to say
  `astryx <command>` instead of the stale `xds <command>`.
- Add a v0.1.0 upgrade codemod that migrates legacy `@xds/*` module specifiers and config surfaces to the Astryx v0.1.0 names.
  [breaking] Remove legacy `astryx.versionFile` update-hint support from package.json.

#### Documentation

- Add npm install step to the Theme System guide
  The Quick Start section jumped straight to `import {neutralTheme} from '@astryxdesign/theme-neutral'`, which fails with `Cannot find module` for anyone who hasn't already installed the theme package. Prepend a one-line preamble + `npm install` code block, and add a short prose note above the Available Themes table pointing at the install command pattern. Reported in #3082.

#### Other Changes

- StyleX compiler wired → `xstyle` / StyleX token imports
- Tailwind → utility classes backed by `@astryxdesign/core/tailwind-theme.css`
- neither → `style`/`className` with `var(--token)` design tokens, plus an
  explicit note NOT to use `xstyle`/utilities (they would not compile)

#### Contributors

Thanks to everyone who contributed to this release:

- @ejhammond
- @josephfarina
- @nynexman4464

---

# 0.1.0

#### Breaking Changes

- Read project config from `astryx.config.mjs` (was `xds.config.mjs`)
  The CLI now resolves its optional project config from `astryx.config.mjs`
  instead of `xds.config.mjs` — a hard cut, no fallback. Consumers with an
  `xds.config.mjs` must rename it to `astryx.config.mjs` (the config shape and
  all fields are unchanged). Part of removing `xds` naming from the public API.
- Rename the CLI command/bin from `xds` to `astryx`
  The CLI binary is now `astryx` (was `xds`); `bin/xds.mjs` is renamed to
  `bin/astryx.mjs`, the dual `xds`+`astryx` bin entries collapse to a single
  `astryx`, and the program/manifest name is `astryx`. Invoke the CLI as
  `npx astryx <command>` (e.g. `npx astryx component Button`). The swizzle
  default output dir moves from `./components/xds` to `./components/astryx`.
  Consumers using `npx xds`, an `xds` npm-script alias, or the `xds` MCP server
  name should switch to `astryx`. Part of removing `xds` naming from the public API.
- Rename the exported `XDSError` class to `AstryxError`
  The CLI's programmatic API error class is renamed `XDSError` -> `AstryxError`
  (exported from `@xds/cli` + declared in its types). Consumers that catch or
  reference `XDSError` from the CLI's API should switch to `AstryxError`. Part of
  removing `xds` naming from the public API.
- Remove the XDS-prefix compatibility layer — astryx is now the only public surface
  This release erases all `xds` naming from the public API; there is no compatibility
  window. Consumers must migrate (we own all consumers pre-OSS):
- Remove the daily, brutalist, and default themes; neutral is the new baseline
  Three theme packages are removed from the repo and will no longer be published:

#### Fixes

- `theme build` generates valid bare type imports (IconRegistry/DefinedTheme)
  `astryx theme build` emitted `.d.ts` files importing `XDSIconRegistry` /
  `XDSDefinedTheme` from `@xds/core`, but those aliases were removed — the
  generated types failed to resolve. Generate `IconRegistry` / `DefinedTheme`
  (the bare names `@xds/core` now exports) instead.

#### Documentation

- Update CLI theme docs to the current theme set
  Refreshes the `astryx docs theme`, `getting-started`, `styling`,
  `styling-libraries`, and `migration` reference docs to reflect the published
  themes: `neutral`, `butter`, `chocolate`, `gothic`, `matcha`, `stone`, and
  `y2k`. The removed `theme-default`, `theme-brutalist`, and `theme-daily`
  packages are dropped from the docs, and install/import examples now use
  `@astryxdesign/theme-neutral` as the recommended starting theme.

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

- Remove the internal `drop-xds-meta-prefix` codemod from the OSS repo (#2970)
  This codemod has been moved to its own package's tooling, where it belongs. It was registered as an optional, version-independent transform and is not part of any standard upgrade path, so removing it does not affect the public `0.0.13 → 0.0.15` migration.
- Rename the npm package scope from `@xds/*` to `@astryxdesign/*`
  All published packages move to the new `@astryxdesign` scope (e.g. `@xds/core` → `@astryxdesign/core`), along with the workspace lockfile, build/runtime scope-directory scans, and docsite slug derivation. Consumers must update their imports and dependency names. The internal ESLint plugin namespace (`@xds/*` rules) is intentionally untouched and tracked separately. Existing `@xds/*` codemods continue to target the old scope so projects still on `@xds/*` can migrate.

#### Contributors

Thanks to everyone who contributed to this release:

- @cixzhang
- @ejhammond

---

# 0.0.15

#### Breaking Changes

- **New `astryx upgrade` codemods** — This release ships codemods for the DatePicker→Input rename (`rename-date-picker-to-input`), Stack `element`→`as` (`rename-stack-element-to-as`), Chat `isStreaming`→`isStopShown` (`rename-isStreaming-to-isStopShown`), imperative `ref`→`handleRef` (`rename-imperative-ref-to-handleRef`), the menu/selector `children`→`endContent` move (`migrate-item-children-to-endcontent`), and the selector function-children→`renderOption` move (`migrate-selector-children-to-render-option`). The bare-name migration (`drop-xds-prefix-imports`, `drop-xds-meta-prefix`) and the theme `migrate-theme-selectors-to-data-attrs` codemod ship as optional, run them explicitly. (#2879, #2957)

#### Upgrade

```bash
npx astryx upgrade --apply
```

#### New Features

- **`astryx` binary** — The CLI is now also available as `astryx` (same launcher as `xds`), part of the un-prefix migration. Component discovery, the doc gate, and CI checks are prefix-agnostic — both `XDS{Name}.tsx` and bare `{Name}.tsx` source files are recognized. (#2867, #2878)
- **`astryx doctor`** — New health-check command for diagnosing project/setup issues. (#2565)
- **Unified search** — `astryx search` searches across components, hooks, docs, and templates in one query. (#2564)
- **Capability manifest** — Full machine-readable capability manifest for agent discovery, plus stable machine-readable error codes on every error. (#2562, #2563)
- **`@xds/cli/api` hook export** — The `hook` is exposed via `@xds/cli/api` with types and parity coverage. (#2558)
- **CLI exit-code policy** — Every user-visible error now exits with code 1 in both human and `--json` modes (previously several command-layer errors printed a message but exited 0, invisible to CI scripts and AI agents). `xds bogus-cmd`, `astryx theme bogus-subcommand`, the bare `theme` group with an unknown subcommand, and "command not found"/"did you mean…" paths all exit 1. Help, version, and bare-list invocations still exit 0. Introduces `lib/cli-error.mjs` as the canonical exit-code helper.
- **Migration guide** — Added an explicit guide for moving existing Tailwind, shadcn, and Radix applications to XDS incrementally.
- **Data-attribute selector docs** — Documented the data-attribute selector surface in CLI docs alongside the core dual-emit change.

#### Fixes

- **`--json` on Commander short-circuits** — `--json` now honored on parse errors and `--help`. A new shim wires `exitOverride()` and a JSON-aware `configureOutput` onto every command and patches `outputHelp` to emit a `{apiVersion, type:'help', data}` envelope under `--json`. Parse errors produce `{apiVersion, error}` on stdout with exit 1; unknown subcommands now error instead of silently emitting help with exit 0; `--detail` is choice-validated. Non-`--json` invocations are unchanged.
- **`--json` contract enforcement** — Commands that don't support `--json` reject the flag in a `preAction` hook _before_ running side effects, so `astryx init --json` no longer creates files and _then_ errors, leaving partial state behind.
- **`--json` envelope documented** — Success responses are `{ type, data }`; error responses are `{ error, suggestions? }`. The `--json` help text describes both.
- **`xds --version --json`** — Emits `{ type: 'version', data: { version } }` instead of plain text.
- **`xds --json` (no subcommand)** — Emits `{ type: 'help', data: { commands, jsonSupported, ... } }` instead of human help text.
- **`astryx upgrade --json`** — "Already up to date" and "no codemods in version range" paths emit structured `{ type: 'upgrade.status', ... }` envelopes. The codemod runner is silent under `--json` so prompts and progress lines no longer corrupt stdout.
- **`astryx discover --json`** — Includes `meta: { configured: false }` when no packages are configured, distinguishing "configured but empty" from "not configured".
- **`xds gap-report --json`** — Returns a structured error instead of starting an interactive prompt when required flags are missing; the "gh CLI missing" path also emits a JSON error.
- **`astryx theme --json`** — The `theme` parent command (without a subcommand) rejects `--json` cleanly; `theme build --json` continues to work.
- **Theme CSS prose regression** — `astryx theme build` now uses a single CSS generation path (`@xds/core`'s generator) and treats a failed `@xds/core/theme` import as a hard build error instead of a silent fallback, fixing the docsite Markdown typography regression after the XDS-prefix migration. (#2964)

#### Contributors

Thanks to everyone who contributed to this release:

- @cixzhang
- @czarandy
- @ejhammond
- @ernestt
- @imdreamrunner
- @josephfarina
- @kentonquatman
- @rubyycheung
- @thedjpetersen

---

# 0.0.14

#### Codemods

- `rename-action-props` — Rename `on*Action` props to `*Action` (React 19 convention) (#1942)
- `rename-status-variants` — Rename `positive`/`negative` status to `success`/`error` (#2175)
- `rename-section-wash-to-muted` — Rename Section `wash` variant to `muted` (#2063)

#### New Features

- **New component showcases** — XDSAvatarGroup, XDSInputGroup, XDSStepper, XDSButtonGroup, XDSContextMenu, XDSFileInput, XDSDateRangePicker, XDSDateTimePicker, XDSBlockquote
- **Hook documentation system** — `xds hooks` CLI command for hook docs (#1849)
- **Playground defaults** — Added to 19 more components (#2047)
- **Theme/MediaTheme/SyntaxTheme showcases** — Utility showcase support (#2040, #2028)
- **Slot elements** — Wired through playground UI for ReactNode props (#2012, #2005)
- **`exampleFor` field** — Added to all block templates (#1966)
- **`scaffold` flag** — Template metadata scaffold support (#1939)
- **Table page templates** — Heatmap Status, Matcha Store, Chart Shoe Store (#2172, #2149, #2154)

#### Fixes

- **Group useXDSToast and useXDSCollapsible** with their parent components in docs (#2049)
- **DropdownMenu inline data types** — Inline into items prop docs (#2027)
- **Parent hook docs** to their component in docsite (#2022)

---

# 0.0.13

#### Codemods

- `toolbar-density-to-size` — Migrate Toolbar `density` prop to `size` (#1448)
- `icon-name-deprecations` — Rename `checkCircle`/`xCircle` icons to `success`/`error` (#1503)
- `rename-attachments-to-drawer` — Rename `XDSChatComposerAttachments` → `XDSChatComposerDrawer` (#1714)

#### New Features

- `--skip-install` and `--force-install` flags for `astryx upgrade` (#1547)
- `npx astryx docs icons` reference + updated icon prop descriptions (#1500)
- Theme nudge in generated agent docs (#1456)
- Theme `expandColorScale` — derive color tokens from accent hex in `astryx theme build` (#1452)
- Component groups read from doc files instead of hardcoded map (#1650)
- Page and block template system (#1393)

#### Fixes

- Handle prerelease suffixes in `semverCompare` (#1512)
- Handle ternary/logical expressions in `icon-name-deprecations` codemod (#1513)
- Don't inject XDS block into files without markers during upgrade (#1495)
- `findShowcase` matches by directory name and `componentsUsed` (#1728)
- Include `onMedia` CSS in built theme output (#1450)
- Register codemods for v0.0.13 (moved from v0.0.14) (#1508)

#### Upgrade

```sh
npx astryx upgrade --apply --to 0.0.13
```

---

# 0.0.12

#### Codemods

- `add-is-icon-only` — Add `isIconOnly` to icon-only Button and ToggleButton usages (#1257)

#### Upgrade

```sh
npx astryx upgrade --apply --to 0.0.12
```

---

# 0.0.10

#### Codemods

- `remove-size-props` — Remove `size` prop from StatusDot and ProgressBar (#966)

#### Upgrade

```sh
npx astryx upgrade --apply --to 0.0.10
```

---

# 0.0.8

#### New Features

- CLI: tsx parser for .ts files
- Update hints in postAction hook

#### Codemods

- `rename-endslot-to-endcontent` — Button `endSlot` → `endContent` (#895)
- `migrate-token-renames` — Token name migration to v0.0.8 convention

#### Upgrade

```sh
npx astryx upgrade --apply --to 0.0.8
```

---

# 0.0.7

#### Codemods

- `rename-banner-variant-to-container` — Banner `variant` → `container` (#814)

#### Upgrade

```sh
npx astryx upgrade --apply --to 0.0.7
```

---

# 0.0.6

#### Codemods

- `migrate-token-names` — Design token renames per naming audit
- `migrate-shadow-tokens` — Elevation → shadow semantic naming
- `migrate-collapse-to-collapsible` — XDSCollapse → XDSCollapsible
- `migrate-radius-tokens` — Semantic radius → numeric scale
- `migrate-skeleton-radius` — Skeleton radius prop → numeric scale
- `migrate-badge-children-to-label` — Badge children → label prop

#### Upgrade

```sh
npx astryx upgrade --apply --to 0.0.6
```

---

# 0.0.5

#### New Features

- Generate agent cheat sheet from live CLI metadata (#640)
- `--detail` and `--lang` flags for typed `.doc.mjs` output (#636)
- Fold `agent-docs` into `init` with `--features` flag (#639)

> **Note:** Codemods for v0.0.5 breaking changes are registered under v0.0.6. Use `--to 0.0.6`.

---

# 0.0.4

#### Features

- **`astryx theme build`** — Renamed from `build-theme` to `theme build` (#570)
- **`--lang` flag** — ComponentTranslationDoc support for i18n/compressed docs (#611)
- **`--zh` flag** — Chinese Simplified doc output (#567)

#### Refactors

- Split `component.mjs` into `lib/` modules with lazy command registry (#613)

---

# 0.0.3

#### Patch Changes

- Sync package.json exports map
- Add verify-exports CI check (#537)

---

# 0.0.2

#### New Features

- `astryx upgrade` command with codemod support
- `astryx theme build` (formerly `build-theme`)

#### Codemods

12 codemods for the v0.0.2 breaking changes:

- `rename-selector-items-to-options` — Selector `items` → `options`
- `unify-visibility-to-onOpenChange` — Visibility callbacks → `onOpenChange`
- `unify-uncontrolled-to-defaultX` — Uncontrolled state → defaultX pattern
- `rename-banner-endButton-to-endContent` — Banner `endButton` → `endContent`
- `rename-form-tooltip-startIcon` — Form `tooltip` → `labelTooltip`, `startIcon` → `labelIcon`
- `rename-isShown-to-isOpen` — Dialog/Popover `isShown` → `isOpen`
- `rename-topnav-title-to-heading` — TopNav title → heading
- `rename-sidenav-header-to-heading` — SideNav header → heading
- `migrate-useXDSIcon-to-getIcon` — `useXDSIcon()` → `getIcon()`
- `migrate-gap-to-numeric` — String gap tokens → numeric
- `migrate-isFullBleed-to-padding` — `isFullBleed` → `padding={0}`
- `migrate-badge-dot-to-statusdot` — Badge dot → StatusDot

#### Upgrade

```sh
npx astryx upgrade --apply --to 0.0.2
```

---

# 0.0.1

- Initial release
