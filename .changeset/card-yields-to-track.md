---
'@astryxdesign/core': patch
---

[fix] Card: yield to a flex row or grid track instead of widening it to the card's content.

A card no longer holds its row or `1fr` grid track at its min-content width,
so a long unbroken value (an ID, a hash) inside a card can no longer push
side-by-side cards past a phone screen. Cards that fit are unchanged. Content
that cannot wrap is clipped at the card edge, as it already was for cards with
an explicit `width`; truncate such values with `Text maxLines={1}` and give wide
content its own scroll region. An explicit `width` is now the card's preferred
width in a row rather than a floor; wrap the card in `StackItem` to hold it.

@thedjpetersen
