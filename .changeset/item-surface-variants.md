---
'@astryxdesign/core': patch
---

[feat] Item: add `variant="default" | "outline" | "muted"` — Card's background and border tokens at Item's element radius (`--radius-element`, not Card's container radius). `default` paints the card background with a visible border, `outline` draws the border only, and `muted` paints the muted background with no border. The border is drawn inside the padding — its width is subtracted from whichever density padding is active — so the total inset stays on the spacing scale.

`variant` is opt-in: an Item without it renders exactly as before (transparent), since a standing border would be surprising in the lists and menus Item mostly appears in.

Interaction states now composite over the variant surface instead of replacing it. The hover, active, highlighted, and selected overlays moved from `background-color` to a `background-image` gradient layer (the technique already used by TreeListItem and AvatarGroupOverflow), leaving `background-color` to the variant. This matters because `--color-background-muted` and `--color-overlay-hover` are the same value in light mode — painting hover as a background color gave a `muted` Item no hover feedback at all, and stripped the opaque surface off a `default` Item. Overlay precedence is unchanged, so an Item with no variant composites exactly as it did before.

@AKnassa
