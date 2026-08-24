---
'@astryxdesign/core': patch
---

[feat] Table: let `useTableSelection` opt out of the checked-row accent wash

The selection plugin paints checked rows by writing `backgroundColor` straight
onto each `<tr>` from its row ref callback. An inline style outranks anything
StyleX can layer on, so a product that wanted the row background for its own
meaning had no way to reclaim it short of forking the plugin.

`hasRowHighlight` turns the wash off. It defaults to `true`, so existing tables
are untouched. Only the background is dropped — `aria-selected` is still set and
removed exactly as before, since that is the half of the state screen readers
read.

```tsx
useTableSelection({...config, hasRowHighlight: false});
```

@ernestt
