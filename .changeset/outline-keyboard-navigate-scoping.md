---
'@astryxdesign/core': patch
---

[feat] Outline: keyboard navigation, navigate callbacks, and scroll-scoping props (#2527)

Layers the public API deferred out of #2746 onto the scroll-spy engine and click-lock that already shipped. No visual change.

- **Keyboard navigation** — the outline is now a single tab stop (roving tabindex via `useListFocus`), seated on the _active_ heading per WAI-ARIA, so tabbing into a table of contents while reading section 7 lands on section 7 rather than sending the reader back to section 1. Arrow keys move between headings, Home/End jump to the ends, and Enter/Space activate. A 40-heading table of contents costs one Tab press instead of 40, and Tab still leaves the outline in one press.
- **`onNavigateStart(id)` / `onNavigateEnd(id)`** — fire around the smooth scroll started by a click or keyboard activation, so an app can drive an arrival effect. `onNavigateEnd` resolves on `scrollend` where supported and on a settle timeout where it is not (Safari), so it also fires correctly when reduced motion collapses the scroll into an instant jump. It fires exactly once for every `onNavigateStart` — including when the user interrupts the scroll — so a "navigating" state can never leak.
- **`offset`** — the height of a fixed header overlaying the top of the scroll root. It shifts both the activation line **and** the scroll landing by the same amount, so a heading activates exactly where navigating to it puts it: below the header, not hidden underneath it. It composes with each heading's own `scroll-margin-top` (the header, then the breathing room below it) rather than replacing it — leave `offset` at 0 when nothing overlays the content and let `scroll-margin-top` do the work, since the browser already honors it.
- **`scrollContainerRef`** — scope scroll tracking to a specific container instead of auto-detecting the nearest scrollable ancestor. Fixes the table of contents whose highlight never moves inside a split pane, modal, or dashboard panel. The default (viewport) path is unchanged.
- **`hasScrollOnClick`** (default `true`) — set to `false` to own the scrolling yourself; the outline still updates the active item, the hash, and the navigate callbacks.

Clicking an outline item whose heading is not in the DOM (lazily-rendered or virtualized content) still falls through to the browser's native fragment navigation, as before — the link is never swallowed into a no-op.

Existing props (`items`, `activeId`, `onActiveIdChange`, `label`, `density`) and the `parseOutlineFromMarkdown` / `useOutlineFromMarkdown` / `useOutlineFromDOM` helpers are unchanged.
@AKnassa
