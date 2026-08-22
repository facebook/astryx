---
'@astryxdesign/core': patch
---

[feat] Selector, MultiSelector, ComplexSelector: let the trigger opt out of the chevron

The chevron is a sibling of the trigger button, after the optional clear
button, so a selector with `hasClear` and a value showed both a `×` and a
chevron in the same slot. StyleX has no descendant selectors and
`stylex.when.*` only reads upward, so an `xstyle` on the field could not reach
the icon — there was no supported way to drop it.

`hasChevron` turns it off. It defaults to `true`, so existing selectors render
identically. Only the chevron goes: a status glyph shares that slot and still
appears, and because the chevron is decorative (`aria-hidden`) and sits outside
the button, the accessible name, focus order, and keyboard behaviour are
untouched.

The name matches `DropdownMenu`'s existing `hasChevron`, and avoids colliding
with `indicatorPosition`, which on Selector and MultiSelector already means the
selected mark inside an option row.

```tsx
<Selector hasClear hasChevron={false} value={value} onChange={setValue} />
```

@ernestt
