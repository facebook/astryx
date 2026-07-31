---
'@astryxdesign/core': patch
---

[feat] Add `useContainerReveal` — a headless hook for revealing (or concealing) content when its container is hovered or focused. CSS-driven (no hover state in JS, no re-render on hover) and accessible by construction: revealed content stays in the accessibility tree and tab order, reveals on keyboard focus-within, and stays visible on touch. Callers spread `getContainerProps()` on the container and `getContentRevealProps()` on each child; no StyleX authoring required. `Thumbnail`'s `showRemoveOn="hover"` now uses this hook internally (no API change).

@cixzhang
