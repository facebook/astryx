---
'@astryxdesign/core': patch
---

[docs] Eleven private (`--_*`) component theming vars are now documented in their owning component's `theming.vars[]`: `--_avatar-group-overlap`, `--_card-elevation`, `--_card-ring`, `--_codeblock-gutter-width`, `--_tab-indicator-bottom`, `--_textarea-inline-padding`, `--_tree-indent`, `--_tree-focus-outline`, `--_tree-focus-outline-offset` (plus `--_dropdown-menu-radius`/`--_dropdown-menu-padding`, which Breadcrumbs sets on a child menu). They were declared in source and described nowhere, because the drift guard skipped the `--_` prefix outright.

@cixzhang
