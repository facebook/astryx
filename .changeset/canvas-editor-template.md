---
'@astryxdesign/cli': patch
---

[feat] Add a Canvas Editor page template

A layered-artboard workspace, staged hidden: a File/Edit/View/Object/Help
menubar over a layer rail and asset library on the left, the artboard centered
on a muted backdrop under a floating tool bar that sets zoom, and a property
inspector on the right whose fields retarget to the selected layer. Both rails
drag to resize.

The inspector is the substance of it. A text layer gets font, weight, colour,
size, line height, letter spacing, horizontal and vertical alignment, slant,
decoration, transform, a text shadow and a stroke; an image layer gets fit and
the nine CSS filters, each on a number and a rail that move together. Colour
anywhere in the panel opens a real picker. Everything that can reach the
artboard does — typing in Transform recases the poster, dragging Sepia tints
the photograph.

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

**One icon on three rows is a list nobody reads.** Border, shadow and fill
all shipped with the same `Palette` swatch, and the three effect presets in
the library shared it too — six rows, one mark, so the column read as one
control repeated rather than six different things. Lucide has no `shadow`,
`fill` or `padding` icon, so the picks came out of reading the pack rather
than guessing at names: `PaintBucket` for fill, `SquareStack` for shadow
(two offset squares is a drop shadow), plain `Square` for border,
`SquareRoundCorner` for per-corner radius so it stops colliding with the
per-side padding button that was also `SquareDashed`. Two things worth
knowing if you go looking yourself. Names in that pack can be aliases —
`FlipHorizontal` re-exports `square-centerline-dashed-horizontal`, which at
16px is an unreadable dashed box, and the mirrored triangles you actually
want are `FlipHorizontal2`. And judge candidates at 16px, not at sketch
size: `radius` is a legible corner gauge at 48px and mush at 16.

X, Y, W and H stay letterforms. They are names, not pictures — no icon
distinguishes the horizontal coordinate from the vertical one, and every
design tool prints the letters for the same reason.

**A shortcut is a hint, not a control.** `Kbd` paints one key cap per key, so
`⌘N` arrived as two small objects beside the menu item and read as something
you could press. Desktop menus print shortcuts as quiet secondary text, which
is what these are now — a `Text type="supporting" color="secondary"`, one
string, set against the menu's right edge. The cost is platform awareness:
`Kbd` resolves `mod` to ⌘ or Ctrl, and it does that through
`isApplePlatform`, which core keeps unexported on purpose, so a template that
leaves `Kbd` prints macOS glyphs and stops adapting. The `shell-nav` menubar
already makes that trade. If you need both the quiet treatment and the
platform switch, that is a gap in `Kbd` rather than something to solve at the
callsite.

**Rows are `Item`, not `ListItem`.** Both land on the same compact metrics —
4px/8px padding — but `Item` carries its own `density` instead of taking it
from `List` context, so a row keeps its spacing wherever it is put and the
rail does not depend on the list above it to stay dense. The rows still
render as `<li>` through `as="li"`, so the rail is still a list to a screen
reader, and `Item` merges `className`, which is what lets the hover-reveal
marker keep sitting on the row itself.

**One height, two rules: beside a field, or inside a row.** Everything here
aligns to 28px — the menubar, the tool bar, every inspector field, every row
of the layer rail. Two different things follow from that, and conflating
them is what makes a panel look untidy.

An action standing _beside_ a field is `IconButton size="sm"`, and its 28px
box is the whole point: the clear, the rotate pair, the per-side and
per-corner toggles all end level with the input's top and bottom, so the row
reads as one band rather than a field with something small floating next to
it. The colour swatch and the image thumbnail take the same 28px square for
the same reason — a chip beside a field is still a thing with edges, and its
edges should be the field's.

An action _inside_ a row is the exception, and the only place anything
shrinks. A compact row spends 4px above and below, leaving 20px, and the
smallest `IconButton` is 28px on its own — so a rail built from them
measures 36px no matter what density says. There is no smaller size to reach
for; the floor is the component's. The layer rail's lock is therefore a bare
`<button>` with a 20px hit area (`styles.itemAction`), and the rail measures
28px. Note what did _not_ change: it is still a `<button>`, so it stays
keyboard-reachable and announced. It was `Button`'s minimum that had to go,
not the element.

**Gutters differ by panel, and the swatch borrows the field's corner.** The
left rail sits at 8px because its rows are the content — a denser gutter
lets the list read as a list. The inspector sits at 12px, carried by each
`InspectorSection` rather than by the panel, which is what keeps the rules
between sections running edge to edge: pad the panel instead and every
divider insets by the gutter, turning a full-bleed rule into a floating
line.

The colour chips round to `--radius-element`, the same token an input
rounds to, not `--radius-inner`. One step tighter sounds like the safer
choice for a small square, but at 28px beside a 28px field the two curves
read as different families; matching them is what makes the chip look like
another control on the row rather than a tile dropped next to one.

Sliders are the one control that should _not_ match. A filter row pairs a
28px number field with a 20px rail, centred — a slider is a line to aim at,
not a box to stack, and stretching it to the field's height would read as a
second input.

**Border, Shadow and Fill are pickers, not text fields.** Each row is now a
value, a chip that opens a picker, and a clear that only lights up once the
slot holds something. Astryx has no colour picker to reach for, so the
popover is assembled from what it does have: a `Popover`, a `TextInput` for
hex, and a `Slider` for hue.

The hue rail is worth pausing on, because the obvious move is to paint it and
that would be wrong. A spectrum rail looks like custom work, but the only
custom thing about it is the gradient — the dragging, the arrow keys, the
ARIA and the thumb are all just a slider. So it _is_ a `Slider`, with
`components['slider-track']` in a `defineTheme` carrying the spectrum, scoped
under its own `Theme` so the nine filter sliders in the same panel keep the
plain track they should have. Reach for the theming target before reaching
for a `<div>`; check a component's `theming.targets` in its docs first.

Only the saturation/value plane is painted, and only because it is two axes
at once and no slider is. It carries `role="slider"`, arrow keys, and pointer
capture — capture being the part worth copying, since without it a fast drag
out of the plane stops at the edge instead of following the cursor.

The picker holds HSV while it is open even though the layer stores hex. That
is not redundancy — hex has no hue left once a colour reaches black or
white, so a picker that round-trips through it loses your place on the rail
the moment you drag to the bottom of the plane.

Shadow reuses the same popover and adds X, Y, Blur and Spread inside it,
because a shadow is one thing to set rather than five rows to find. And
Shadow appears twice on a text layer on purpose: the one in Styles is the
box's, the one in Text is the type's, and a layer can carry both.

**Enumerable styling is static; only the open-ended values are dynamic.**
Text transform, decoration, slant and alignment are closed sets, so they
compile to real classes picked by key (`typeCase`, `typeLine`, `typeSlant`,
`typeAlign`) rather than to a custom property written on every keystroke.
Size, line height, colour, stroke and shadow have no such set, so those stay
a dynamic `styles.type(…)`. Worth splitting rather than making everything
dynamic: the static half costs nothing at runtime and shows up in devtools
as a name instead of a variable.

**Filters emit only what is off its neutral point.** Nine filter functions
that all happen to be no-ops still force the image onto its own composited
layer, so `filterCss` drops the ones sitting at 0 or 100 and returns `none`
when they all are.

**The image row's thumbnail opens a picker.** `FileInput` would be the
obvious component, but it is fixed at the medium element height and this
inspector is built on a 28px rhythm, so the picker is driven from the
thumbnail instead and the file input itself stays hidden in the DOM. Choosing
a file names it in the adjacent field and stops there: a template has no
upload endpoint, and repainting the artboard from a local object URL would
show something the template does not ship.

**The canvas tool bar's end gutters match.** The trailing zoom control is a
ghost, so edge compensation pulls it out to the card's edge to optically align
its label — correct when the control is alone in a container, but here it left
8px on the leading end and nothing on the trailing one. The step goes back via
a wrapper rather than the control's own `xstyle`, because `Selector` passes
`xstyle` to an inner node and a margin there does not move the field.

**The layer rail is a `TreeList`, grouped by layer kind.** A poster's layers
are not a flat list — the two text layers belong together and the images
belong together — and a tree says so structurally instead of relying on sort
order and the reader's inference. It also buys collapse for documents whose
layer count outgrows the rail. The rows are supplied as data rather than
composed, so `TreeList` keeps the disclosure state, the guide lines and the
roving focus that a hand-rolled tree would have to reimplement; the lock still
arrives through `endContent`.

The per-row lock reveal survives the move via `TreeListItemData.className`,
which marks each row so the hover selector scopes to one row rather than to
the whole rail. Groups take the frame mark rather than repeating a child's
glyph, since a parent is a container and not another layer of that kind.

**A tab's close eats into its label rather than widening the tab.** Fading a
control that still occupies its box costs the name 20px permanently to hold
room for something usually invisible. The close now collapses to zero width
at rest and takes its 20px back on hover, so the space belongs to the name
until it is needed. That requires a set tab width: with content sizing the
label has nothing to shrink against, and revealing the close would push every
tab to its right — the strip would reflow under the pointer and the target
being reached for would move. The reveal is instant. Easing the width means
the label reflows for the length of the animation, so the name wobbles every
time the pointer crosses a tab — motion on an affordance that is only ever
glanced at. The set width holds the longest seeded name _with_ its close
showing, since the open document never hides one.

**Tabs separate with a 16px rule, dropped either side of the open one.** A
vertical `Divider` takes its height from the row unless given one, and the
strip has no columns to divide — it needs the smallest mark that reads as
"these are separate tabs". Tabs are all one width, so the rule marks a
boundary rather than sitting midway between two labels, which is also why it
is dropped next to the open document: that tab already reads as separate by
its fill, and a rule running into the fill's rounded edge only crowds it. The
rule is hidden rather than unmounted, so moving the selection does not add or
remove a flex item and slide the whole strip sideways under the pointer that
just clicked it. The strip carries no flex gap, since a gap applies on _both_
sides of a rule and would leave it floating in a channel of its own instead
of landing on the seam; the tabs have their own inner padding, so butting
them up costs the labels nothing.

**Tabs have a ceiling, not a fixed width, and the panels fold by width.** A
tab now sits at its widest and gives ground as documents are added or the
window narrows, spending the label's slack before truncating and stopping at
a floor so a crowded strip scrolls rather than grinding every tab down to a
sliver. The ceiling has to be `width` and not `flex-basis`: a basis does not
raise an item's max-content contribution, so the strip sizes itself to the
tabs' _content_ and then squeezes them back under their own basis, leaving
every tab short even with the bar half empty.

The strip also caps itself, because it sits in `Toolbar`'s start slot and
that is not the slot built to give way — only the centre slot carries
`min-width: 0`, so a start slot grows to its content and pushes the bar wider
instead of squeezing. Widening the start slot in core would change every
toolbar to suit one page's tab strip, so the cap is local: bar width less the
room the menu button and the trailing save/export group need, measured in
`cqw` against the header so it tracks the bar rather than the window. The
new-document button moved out of the strip on the way — it is not one of the
open documents the group is named for, and inside a scrolling strip it would
be the first thing to scroll out of reach.

The two side panels fold away below a width rather than being switched off:
the View menu's toggles record what the user asked for, so a panel that
vanished for room comes back on its own when the window grows. The inspector
goes first, being the wider of the two and the one you can work without; the
rail follows later, since knowing what is on the canvas outlasts being able
to adjust it. Each resize handle folds with its panel, or a grip is left
behind on a seam with nothing on the other side.

**The image row's trigger is a `Thumbnail`, not a button wrapping an `img`.**
The component already carries what the hand-rolled version was re-deriving:
button semantics and a hover overlay from `onClick`, an accessible name and
tooltip from `label`, and the same `--radius-element` the colour swatches
use. It ships at 64px for media grids, so it takes a width override to join a
row of 28px controls; the picture stays square on its own aspect ratio, so
the height needs no help.

**Icons in the rail share one colour, and unselected tabs dim whole.** Every
rail glyph, and the strip's new-document `+`, now resolves to the secondary
_icon_ token. That token and its
text counterpart agree at the theme root but diverge under this editor's
theme, so a lock keyed to the text ramp came out darker than the layer glyphs
on its own row. Tabs dim their icon alongside their label; dimming the label
alone left the icon at full strength and read as half-active.

A note if you wire the Appearance menu to a Theme of your own: a nested Theme
recolours text but does not repaint the page behind transparent panels, so an
explicit mode needs a surface — here a `Section` wrapping the editor — or the
new mode's text lands on the host's old background.

@ernestt
