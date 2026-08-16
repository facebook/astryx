---
'@astryxdesign/core': patch
'@astryxdesign/theme-neutral': patch
---

[fix] Banner: a dismissed banner no longer drops focus, a custom status no longer loses its ARIA role, and the info banner paints again under the neutral theme.

Dismissing unmounted the focused dismiss button, so focus landed on `<body>` and a keyboard user lost their place in the page. Banner now records where focus entered from and returns it there, the same handoff `ToastViewport` makes for a dismissed toast. Measured in Chromium: `document.activeElement` was `BODY`, and is now the control the user tabbed in from.

`BannerStatusMap` is documented as augmentable, but all four status lookups were closed `Record<BannerStatus, ...>` maps. Adding the augmentation the docs show produced four TypeScript errors inside `Banner.tsx` itself, which a consumer cannot fix, and at runtime an unknown status resolved to `undefined` for its icon, its background and its ARIA role, so the banner stopped being a live region at all. The lookups are partial now: an unrecognized status renders with no status fill, no default glyph and `role="status"`.

A theme could not reach the banner's radius. `--_banner-radius` was declared in the doc file and in `derivedVarRegistry.ts`, but no rule read it, so a theme's `borderRadius` on the `banner` target expanded into a variable nothing consumed. The four card-silhouette radii read it now, falling back to `--radius-container`.

Under `@astryxdesign/theme-neutral` the info banner had no background at all, light or dark: the override set `background-color` directly and forced `--color-accent-muted` to `transparent`, and a plain CSS property written by a theme lands in `@layer astryx-theme`, which StyleX's `@layer priority4` outranks. Info now goes through `--color-accent-muted` like the other three statuses and like the stone theme already did.

Also in this change: `children={false}` (the ordinary `{cond && <ul/>}` idiom) no longer produces an expand toggle that opens an empty box, and `description=""` no longer leaves an empty 20px row, both via `isRenderable`; a long unbroken word in the title or description no longer forces the page into horizontal scrolling at a 320px viewport, measured at `document.scrollWidth` 529px before; and the content area's bottom border uses logical `border-block-end` alongside its inline siblings.

@cixzhang
