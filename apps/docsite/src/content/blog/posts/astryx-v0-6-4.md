---
title: 'Astryx v0.6.4: extensible Markdown, safer authoring, and reliable layouts'
description: 'The complete v0.6 update adds Markdown plugins, stronger accessibility and layout behavior, typed integration authoring, and safer build tooling.'
date: '2026-10-01'
type: 'update'
authors:
  - 'team'
tags:
  - 'Release'
  - 'Accessibility'
  - 'Components'
---

Astryx v0.6.4 completes the v0.6 line, covering v0.6.1 through v0.6.4. Install matching versions of every Astryx package:

```bash
npm i @astryxdesign/core@0.6.4
```

Then apply the bundled migrations in your project:

```bash
npx astryx upgrade --apply
```

## Highlights

### Extend Markdown without replacing its parser

Markdown now has a typed plugin protocol for syntax, immutable transforms, and custom renderers. First-party helpers cover frontmatter, math, soft breaks, code fences, text transforms, and source decorations, while the Remark adapter supports bounded synchronous transforms. Tables keep readable columns in narrow surfaces, task and mixed lists retain their structure, and lazy list or blockquote continuations stay inside their container.

### Forms and navigation expose the right state

Input, picker, menu, and chat fixes keep names, disabled or read-only state, keyboard focus, and live announcements available to assistive technology. Bottom sheets delegate focus only when their scroll body needs it; menus and layers restore focus more predictably; and selectors, checkboxes, clear buttons, progress marks, and chat controls expose the state users actually interact with.

### Data-heavy layouts hold together

Table gains tree-grid navigation, selection-aware bulk actions, row expansion, sticky-header support, and clearer resize behavior. Narrow tables retain readable column floors and one owned scroll region. Lists, metadata rows, segmented controls, fields, cards, buttons, and chat layouts now yield correctly to constrained flex and grid containers instead of overflowing them.

### Integrations and docs are typed, discoverable, and safer

The CLI reads documentation as a typed tree with section-level search, stable provider identities, links, and reusable reference blocks. Integration themes move from a central catalog to same-stem typed descriptors, and authoring checks verify components, templates, docs, exports, and codemods before packing. File-writing commands now fail closed on symlink escapes and report stable error codes.

### Themes and builds match what ships

The Tailwind bridge is reference-only, so utilities follow the active theme without emitting competing declarations. Generated themes establish the body font, preserve valid authored CSS while dropping unsafe declarations, and expose more component targets. Core CSS uses supported longhand resets so borders and backgrounds survive StyleX compilation, and source builds fail closed when required StyleX output is missing.

### More complete starting points

New and refreshed page templates cover tree tables, model comparison, Canvas editing, collapsible tables, and ScrollableArea patterns. `astryx build "<idea>"` now recommends a concrete page template and scaffold command instead of making each project reconstruct the frame and spacing from components.

## Thank you

Thanks to everyone who contributed across v0.6.1 through v0.6.4. The complete contributor list and package-by-package details are on the [v0.6.4 release page](https://github.com/facebook/astryx/releases/tag/v0.6.4).
