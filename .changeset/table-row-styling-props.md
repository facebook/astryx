---
'@astryxdesign/core': patch
---

[fix] TableRow: honor `className` and `style` on the `<tr>`. `TableRowProps` extends `BaseProps`, but both were spread before `mergeProps()` and then overwritten by the component's own StyleX classes, so a consumer's values silently had no effect. They are now merged through `mergeProps()` alongside the row's StyleX styles, the same way `TableCell` and `TableHeaderCell` already handle them, in both the in-`Table` and standalone rendering paths. The Astryx theme classes and striped/hover styling are unchanged (#4391).
@Eloitor
