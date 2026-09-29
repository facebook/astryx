---
'@astryxdesign/core': patch
---

[fix] `Dialog` and 30 other components no longer lose their `border` and `background` resets in the shipped CSS. The sources used the `border: 'none'` and `background: 'none' | 'transparent'` shorthands, which StyleX's default property-specificity mode drops silently, so the declarations never reached `astryx.css`; a consumer that does not load `reset.css` saw the UA `<dialog>` frame. They are now the `borderWidth` / `borderStyle` / `backgroundColor` longhands. No API change.

@kyu-rong
