---
title: 'Astryx v0.7.0: better mobile experiences, clearer inputs, and stronger foundations'
description: 'What shipped after v0.6.0: easier forms, stronger mobile behavior, composable Markdown, better data display, clearer CLI integrations, and guided migrations.'
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

Astryx v0.7.0 brings together everything shipped from v0.6.1 through v0.6.8 and the final changes for this minor. The release improves the experiences people touch most—forms, mobile layouts, menus, Markdown, and tables—while making theme and CLI behavior more predictable.

## Forms and inputs

Forms now keep caller IDs, descriptions, event handlers, and test hooks on the control that people actually use. Empty states, controlled clearing, IME input, and async picker feedback are also more reliable across the input family.

```tsx
<TextInput
  label="Project name"
  value={name}
  onChange={setName}
  controlXstyle={styles.projectName}
/>

<Typeahead
  label="Assignee"
  searchSource={peopleSource}
  value={assignee}
  onChange={setAssignee}
  containerXstyle={styles.assigneeField}
  emptySearchText="No people found"
/>
```

**Pending merge — [#7289](https://github.com/facebook/astryx/pull/7289):** `emptySearchResultsText` is removed in favor of `emptySearchText`; the upgrade command handles direct component and trigger-object uses.

<!-- VISUAL_SLOT: forms-and-inputs — one shipped feature per image; behavior as GIF/WebP, visual changes as labeled Before/After -->

## Menus and overlays

Menus can place real controls beside their rows without weakening menu semantics, while nested layers close in the order people see them. Dialog focus, Toast layering, and menu zoom behavior now hold up across keyboard, pointer, and touch use.

```tsx
<DropdownMenu
  button={{label: 'Labels'}}
  header={<TextInput label="Filter labels" value={query} onChange={setQuery} />}
  footer={<Button label="Create label" onClick={createLabel} />}
  items={labelActions}
/>
```

**Pending merge — [#6884](https://github.com/facebook/astryx/pull/6884):** BottomSheet will add comfortable content padding by default; `padding={0}` keeps the old edge-to-edge content box.

```tsx
<BottomSheet
  isOpen={isOpen}
  onOpenChange={setIsOpen}
  label="Filters"
  padding={0}>
  <CustomEdgeToEdgeFilters />
</BottomSheet>
```

<!-- VISUAL_SLOT: menus-and-overlays — BottomSheet drag/scroll, layer dismissal, menu header/footer, Toast over Dialog -->

## Mobile and touch

Phone layouts keep their state, respect pinch zoom, and make sheets, menus, swipe actions, and date/time pickers feel native to touch. AppShell keeps the same page mounted through its mobile breakpoint, and inputs avoid iOS focus zoom.

**Pending merge — [#6699](https://github.com/facebook/astryx/pull/6699):** Neutral, Chocolate, Butter, and Stone will use a 16px text base on narrow touch screens while keeping large display text at its desktop size.

<!-- VISUAL_SLOT: mobile-and-touch — behavioral changes as GIF/WebP; touch type scale as labeled Before/After -->

## Data display

Tables keep expanded content aligned, sticky and resizable columns usable, row actions working, and scrolling contained only when the table can actually scroll. Charts, MetadataList, TreeList, and Lightbox also gained smaller fixes that preserve meaning and layout in dense or narrow views.

<!-- VISUAL_SLOT: data-display — separate images for row expansion, column resize, sticky columns, and narrow scrolling -->

## Markdown and content

Markdown can now carry typed product semantics instead of stopping at formatted prose. Plugins cover frontmatter, math, source lines, text transforms, custom fences, heading links, and soft breaks while streaming content remains stable.

```tsx
import {Markdown} from '@astryxdesign/core/Markdown';
import {
  markdownSoftBreaksPlugin,
  markdownSourceLinesPlugin,
} from '@astryxdesign/core/Markdown/plugins';

<Markdown plugins={[markdownSoftBreaksPlugin, markdownSourceLinesPlugin]}>
  {releaseNotes}
</Markdown>;
```

<!-- VISUAL_SLOT: markdown-and-content — one shipped plugin per image; streaming behavior as GIF/WebP -->

## Themes and visual foundations

Themes now have clearer component names, shorter local token names, Vite-safe `light-dark()` output, and one public StyleX source for data colors. Reset styles reach the pseudo-elements they promised to cover, and generated first-party theme CSS is checked against its source.

```tsx
import * as stylex from '@stylexjs/stylex';
import {dataVars} from '@astryxdesign/core/theme/dataTokens.stylex';

const styles = stylex.create({
  series: {
    backgroundColor: dataVars['--color-data-categorical-blue'],
  },
});
```

**Pending merge — [#7359](https://github.com/facebook/astryx/pull/7359) and [#7374](https://github.com/facebook/astryx/pull/7374):** Core, Matcha, and Y2K spacing will follow the reader's root font size while staying pixel-equal at the default 16px root.

<!-- VISUAL_SLOT: themes-and-visual-foundations — real theme renders; visual changes as labeled Before/After -->

## Accessibility and localization

More status text, control labels, and empty states now speak the reader's language, and keyboard users can reach content that previously disappeared behind scrolling or focus transitions. Banners no longer infer announcements from color status, so apps announce the actual async event instead.

```tsx
const announce = useAnnounce();

async function saveSettings() {
  await save();
  announce('Settings saved');
}

<Banner status="success" title="Settings saved" />;
```

<!-- VISUAL_SLOT: accessibility-and-localization — focus/keyboard behavior as GIF/WebP; visual contrast as labeled Before/After -->

## CLI and integrations

Other libraries can now contribute components, docs, templates, upgrade scripts, coding guidance, and source themes through the same Astryx CLI an app already uses. CLI answers are shorter and more consistent, and failures identify the input or dependency that needs attention.

```bash
npx @astryxdesign/cli integration add component AcmeChart
npx @astryxdesign/cli integration verify
```

**Pending merge — [#7130](https://github.com/facebook/astryx/pull/7130):** `doctor` will fail when Astryx cannot load a configured integration or project config, and it will explain what it checked or skipped.

<!-- VISUAL_SLOT: cli-and-integrations — terminal captures only when they show shipped output not already stated in text -->

## Interaction and feedback

Pressed states, clear-button focus, swipe dismissal, menu gestures, and optimistic actions now respond more consistently without adding weight to apps that do not use them. Compact Toolbar rows also get a tighter inset without losing alignment.

**Pending merge — [#6954](https://github.com/facebook/astryx/pull/6954):** compact Toolbar and RichText formatting rows will use the same 4px edge inset.

<!-- VISUAL_SLOT: interaction-and-feedback — behavior as GIF/WebP; compact Toolbar as labeled Before/After -->

## Upgrading to 0.7.0

Update every stable Astryx package your project uses to `0.7.0`, then run the upgrade command. It applies the safe migrations and leaves a TODO where your code needs a decision.

```bash
OLD_VERSION=0.6.8 # replace with the Core version your project uses today
npm i @astryxdesign/core@0.7.0 @astryxdesign/cli@0.7.0 @astryxdesign/build@0.7.0 @astryxdesign/theme-neutral@0.7.0
npx @astryxdesign/cli upgrade --from "$OLD_VERSION" --apply --path .
```

The example includes Neutral; update every other stable Astryx theme in your project in the same install step.

### All 26 breaking migrations

1. **`theme add` now imports built themes** ([#7138](https://github.com/facebook/astryx/pull/7138)) — copy scripts move from `theme add <slug> <path>` to `theme eject <slug> <path>`; no codemod.
2. **Banner announcements are explicit** ([#6630](https://github.com/facebook/astryx/pull/6630)) — move from status-derived live regions to `useAnnounce()` in the async action or an explicit persistent role; no codemod.
3. **Previously ignored base props now work** ([#7331](https://github.com/facebook/astryx/pull/7331)) — remove props on Layout, MetadataList, NavHeadingMenuItem, or TopNavMegaMenuItem only if your code depended on them doing nothing; no codemod.
4. **Complete icon registries include Upload** ([#7329](https://github.com/facebook/astryx/pull/7329)) — add an `upload` entry to every custom `IconRegistry`; bespoke artwork has no codemod.
5. **`init --remove-agents` reports `removed: false`** ([#6623](https://github.com/facebook/astryx/pull/6623)) — read `data.removed` as a boolean instead of narrowing it to literal `true`; no codemod.
6. **Conflicting CLI options are refused** ([#7132](https://github.com/facebook/astryx/pull/7132)) — remove options that list-only or removal modes previously ignored; no codemod.
7. **Invalid CLI input no longer succeeds silently** ([#7149](https://github.com/facebook/astryx/pull/7149)) — pass valid types, packages, limits, and arguments, and handle `ERR_AMBIGUOUS_COMPONENT`; no codemod.
8. **Empty positional arguments are rejected** ([#6620](https://github.com/facebook/astryx/pull/6620)) — omit `""` when the intended operation is to list entries; no codemod.
9. **Integration validation needs a package** ([#7150](https://github.com/facebook/astryx/pull/7150)) — run `doctor integration validate` where `package.json` exists or handle exit 1; no codemod.
10. **Data-color defaults move to StyleX** ([#6834](https://github.com/facebook/astryx/pull/6834)) — import `dataVars` for CSS and rebuild committed theme CSS; `validate-data-token-ownership` reports unsafe variables and stale output without rewriting them.
11. **Date and time input styling targets the control** ([#7337](https://github.com/facebook/astryx/pull/7337)) — root styling becomes `controlXstyle`/`controlClassName`/`controlStyle`; `migrate-field-input-styling` rewrites direct Astryx JSX.
12. **Typeahead, Tokenizer, list, and Slider styling targets the field** ([#7339](https://github.com/facebook/astryx/pull/7339)) — root styling becomes `container*`, except Typeahead inside InputGroup uses `control*`; `migrate-field-input-styling` handles direct JSX.
13. **Selector styling targets the control** ([#7341](https://github.com/facebook/astryx/pull/7341)) — root styling becomes `control*`, while base props and refs reach the trigger; `migrate-field-input-styling` handles direct JSX.
14. **Text input styling targets the control** ([#7336](https://github.com/facebook/astryx/pull/7336)) — root styling becomes `control*`, and caller IDs reach the native input; `migrate-field-input-styling` handles direct JSX.
15. **Standalone filter editors do not save on open** ([#7347](https://github.com/facebook/astryx/pull/7347)) — save at the callsite that opens an already-complete empty-operator filter, or skip opening it; no codemod.
16. **Astryx-prefixed agent variables are removed** ([#7127](https://github.com/facebook/astryx/pull/7127)) — replace `ASTRYX_AGENT_ID` and `ASTRYX_AGENT_SESSION_ID` with `AGENT` and `AGENT_SESSION_ID`; metadata has no replacement and no codemod.
17. **Theme styling uses canonical names and data attributes** ([#7302](https://github.com/facebook/astryx/pull/7302)) — replace 21 old target aliases and bare state classes; `migrate-deprecated-theme-surface` rewrites known keys and selectors and marks ambiguous cases.
18. **The `layout` command group is removed** ([#7137](https://github.com/facebook/astryx/pull/7137)) — use `astryx build`, `astryx template`, and `astryx docs layout`; no codemod.
19. **`reset.css` reaches pseudo-elements and search fields** ([#7355](https://github.com/facebook/astryx/pull/7355)) — add your own later-layer `box-sizing`, border, placeholder color, or search appearance only when you need the old browser result; no codemod.
20. **Private theme variables fail the build** ([#6872](https://github.com/facebook/astryx/pull/6872)) — fix every reported private `--_*` input instead of relying on exit 0; no codemod.
21. **BottomSheet adds default content padding** (pending [#6884](https://github.com/facebook/astryx/pull/6884)) — remove duplicate caller padding or pass `padding={0}` for the old box; `preserve-bottom-sheet-content-padding` adds the safe opt-out.
22. **Phone typography starts at 16px** (pending [#6699](https://github.com/facebook/astryx/pull/6699)) — take the new Neutral, Chocolate, Butter, and Stone scale as-is, or add a later touch-and-narrow theme rule to preserve 14px; no codemod.
23. **`emptySearchResultsText` is removed** (pending [#7289](https://github.com/facebook/astryx/pull/7289)) — rename it to `emptySearchText`; `rename-empty-search-results-text` handles supported components and static trigger objects.
24. **Core spacing follows the root font size** (pending [#7359](https://github.com/facebook/astryx/pull/7359)) — CSS variable users need no change; code that parses px converts rem with the root size or reads the computed length; no codemod.
25. **Matcha and Y2K spacing follows the root font size** (pending [#7374](https://github.com/facebook/astryx/pull/7374)) — take the byte-equal default result, or override the spacing tokens in px to keep fixed sizing; no codemod.
26. **Doctor fails on unloadable configured projects** (pending [#7130](https://github.com/facebook/astryx/pull/7130)) — install or repair the named integration, remove it from config, or fix the config field in the error; no codemod.

## Thank you

Thanks to the contributors behind v0.6.1 through v0.7.0: [@AKnassa](https://github.com/AKnassa), [@aldentan](https://github.com/aldentan), [@andrskr](https://github.com/andrskr), [@athz](https://github.com/athz), [@bhamodi](https://github.com/bhamodi), [@cixzhang](https://github.com/cixzhang), [@Cypher-Aura-19](https://github.com/Cypher-Aura-19), [@ejhammond](https://github.com/ejhammond), [@ernestt](https://github.com/ernestt), [@freddymeta](https://github.com/freddymeta), [@fullstackhacker](https://github.com/fullstackhacker), [@Geervan](https://github.com/Geervan), [@Han5991](https://github.com/Han5991), [@harjothkhara](https://github.com/harjothkhara), [@HelloOjasMutreja](https://github.com/HelloOjasMutreja), [@humbertovirtudes](https://github.com/humbertovirtudes), [@imdreamrunner](https://github.com/imdreamrunner), [@jiunshinn](https://github.com/jiunshinn), [@josephfarina](https://github.com/josephfarina), [@kentonquatman](https://github.com/kentonquatman), [@korkt-kim](https://github.com/korkt-kim), [@ksying](https://github.com/ksying), [@kyu-rong](https://github.com/kyu-rong), [@Kyujenius](https://github.com/Kyujenius), [@Lee-Dongwook](https://github.com/Lee-Dongwook), [@light-merlin-dark](https://github.com/light-merlin-dark), [@ManoharPaturi](https://github.com/ManoharPaturi), [@markselby9](https://github.com/markselby9), [@nynexman4464](https://github.com/nynexman4464), [@oliprovscode](https://github.com/oliprovscode), [@rubyycheung](https://github.com/rubyycheung), [@rupesh-kumar-sah](https://github.com/rupesh-kumar-sah), [@thedjpetersen](https://github.com/thedjpetersen), and [@vjeux](https://github.com/vjeux).

Read the complete package-by-package notes on the [Astryx v0.7.0 release page](https://github.com/facebook/astryx/releases/tag/v0.7.0).
