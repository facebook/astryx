---
'@astryxdesign/theme-butter': minor
'@astryxdesign/theme-chocolate': minor
'@astryxdesign/theme-neutral': minor
'@astryxdesign/theme-stone': minor
'@astryxdesign/cli': minor
---

[breaking] On touch devices narrower than the `lg` breakpoint (`(width < 1024px) and (pointer: coarse)`), the 14px-base first-party themes now floor their type base to 16px and re-derive the ratio so Display 1 keeps its desktop size: neutral and chocolate (base 14, ratio 1.2 → 1.1736) and butter and stone (base 14, ratio 1.25 → 1.2225). Body, label and code text rise from 14px to 16px on phones and the display tier no longer grows; desktop sizes are unchanged. gothic, matcha and y2k already use a 16px base and need no rule. The CLI's theme templates carry the same rule, so a newly scaffolded theme gets it too.

Migration: nothing to change to take the new phone scale. To keep the previous 14px phone scale in an app, extend the theme and append a later rule for the same condition, which wins by order: `defineTheme({name: 'app', extends: neutralTheme, adaptations: {rules: [{when: {pointer: 'coarse', width: {below: 'lg'}}, value: {typography: {scale: {base: 14, ratio: 1.2}}}}]}})` (butter and stone: `ratio: 1.25`). A theme that already sets its own touch-and-narrow typography rule keeps it. This cannot be rewritten by a codemod: whether an app wants the floor is a product choice.

@imdreamrunner
