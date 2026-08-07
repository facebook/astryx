---
'@astryxdesign/core': patch
---

[feat] Item: add `variant="transparent" | "outline" | "muted"`. `transparent` is the default and paints no surface — exactly the no-variant look Items have today. `outline` draws a visible border with no fill, and `muted` paints the muted background with no border, using Card's tokens at Item's element radius (`--radius-element`, not Card's container radius). The outline border is drawn inside the padding — its width is subtracted from whichever density padding is active — so the total inset stays on the spacing scale.

An Item without the prop renders as before; the variant is now always reflected for theming (`data-variant="transparent"` by default, matching how Card reflects its default variant).

Interaction states composite over the variant surface instead of replacing it. The hover, active, highlighted, and selected overlays moved from `background-color` to a `background-image` gradient layer (the technique already used by TreeListItem and AvatarGroupOverflow), leaving `background-color` to the variant. This matters because `--color-background-muted` and `--color-overlay-hover` are the same value in light mode — painting hover as a background color gave a `muted` Item no hover feedback at all. Overlay precedence is unchanged, so an Item with no variant composites exactly as it did before.

@AKnassa
