---
title: 'Astryx v0.7.0: library integrations, Markdown plugins, and better tables'
description: 'What shipped after v0.6.0: CLI support for other libraries, composable Markdown, more reliable tables and layers, localized controls, and guided breaking migrations.'
date: '2026-10-12'
type: 'update'
draft: true
authors:
  - 'team'
tags:
  - 'Release'
  - 'Theming'
  - 'Components'
  - 'Accessibility'
---

Astryx v0.7.0 brings together everything shipped from v0.6.1 through v0.6.8, adds the final fixes, and completes the breaking migrations for this minor. Update every stable Astryx package in your project to `0.7.0`, then run the upgrade:

```bash
OLD_VERSION=0.6.8 # replace with the Core version your project uses today
npm i @astryxdesign/core@0.7.0 @astryxdesign/cli@0.7.0 @astryxdesign/build@0.7.0 @astryxdesign/theme-neutral@0.7.0
npx @astryxdesign/cli upgrade --from "$OLD_VERSION" --apply --path .
```

The example includes Neutral; update any other stable Astryx themes your project uses in the same install step.

## Highlights

### Integrate other libraries with the Astryx CLI

You can now integrate other libraries with the Astryx CLI. A chart or editor package can expose its components, docs, templates, upgrade scripts, guidance for coding tools, or source themes through the same commands an Astryx app already uses. In that library's package, add one contribution and verify that npm will include it:

```sh
npx @astryxdesign/cli integration add component AcmeChart
npx @astryxdesign/cli integration verify
```

Once the library is a declared dependency, Astryx discovers it automatically, and component and search results show the package import to use.

Theme authors also get shorter token names and clearer styling names for controls such as Slider and DateRangeInput. Vite apps keep native `light-dark()` values for Astryx's supported browsers. Neutral and the maintained themes now verify that their generated styles stay in sync.

### Markdown plugins

Markdown now supports plugins for frontmatter, math, source-line annotations, text transforms, and custom code blocks. Apps provide their own math and code renderers, so the output can match the product.

![The same two-line Markdown document shown twice. On the left, the raw source: a sentence with a bold version, an @ksying mention, and a fenced code block tagged checks holding two label: state lines. On the right, the rendered output with plugins: the mention renders as an avatar chip, the fence renders as a status card with a green pass badge and a yellow pending badge, and a gutter labels each block with its source lines, L1–2 and L4–7.](/blog/astryx-v0-7-0/markdown-plugins.png)

Streaming content now keeps open code fences, quotes, tables, long definitions, and adjacent lists stable as text arrives. Source-line plugins also work inside lists and quotes without accepting forged offsets.

### Tables are easier to use

Expanded rows keep their details aligned, row striping stays consistent, and buttons or links inside a row keep working normally. Grouped rows keep custom headers full-width, and disclosure buttons report the right expanded state.

Column resize handles are keyboard reachable, stay visible when the pointer enters the header, and work with sticky columns. In nested or narrow layouts, tables scroll when they need to and hand scrolling back to the page when they do not.

![Two Astryx tables. On the left, an orders table with the first row expanded: its line items sit in a panel that starts under the Customer column, aligned with the row above, while the other rows keep their chevrons and status badges. On the right, a wider table scrolled sideways with the Customer column pinned; the pointer rests on the header, so every column boundary shows a thin resize line and the boundary under the pointer is drawn stronger.](/blog/astryx-v0-7-0/tables.png)

### Sheets, menus, and inputs keep their state

Bottom sheets now drag more predictably, keep pinch zoom working, and let keyboard users reach overflowing content. Escape closes an inner menu, Popover, or Dialog before the sheet behind it. AppShell keeps page state and focus when it switches to or from its mobile layout.

![Three phone screens side by side, each with a bottom sheet open over a dimmed page. First, an Assign reviewer menu that opened as a sheet listing three names and a red Remove assignee action. Second, a Release date field whose picker opened as a sheet calendar for October 2026 with the 14th selected and a Save button. Third, a Release time field whose picker opened as a sheet with hour, minute, and AM/PM wheels set to 9:30 AM.](/blog/astryx-v0-7-0/mobile-friendly.png)

`DropdownMenu` can now place controls such as a filter field or Create button above and below the menu rows. The controls remain separate from the menu for screen readers, while Tab moves through all three areas. Drilled-in menus give their Back row a useful name, and apps can attach attributes, event handlers, and a ref to sub-menu rows. Apps without swipe actions also save about 2.7 KB gzip because `Item` loads that code only when needed.

Dialogs show focus rings after keyboard input, including when focus returns after closing. Toasts remain visible and clickable above an open Dialog without restarting their timers.

`DateTimeInput`, `DateRangeInput`, and `Calendar` stay empty after a controlled value is cleared. The native DateInput picker shows busy feedback while its change runs. Field status tips announce updates to screen readers, and Kbd keycaps have stronger contrast across the stable themes.

### More interfaces speak the user's language

Chart accessibility text and Spinner's default label moved into the shared translation catalog. The 0.6.x releases also tightened IME handling, accessible empty states, input-clear labels, and keyboard traversal through scrollable content.

### The CLI gives shorter, more actionable answers

Focused docs guides preserve familiar routes while making layout, styling, tokens, typography, and internationalization easier to scan. `CommandPalette` renders its own results list; use `CommandPaletteList` directly only when you need a standalone results list. Template and build commands now report missing dependencies and StyleX setup without guessing an install command when nearby lockfiles disagree. Theme build avoids repeating the same install guidance for every theme, and `doctor` explains both what it checked and why a check was skipped.

## Breaking changes and migration

### Input styling uses explicit container and control props

All 16 inputs built with Field now apply accepted element props to the actual input, trigger, or group. If your code measured, queried, or listened to the outer Field wrapper, add your own wrapper and move that code there. Review `ref`, `id`, `data-*`, ARIA attributes, and DOM handlers during the upgrade; TextInput, TextArea, NumberInput, and FileInput also preserve a caller's `id`, and the first three preserve `aria-describedby`.

For `TextInput`, `TextArea`, `NumberInput`, `FileInput`, `DateInput`, `DateRangeInput`, `DateTimeInput`, `TimeInput`, `Selector`, `MultiSelector`, and `ComplexSelector`, move root `xstyle`, `className`, and `style` to the matching `control*` prop. For `Typeahead`, `Tokenizer`, `CheckboxList`, `RadioList`, and `Slider`, use the matching `container*` prop. A Typeahead inside InputGroup uses `control*` instead. Container styling has no effect inside InputGroup or a `horizontal-labels` FormLayout, and selector containers yield to `renderTrigger`.

The `migrate-field-input-styling` upgrade rewrites direct named, aliased, and namespace Astryx JSX imports. It leaves wrapper props and spreads for manual review, and adds a TODO instead of overwriting an existing new prop. JavaScript and other untyped code gets a development warning, and old root styling is ignored.

### Theme styling uses current names and data attributes

Themes must use the current component styling names and `data-*` selectors for state. Components no longer emit the 21 old aliases or bare prop and state classes, and theme discovery lists only current names. `ThemePropsOptions` and `ComponentThemingTarget.deprecatedFor` are removed.

The upgrade command renames known theme keys and CSS classes, then replaces state classes tied to a component styling name with `data-*` selectors. It adds `TODO(astryx upgrade)` when old and new keys collide, a bare class has no known meaning, or a clear-icon key needs CSS scope. Dynamic keys, unqualified classes, and CSS inside JavaScript or TypeScript strings remain unmarked, so search for those by hand.

### Data-color defaults move to StyleX

If you use data colors in CSS, import `dataVars` from `@astryxdesign/core/theme/dataTokens.stylex`. Canvas and other non-CSS code should keep using `resolveThemeToken()` or `useTheme().token()`. Theme builds now include only the data-color overrides you wrote, so rebuild committed CSS with `astryx theme build`. The upgrade reports data-color variables without fallbacks and stale generated CSS for manual review.

### `theme add` imports; `theme eject` copies source

`astryx theme add <slug>` now imports the built theme and returns `theme.app`. The old path argument and `--overwrite` option are rejected. If a script copied theme source, switch it to `theme eject` with the same slug, path, overwrite, and package arguments. Existing `theme add --import` calls keep their meaning.

### Complete icon registries include Upload

A custom complete registry typed as `IconRegistry` must now provide the `upload` semantic icon. Add an `upload` entry drawn in the registry's own style. No codemod can create bespoke icon artwork.

### Previously ignored props now work

`Layout`, `MetadataList`, `NavHeadingMenuItem`, and `TopNavMegaMenuItem` now apply IDs, roles, ARIA/data attributes, event handlers, and other supported props that they previously accepted but ignored. Remove one only if your code relied on it doing nothing. Styling passed to `TopNavMegaMenuItem` through `xstyle`, `className`, or `style` now renders too.

### Standalone filter editors no longer save on open

`PowerSearchFilterEditor` no longer calls `onSave` when it opens on an already-complete empty-operator filter such as “is empty.” If you relied on that behavior, call `onSave` when you open the editor, or skip opening it for empty-operator filters as PowerSearch now does. No codemod can choose the right save moment for your app.

### Banner announcements become explicit

`Banner.status` no longer chooses a live-region role. Call `useAnnounce` from the async action that needs an announcement, or set `role="status"` on another persistent element that carries the same message. Warning and error banners use `role="alert"` only when you choose it. This decision needs manual review; there is no codemod.

### CLI errors and results are now explicit

- Replace `astryx layout expand`, `astryx layout check`, and `astryx layout grammar` with `astryx build` to choose a template, `astryx template` to scaffold it, and `astryx docs layout` for layout guidance. The matching programmatic exports and response types are also removed.
- Pass a valid type or package, an integer limit, and the documented positional arguments where a command asks for them. A component name found in multiple packages now returns `ERR_AMBIGUOUS_COMPONENT` instead of choosing silently.
- Do not combine list-only or removal modes with options for a different action. `template --list`, `template --cdn`, `upgrade --list`, `init --remove-agents`, `init --all`, and `gap-report --list-categories` now reject conflicting input instead of ignoring it.
- Run `doctor integration validate` in a directory with a `package.json`, or handle status 1 for the no-package case. A package with no integration manifest still exits successfully.
- Remove an empty-string positional argument from a CLI invocation; omit the argument when the documented operation is to list entries.
- A consumer of `init --remove-agents` should treat `data.removed` as a boolean: it is `false` when there was nothing to remove instead of always being the literal `true`.
- Replace `ASTRYX_AGENT_ID` and `ASTRYX_AGENT_SESSION_ID` with `AGENT` and `AGENT_SESSION_ID`. `ASTRYX_AGENT_METADATA` has no replacement.
- `theme build` now exits with status 1 when it reports private `--_*` variables. Fix those inputs instead of relying on the previous successful exit status.

## Thank you

Thanks to the contributors behind v0.6.1 through v0.7.0: [@AKnassa](https://github.com/AKnassa), [@aldentan](https://github.com/aldentan), [@andrskr](https://github.com/andrskr), [@athz](https://github.com/athz), [@bhamodi](https://github.com/bhamodi), [@cixzhang](https://github.com/cixzhang), [@Cypher-Aura-19](https://github.com/Cypher-Aura-19), [@ejhammond](https://github.com/ejhammond), [@ernestt](https://github.com/ernestt), [@freddymeta](https://github.com/freddymeta), [@fullstackhacker](https://github.com/fullstackhacker), [@Geervan](https://github.com/Geervan), [@Han5991](https://github.com/Han5991), [@harjothkhara](https://github.com/harjothkhara), [@HelloOjasMutreja](https://github.com/HelloOjasMutreja), [@humbertovirtudes](https://github.com/humbertovirtudes), [@imdreamrunner](https://github.com/imdreamrunner), [@jiunshinn](https://github.com/jiunshinn), [@josephfarina](https://github.com/josephfarina), [@kentonquatman](https://github.com/kentonquatman), [@korkt-kim](https://github.com/korkt-kim), [@ksying](https://github.com/ksying), [@kyu-rong](https://github.com/kyu-rong), [@Kyujenius](https://github.com/Kyujenius), [@Lee-Dongwook](https://github.com/Lee-Dongwook), [@light-merlin-dark](https://github.com/light-merlin-dark), [@ManoharPaturi](https://github.com/ManoharPaturi), [@markselby9](https://github.com/markselby9), [@nynexman4464](https://github.com/nynexman4464), [@oliprovscode](https://github.com/oliprovscode), [@rubyycheung](https://github.com/rubyycheung), [@rupesh-kumar-sah](https://github.com/rupesh-kumar-sah), [@thedjpetersen](https://github.com/thedjpetersen), and [@vjeux](https://github.com/vjeux).

Read the complete package-by-package notes on the [Astryx v0.7.0 release page](https://github.com/facebook/astryx/releases/tag/v0.7.0).
