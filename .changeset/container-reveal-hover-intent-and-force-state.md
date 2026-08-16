---
'@astryxdesign/core': patch
---

[feat] `useContainerReveal`: two ways to control the reveal without reaching into the hook's private custom properties. `getContainerProps({hoverDelay})` gates the reveal on pointer dwell — the hover-intent idea Tooltip and HoverCard already have as `delay` — so a cursor sweeping down a list no longer lights up every row it grazes, and `getContainerProps({forceState})` pins the container's trigger state when something else owns the interaction (a scroll, a drag, an open row menu). Per element, `getContentRevealProps({forceVisibility})` pins how one child looks regardless of its container. Still CSS-only: no hover state in React, no re-render. Keyboard and touch are untouched — focus always reveals, `forceState: 'inactive'` and `forceVisibility: 'hidden'` both yield to `:focus-within`.

@cixzhang
