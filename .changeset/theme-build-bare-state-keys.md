---
'@astryxdesign/cli': patch
---

[fix] theme build: stop flagging bare state keys as unknown props. A component-override rule key like `selected` or `checked` is a state, not a `prop:value` pair — core's `parseStyleKey` emits it directly as a state class, and doc targets declare states separately from `visualProps` (`ThemingTarget.states`). The validator now checks only `prop:value` segments, so the shipped butter theme's `selected` override on `top-nav-item` no longer draws a false "Unknown prop" warning. (#4110)

@AKnassa
