---
'@astryxdesign/core': patch
---

[feat] `OverlayRegion` places one piece of content over an `Overlay`, so one image can carry several captions, badges, tags, or hotspots. Render it inside the Overlay's content and give it a `position`: a preset (`fill`, `top`, and `bottom` mean what they mean on `Overlay`; `center` and the corners `top-start`, `top-end`, `bottom-start`, `bottom-end` are new, and the corners flip in right-to-left), or open placement `{x, y, width?, height?}`, where `x` and `y` are the region's top-left corner as 0–1 fractions of the media and `width`/`height` extend right and down. Open placement does not mirror in right-to-left, because media does not; a sized box stays inside the media, and every region keeps its spot when the media resizes. Regions belong to an Overlay with the default `position="fill"`: inside a top or bottom strip a region is not placed, its content flows with the strip, and a development warning fires. The region adds no role or focus stop and follows the overlay's reveal mode and media theme. Moving a region stays in your code: pass a new `position`, as the Overlay docs example shows with pointer drags, a click on the image, and arrow keys. An `Overlay` that holds a region isolates its stacking so the region's paint order stays inside it; an `Overlay` without a region renders and stacks exactly as before.

@cixzhang
