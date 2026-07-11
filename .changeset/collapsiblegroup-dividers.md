---
'@astryxdesign/core': patch
---

[feat] CollapsibleGroup: add `dividers` prop (`'between' | 'all' | 'none'`, default `'none'`) so FAQ-style accordions get built-in row hairlines instead of hand-rolled borders, plus a `density` prop (`'compact' | 'balanced' | 'spacious'`) controlling row padding. When dividers are enabled the group renders a wrapper div (`astryx-collapsible-group`, with `data-dividers`/`data-density` reflection) that anchors the outer borders and items default to `'balanced'` density; without dividers the group keeps its DOM-less contract and existing renders are unchanged. Borders use the themed `--border-width`/`--color-border` tokens, and nested collapsibles never inherit row chrome (#3487).
@AKnassa
