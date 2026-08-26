---
'@astryxdesign/core': patch
---

[feat] Card: make the `variant` axis theme-extensible through a `CardVariantMap` interface

`CardVariant` was a hand-written union backed by a closed style record, so a theme could not add a card variant: an unknown value neither type-checked nor rendered. It is now `keyof CardVariantMap`, an interface exported from `@astryxdesign/core/Card` that a theme build augments — the same shape Button, Badge, Section and the other extensible axes already ship.

`keyof CardVariantMap` resolves to exactly the thirteen values `CardVariant` had, so no existing call site changes. A variant a theme adds falls through to base styles and the theme's own `card['variant:<name>']` rule paints it.

On SelectableCard that variant's selection ring is drawn in `currentColor`, because the component cannot know what the theme painted and no token is guaranteed to contrast with it. So a theme rule that adds a variant should set `color` alongside `backgroundColor`, or style `.astryx-selectable-card` — which reflects both `variant` and `selected` — to own the ring itself.

@cixzhang
