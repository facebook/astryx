---
'@astryxdesign/core': patch
---

[fix] Make `HoverCard` SSR-hydration-safe. When rendered inside a Server-Side
Rendered framework (e.g. Next.js App Router), `HoverCard` emitted its portaled
popover layer on the first client render even though the server could not
render a portal, producing markup the server never sent and triggering a React
hydration mismatch. The portal is now deferred until after hydration so the
server output and the first client render match. `useLayer` records open intent
even when the popover element has not mounted yet and replays the open once it
attaches, so `isDefaultOpen` still opens the card after hydration.

@ShanHuangNet
