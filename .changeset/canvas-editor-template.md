---
'@astryxdesign/cli': patch
---

[feat] Add a Canvas Editor page template

A layered-artboard workspace, staged hidden: a layer rail and asset library on
the left, the artboard centered on a muted backdrop under a floating tool pill
that sets zoom, and a property inspector on the right whose fields retarget to
the selected layer.

It fills a gap next to `Tools - Page Editor`. That one composes a document — a
palette of blocks dropped into a flow that reflows around them. This one moves
objects on a fixed 1080 x 1920 frame, where position and size are coordinates
rather than an order, so the inspector reads X/Y/W/H and the canvas needs a
zoom control at all.

Two decisions worth knowing if you copy it:

**The artboard is themed, not styled.** It runs under its own `defineTheme`
pinned to `mode="light"`, so the poster keeps its palette when the editor
around it goes dark. The theme carries what belongs to the poster as a whole —
the display face, the leading, the uppercase treatment, the frame margins —
and the display face is Anton with a fallback chain through the condensed
grotesques that ship with macOS and Windows. The chain puts Impact ahead of
Arial Narrow because every face in it is a single-weight black rendered at
weight 400, and Arial Narrow at 400 reads thin rather than poster-heavy.

Size and tracking are deliberately not tokens: they belong to a layer rather
than to the poster, so they live on the layer and the inspector edits them
live. That split is the line worth copying — theme what the surface owns,
leave per-object properties to the object.

**Zoom is a transform, not a re-layout.** The artboard always lays out at its
native size and the frame scales the painted result, which keeps the theme's
numbers in artboard pixels — the same numbers the inspector shows — and keeps
the poster from reflowing between zoom steps.

@ernestt
