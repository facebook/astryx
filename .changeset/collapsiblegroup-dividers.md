---
'@astryxdesign/core': patch
---

[feat] CollapsibleGroup: add a `hasDividers` prop (boolean, default `false`) so FAQ-style accordions get built-in row hairlines instead of hand-rolled borders, plus a `density` prop (`'compact' | 'balanced' | 'spacious'`) controlling row padding. When dividers are enabled the group renders a wrapper div (`astryx-collapsible-group`) and items default to `'balanced'` density; without dividers the group keeps its DOM-less contract and existing renders are unchanged. Borders use the themed `--border-width`/`--color-border` tokens, and nested collapsibles never inherit row chrome (#3487).
@AKnassa
