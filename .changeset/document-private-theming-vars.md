---
'@astryxdesign/core': patch
---

[docs] Ten private (`--_*`) component theming vars are now documented in their owning component's `theming.vars[]`: `--_avatar-group-overlap`, `--_card-elevation`, `--_card-ring`, `--_codeblock-gutter-width`, `--_item-label-color`, `--_item-description-color`, `--_tab-indicator-bottom`, `--_tree-indent` (plus `--_dropdown-menu-radius`/`--_dropdown-menu-padding`, which Breadcrumbs sets on a child menu). They were declared in source and described nowhere, because the drift guard skipped the `--_` prefix outright.

@cixzhang
