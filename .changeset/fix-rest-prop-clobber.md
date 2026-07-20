---
'@astryxdesign/core': patch
---

[fix] Fix consumer rest props clobbering component contract props in ButtonGroup, Calendar, and Carousel

Components that set `role`, `aria-roledescription`, or `onKeyDown` on their root element now spread `{...rest}` before those props so a consumer cannot accidentally override the component's semantic contract. `onKeyDown` is composed via `composeEventHandlers` so both the consumer's and the component's handlers fire.
@cixzhang
