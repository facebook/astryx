---
title: 'Astryx v0.7.0: queryable docs, predictable CLI contracts, and extensible Markdown'
description: 'Typed documentation and theme migrations, safer machine-readable CLI contracts, new Markdown extension points, reusable scrolling primitives, and stronger integration tooling.'
date: '2026-09-26'
type: 'update'
authors:
  - 'team'
tags:
  - 'Release'
  - 'Components'
  - 'Documentation'
  - 'Theming'
draft: true
---

Astryx v0.7.0 brings more useful building blocks for rich content, long-running interfaces, and packages that extend the design system. It also makes documentation cheaper to query: tools and agents can ask for a topic’s section index or read one section instead of loading the whole topic.

Record the version you use today, update every stable Astryx package in your project to `0.7.0`, then run the installed CLI’s upgrade:

```bash
OLD_VERSION=0.6.3 # replace with the Core version your project uses today
npm i @astryxdesign/core@0.7.0 @astryxdesign/cli@0.7.0 @astryxdesign/theme-neutral@0.7.0
npx @astryxdesign/cli upgrade --from "$OLD_VERSION" --apply
```

The example includes Neutral; update any other stable Astryx themes your project uses in the same install step.

## Two migrations for typed authoring contracts

Documentation authoring types add four cases. Exhaustive `AuthoredDocKind` switches must handle `namespace`; exhaustive `ReferenceContentBlock` switches must handle `workflow`, `collection`, and `reference`. Existing authored documents continue to parse unchanged, but this TypeScript migration is not handled by a codemod.

Integration themes now use a typed, same-stem `<name>Theme.doc.mjs` descriptor beside each theme instead of a central `themes/manifest.json` catalog. Run the upgrade command above from each integration package: the codemod writes descriptors from existing catalog entries and removes the catalog. Apps will not discover an integration package’s themes or doc topics until that package is migrated.

## Extend Markdown without replacing it

Markdown now has typed extension points for product-specific syntax and rendering. Plugins can add opt-in math, frontmatter, text transforms, semantic code-fence data, and non-visual source decorations while keeping the default parser and accessible rendering behavior.

Server code can use the same canonical tree through the parser entry points. Teams that already use a compatible synchronous Remark transform can connect it through a bounded adapter rather than adopting a second Markdown pipeline. Escaped pipes inside table-cell code spans now render as literal `|` characters instead of exposing the structural backslash.

## Scroll and measure without rebuilding the primitive

The new `ScrollableArea` component and `useScrollableArea` hook provide logical-axis native scrolling, edge state, conditional keyboard access, and explicit overscroll behavior. A fitting viewport stays out of the tab order; an overflowing viewport becomes reachable, and writing modes keep their logical start and end semantics.

The new `Timer` component standardizes elapsed durations for active operations. It supports elapsed and clock formats, can start from an earlier Unix-millisecond timestamp, and updates its DOM text without causing a React render for every tick.

## Themes reach the surface they mean to change

Themes gained additional stable targets for Dialog headers, sliders, file inputs, and chat scrolling. Theme-local tokens no longer need a prefix, and generated theme CSS applies the body font at the theme scope root so components that inherit typography receive the intended face.

Theme compilation also fails more locally: an unsafe declaration is dropped and reported without discarding valid values or the rest of the theme. Legacy selectors and aliases remain available in this release.

## Author integrations with fewer hidden contracts

Installed integrations can be discovered even when a project configuration does not name them. Package authors can add components, templates, reference docs, codemods, themes, and agent guidance, then use `integration pack --check` to verify the packed artifact consumers will install.

Generated integration imports now use extensionless public subpaths. Codemod discovery ignores colocated tests and fixtures, authoring types work in NodeNext projects without requiring Node’s type package, and every first-party theme now ships the same typed descriptor shape integration authors use.

Documentation reads use one compiled topic model. Run `astryx docs <topic> --index` to list stable section keys, then `astryx docs <topic> <key>` to read only the section you need. `astryx docs authoring` documents the supported schemas and also names graph features that are not implemented yet.

## A more predictable CLI contract

Commands now align their text, JSON envelopes, exit codes, flag precedence, and public response types more closely. JSON errors and successes consistently expose `apiVersion`; search, build, component, template, theme, upgrade, and integration commands document the fields and failure codes they actually return; and ambiguous or incompatible flags are refused instead of being interpreted differently across commands.

File-producing commands also keep their writes inside the project when paths or symlinks point elsewhere. Template, theme, swizzle, init, upgrade, and layout operations report stable path-safety and write failures before changing files. Packed build consumers receive the dependencies they need without reaching outside `@astryxdesign/build`’s declared boundary.

## Better starting points and steadier interactions

The Canvas Editor page template provides a layered artboard, resizable rails, a property inspector, and live object controls. The new Tree Table template combines hierarchical rows with table semantics. `List` can compensate its item inset against container padding with `edgeCompensation="inline"`, and the Toolbar Table Filter block now performs real filtering and folds its clauses as space narrows.

Across Core, pressed feedback now covers common controls, Markdown links follow the same blocked-scheme rule as other navigation paths, PowerSearch shows every `enum_list` value, Spinner avoids Safari’s rotating-stroke wobble, segmented controls stay content-sized in hug-layout flex containers, chat empty states preserve numeric zero, empty metadata slots no longer leave stray separators, and ChatLayout no longer leaves an invisible scroll button in keyboard navigation.

`ChatSendButton` now composes an accepted `onClick` handler with its send or stop action instead of letting that handler replace the action. Consumers that intentionally replaced sending through `onClick` should move that behavior to `onSend`.

## Thank you

Thanks to the contributors behind the changes since v0.6.0: [@aldentan](https://github.com/aldentan), [@andrskr](https://github.com/andrskr), [@athz](https://github.com/athz), [@bhamodi](https://github.com/bhamodi), [@cixzhang](https://github.com/cixzhang), [@Cypher-Aura-19](https://github.com/Cypher-Aura-19), [@ernestt](https://github.com/ernestt), [@freddymeta](https://github.com/freddymeta), [@fullstackhacker](https://github.com/fullstackhacker), [@Geervan](https://github.com/Geervan), [@Han5991](https://github.com/Han5991), [@harjothkhara](https://github.com/harjothkhara), [@HelloOjasMutreja](https://github.com/HelloOjasMutreja), [@jiunshinn](https://github.com/jiunshinn), [@josephfarina](https://github.com/josephfarina), [@kentonquatman](https://github.com/kentonquatman), [@korkt-kim](https://github.com/korkt-kim), [@ksying](https://github.com/ksying), [@kyu-rong](https://github.com/kyu-rong), [@ManoharPaturi](https://github.com/ManoharPaturi), [@nynexman4464](https://github.com/nynexman4464), [@oliprovscode](https://github.com/oliprovscode), [@rubyycheung](https://github.com/rubyycheung), [@rupesh-kumar-sah](https://github.com/rupesh-kumar-sah), and [@vjeux](https://github.com/vjeux).

Read the complete package-by-package notes on the [Astryx v0.7.0 release page](https://github.com/facebook/astryx/releases/tag/v0.7.0).
