---
'@astryxdesign/core': patch
---

[feat] Item: add `variant="transparent" | "outline" | "muted"`. `transparent` is the default and paints no surface — exactly the no-variant look Items have today. `outline` draws a visible border with no fill, and `muted` paints the muted background with no border, using Card's tokens at Item's element radius (`--radius-element`, not Card's container radius). The outline border is drawn inside the padding — its width is subtracted from whichever density padding is active — so the total inset stays on the spacing scale.

An Item without the prop renders as before, with no `data-variant` attribute. `outline` and `muted` are reflected as `data-variant` for theming; the default `transparent` is not, matching DropdownMenuItem, so a menu row's own `data-variant="destructive"` on the same element is left alone.

On `muted`, interaction states composite over the fill instead of replacing it: hover, press, highlighted, and selected paint an inset `box-shadow` above the muted background. This matters because `--color-background-muted` and `--color-overlay-hover` are the same value in light mode, so a background-color hover would give a `muted` Item no hover feedback at all. Every other Item keeps its `background-color` overlay, so an Item with no variant, and every menu row built on Item, paints exactly as before. Both properties are transitioned, so hover and press still fade on every variant.

@AKnassa
