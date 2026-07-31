---
'@astryxdesign/cli': patch
---

[fix] theme build: cover every documented core theming target in the component-override registry (53 keys grew to 196), with each key's visual props mirroring the doc target entry verbatim, and stop flagging bare state keys like `selected` as unknown props. Overrides of real rendered targets such as `top-nav-heading`, `progressbar-track`, or `field-status` no longer draw false "Unknown component" / "Unknown prop" warnings with misleading did-you-mean hints; the shipped butter and stone themes now validate clean. (#4110)

@AKnassa
