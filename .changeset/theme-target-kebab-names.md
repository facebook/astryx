---
'@astryxdesign/core': patch
---

[fix] Seven theme target roots that ran a compound component name together are deprecated onto the `<component-kebab>-<part>` spelling the component's name implies: `codeblock` → `code-block` (with `-copy-button`, `-header`, `-title`), `progressbar` → `progress-bar` (with `-fill`, `-mark`, `-track`), `hovercard` → `hover-card`, `statusdot` → `status-dot`, `textarea` → `text-area`, `navicon` → `nav-icon`, and Table's second root `base-table` → `table` (both named the same `<table>` element). A `defineTheme` key that matches no target fails silently — no error, no warning, the rule never emits — so someone who read `ProgressBar` and wrote `'progress-bar'` got nothing and no explanation. Nothing breaks: every component renders both classes and both keys resolve, including the derived vars a renamed key expands into. The old spellings drop in the next major.

@cixzhang
