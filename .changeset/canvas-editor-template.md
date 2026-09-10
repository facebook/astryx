---
'@astryxdesign/cli': patch
---

[feat] Add a Canvas Editor page template

A layered-artboard workspace, staged hidden: a File/Edit/View/Object/Help
menubar over a layer rail and asset library on the left, the artboard centered
on a muted backdrop under a floating tool bar that sets zoom, and a property
inspector on the right whose fields retarget to the selected layer. Both rails
drag to resize.

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

**A menubar is one control, not five dropdowns.** File/Edit/View/Object/Help
are five `DropdownMenu`s in a Toolbar's start slot, and what makes them read
as a menubar is that opening any one of them arms the rest: crossing to a
neighbouring title switches menus without a second click. A DropdownMenu
holding its own open state cannot do that — it has no way to know a sibling
is showing — so the bar keeps the open menu in one `useState` and each
trigger only reports what the pointer crossed. Two details make it behave.
The hover only takes the menu when one is already open, or sweeping the bar
would trip menus the reader never asked for. And `onOpenChange` has to check
which menu is open before clearing it: handing the bar to a sibling closes
the outgoing menu on the way out, and a plain `isOpen ? id : null` lets that
farewell land after the sibling has claimed the bar, so every switch blanks
instead. Sitting in a Toolbar also gets the keyboard for free — its roving
tabindex is already left/right across the titles.

Five smaller things the template works out, in case you hit the same walls:

**A field names itself from inside.** Every inspector control is one input
with a glyph in its `startIcon` slot — `X`, `Y`, `W`, `H` — rather than an
`InputGroup` pairing an addon to a field. It reads as a single control, and
the accessible name stops stuttering ("Horizontal position", not "Horizontal
position X"). `startIcon` takes an SVG component, so the letters are drawn on
the same 24px grid Lucide uses and sit interchangeably beside real icons.

**One left edge across the panel.** The label column is a set width, but a
flex item shrinks before its siblings do, and the fields beside it carry
StackItem's min-width reset. Without `flexShrink: 0` on the label column the
row spends its shrinkage there, and every field lands on a slightly different
edge — which is the one thing an inspector cannot afford.

**Row actions reveal on hover through a marker.** A layer's lock stays hidden
until the row is pointed at. That wants `stylex.when.ancestor(':hover')`, and
two things about it are worth writing down. A scoped `defineMarker()` is the
usual advice but StyleX only hashes one inside a `.stylex.ts` module, which a
single-file template cannot have; `defaultMarker()` is safe in its place
because product code compiles markers under its own prefix and never answers
to the one Layout sets internally. And the hidden state has to be the
unconditional default: the reveal arms compile to a doubled class plus
`:where(…)`, so gating the hidden state behind a media query puts both at the
same specificity in the same layer, where source order decides and the reveal
silently loses.

**A fixed-height Card scrolls; the artboard has to clip.** Give `Card` a
`height` and it becomes a scroll container, which is right for a card holding
more copy than fits. The artboard is the opposite case: it lays out at its
native 1080 wide at every zoom step and the frame scales the painted result,
so its content is deliberately larger than its box and the card would offer
1080px of sideways scroll inside a 432px frame. `overflow: clip` through
`xstyle` is the fix, and `clip` over `hidden` because nothing here should
scroll at all — including the quiet scroll `hidden` still performs when
something inside it takes focus.

**Concentric corners come out of the padding.** The floating tool bar is a
card with one spacing step of padding, so the controls inside it round to the
card's radius _less_ that step — written as
`calc(var(--radius-container) - var(--spacing-1))` rather than a number, so
it still holds if either token moves. An inner corner cut at the same radius
as its container reads as a rounder curve crossing a straighter one; matching
the difference is what strikes both from the same centre. While you are in
there: a vertical `Divider` is `height: 100%`, and a flex row that centres
its items gives a percentage height nothing to resolve against, so the rule
collapses to zero and the bar silently loses its groups. `alignSelf: stretch`
is what gives it a height.

**A Toolbar's inline padding comes from its container, so reach the token.**
This one sits in a Layout set to zero padding — the panels have to reach the
edges — and inherits that zero, which puts the Export button hard against the
window. `paddingInline` through `xstyle` does not fix it: Section renders an
outer wrapper that escapes its parent's gutter and an inner one that holds
the padding, `xstyle` lands on the outer, and padding set there makes the bar
bleed 12px _past_ the window instead of insetting its contents. Set
`--astryx-section-padding-inline` instead. It is read on the inner element,
and the second thing it does is the one that matters: it republishes
`--container-padding-inline-*`, which is what the toolbar's edge compensation
reads to pull ghost triggers back out by their own padding — so the File
_label_ lines up on the gutter while its hover box still bleeds into it, and
the two ends of the bar finally balance.

A note if you wire the Appearance menu to a Theme of your own: a nested Theme
recolours text but does not repaint the page behind transparent panels, so an
explicit mode needs a surface — here a `Section` wrapping the editor — or the
new mode's text lands on the host's old background.

@ernestt
