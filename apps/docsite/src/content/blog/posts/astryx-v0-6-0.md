---
title: 'Astryx v0.6.0: adaptive themes, responsive menus, and safer migrations'
description: 'Everything since 0.5.0: environmental theme adaptations, bottom-sheet and adaptive menus, native date and time pickers, richer component APIs, and codemods for the 0.6 breaking changes.'
date: '2026-09-10'
type: 'update'
authors:
  - 'team'
tags:
  - 'Release'
  - 'Theming'
  - 'Accessibility'
  - 'CLI'
---

Astryx v0.6.0 is out, gathering the five releases since 0.5.0.

```bash
npm i @astryxdesign/core@0.6.0
npx astryx upgrade --from <your-version> --apply
```

Every stable `@astryxdesign/*` package ships at `0.6.0`. Upgrade Core and any Astryx theme packages together.

## Migrate to 0.6.0

The upgrade command handles the API changes it can prove safe:

- removes explicit `isRtl` options from focus hooks;
- moves `isImeKeyEvent` imports to `@astryxdesign/core/utils`;
- renames Resizable `minSizePx` and `maxSizePx` to `minSize` and `maxSize`; and
- migrates known Astryx CSS selectors from bare prop and state classes to the reflected `data-*` contract.

Astryx 0.6 stops emitting bare classes such as `.primary`, `.sm`, and `.checked`. Stable target classes such as `.astryx-button` remain. For a known selector, the codemod preserves the old class arm alongside the new attribute so consumer-supplied classes keep matching:

```css
.astryx-button.primary
/* becomes */
.astryx-button:is(.primary, [data-variant='primary'])
```

The transform intentionally leaves unqualified classes, unknown targets, and selectors inside JavaScript or TypeScript alone. Review those manually. If you ship a prebuilt custom theme, run `astryx theme build <theme-file>` again and deploy its generated CSS, JavaScript, and declarations together.

Stepper has two source-level changes. `horizontalOptions.minimumStepWidth` is now a pixel number, and `registerStep` takes an optional `{getIsDisabled}` object instead of a boolean. The exported context keeps transition history and step registration; compact-layout measurement and coordination stay internal.

## Themes can adapt to their environment

`defineTheme` can now apply ordered rules for named widths, pointer precision, contrast preference, and motion preference:

```ts
defineTheme({
  name: 'acme',
  adaptations: {
    widthBreakpoints: {sm: 640, md: 768, lg: 1024},
    rules: [
      {
        when: {width: {from: 'lg'}, pointer: 'coarse'},
        value: {tokens: {'--size-element-md': '44px'}},
      },
    ],
  },
});
```

Conditions in one rule are ANDed, and later matching rules win. Theme extension preserves the breakpoint map and inherited rule order. `AppShell` also accepts `xl` and `2xl` for `mobileNav.breakpoint`, using the same theme-owned width map.

Maintained theme families can define local tokens without adding them to Core's global contract. Neutral now includes a reproducible OKLCH palette workflow and named solid black and white values. New targets reach Banner's painted frame and description, Stepper labels and descriptions, Checkbox and Switch labels, TextArea's control and counter, and Spinner geometry.

## Menus and inputs fit the device

DropdownMenu, MoreMenu, ContextMenu, Selector, and MultiSelector can render as an anchored popover, modal bottom sheet, or compact-touch `adaptive` presentation. The data and actions stay the same while the host chooses the surface.

DateInput, DateTimeInput, and TimeInput can use browser and OS pickers on coarse pointers. Astryx keeps its own surface when a workflow needs seconds, custom increments, or preset options. Selector and MultiSelector also gain announced empty states and `isReadOnly`, so a selected value can remain focusable and form-submittable without exposing editing controls.

Stepper now collapses from its own container width rather than the viewport. A flow can keep its compact label and controls, keep only the label, or let surrounding UI own both. TabList can bleed to a padded container's inline edges, and Layout keeps scrollbars at the content area's outer edge when `contentWidth` is set.

## Accessibility and interaction fixes

Rich labels and descriptions on CheckboxListItem and RadioListItem now produce the correct accessible name and description. TextInput and TextArea forward `autoComplete`. ChatComposerInput keeps multiline history navigation at text boundaries and removes `aria-multiline` when trigger menus make it a combobox.

Popover focus and same-gesture reopen protection now apply through every opening path. SideNavItem preserves a consumer-provided `aria-label`. Focus traps restore focus only when focus actually entered the trap. Hover-highlighted option lists no longer auto-scroll repeatedly under a stationary pointer, and Carousel's edge fades mirror under RTL.

## A CLI that explains what it did

CLI integrations can add managed agent guidance, and `doctor integration` checks their structure and collisions. Debug records now fill `resultCount`, `emptyResult`, `resultKind`, and `directMatch` across the command tree. Their `schemaVersion` is now `3`, so consumers can distinguish commands that returned no results from commands that never reached an answer.

New templates cover checkout, dialog, form, inline, and vertical wizards, plus work-item detail pages. `withAstryx()` now refuses a Turbopack configuration instead of completing a build whose package source and generated styles cannot agree.

## Thank you

Thanks to everyone who contributed across 0.5.1 through 0.6.0: [@AKnassa](https://github.com/AKnassa), [@Astro-Han](https://github.com/Astro-Han), [@bhamodi](https://github.com/bhamodi), [@cixzhang](https://github.com/cixzhang), [@ernestt](https://github.com/ernestt), [@faga295](https://github.com/faga295), [@freddymeta](https://github.com/freddymeta), [@Geervan](https://github.com/Geervan), [@gonzoblasco](https://github.com/gonzoblasco), [@harjothkhara](https://github.com/harjothkhara), [@Hashim1999164](https://github.com/Hashim1999164), [@HelloOjasMutreja](https://github.com/HelloOjasMutreja), [@imdreamrunner](https://github.com/imdreamrunner), [@jiunshinn](https://github.com/jiunshinn), [@joaodotwork](https://github.com/joaodotwork), [@josephfarina](https://github.com/josephfarina), [@kentonquatman](https://github.com/kentonquatman), [@Kyujenius](https://github.com/Kyujenius), [@Lee-Dongwook](https://github.com/Lee-Dongwook), [@lexs](https://github.com/lexs), [@ManoharPaturi](https://github.com/ManoharPaturi), [@mattandryc](https://github.com/mattandryc), [@ngolin](https://github.com/ngolin), [@nynexman4464](https://github.com/nynexman4464), [@PRIEYAN](https://github.com/PRIEYAN), [@rubyycheung](https://github.com/rubyycheung), [@trakshan-mishra](https://github.com/trakshan-mishra), and [@yyq1025](https://github.com/yyq1025).

Read the complete package-by-package notes on the [Astryx v0.6.0 release page](https://github.com/facebook/astryx/releases/tag/v0.6.0).
