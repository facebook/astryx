---
'@astryxdesign/core': patch
---

[fix] Layer: use an inert `<template>` marker to find each context layer's actual JSX position. Safe positions stay inline; positions inside a paragraph, link, button, inline formatting, or a structurally restricted container portal to the nearest safe ancestor. Corrective portals copy inherited CSS custom properties, direction, and writing mode, and `show()` passes the trigger as the popover's invoker `source`. The new `lazyMount` option waits until opening to resolve and mount content; HoverCard uses it so rich content never enters an invalid paragraph during initial render and unmounts again when hidden. Other context layers keep their existing closed-content behavior.
@cixzhang
