---
'@astryxdesign/core': patch
---

[feat] Tokenizer fits the pointer: a scrolling chip row and a suggestion sheet
on a finger, the inline field on a mouse

`Tokenizer` has always been a control for a mouse. You type _between_ the
chips, in an input that shares a line with them, and you remove the last one
with Backspace on an empty input. Both of those need a hardware keyboard. On a
phone, focusing that input raises the virtual keyboard over the bottom half of
the screen — which is where the suggestion popover opens — and every chip added
grows the field by a line and pushes the page under your thumb.

The same component now renders a second surface where the primary pointer is a
finger (`pointer: coarse`): the chips sit on one sideways-scrolling line, so
the field is exactly one line tall however many there are and nothing below it
moves; an Add button at the trailing edge, outside the scroller so it is in the
same place with two chips or twenty, opens a pinned-tall sheet; and the sheet
puts its search field at the top where the keyboard cannot cover it, over
full-width rows a thumb can hit. Tapping a row adds that token and leaves the
sheet up for the next one, so building a set of five is five taps. The list is
populated before anything is typed — in a sheet the list is the content, and a
search box over an empty pane is a dead end.

Nothing changes at the call site. It is one component with two surfaces, not
two components — same props, same values, no new import, no media query to
write. With a mouse the rendered output is the control that was always there.

The switch is the pointer alone, deliberately with no width bound. `pointer`
means the PRIMARY device, so a touchscreen laptop reports `fine` and keeps the
typable field (its keyboard is right there), while a narrowed desktop window is
still a mouse. Adding a width test would only re-exclude tablets, which have
the same thumb and more room to use it.

Every prop keeps its meaning, and the two that gain one say so in the docs:
`placeholder` also becomes the sheet search field's placeholder, so write it as
a search hint; `maxEntries` disables Add at the cap, and the token that reaches
it closes the sheet. `hasCreate`, `renderItem`, `renderToken`, `maxMenuItems`,
`debounceMs`, `htmlName`, `hasClear`, `status`, and the disabled-reason tooltip
all behave as they do on the pointer surface, because the selection logic is
now one shared hook rather than two copies — including the "Create X" sentinel,
which is the part that must not fork.

The public surface barely moves: one new export, `TokenizerTouchSurface`, the
touch half with the pointer test skipped, so a Storybook story or a
handset-only app can render it directly, plus three `@astryx.tokenizer.*`
catalog keys for the Add button and the sheet's search field. The plus glyph is
drawn in the component rather than registered as an icon name — it is
structural, the way CheckboxIndicator draws its own tick, and registering a
name would put every theme on the hook for an icon.

Costs 16.4 KB gzipped on top of Tokenizer's 58.6 KB — mostly BottomSheet and
List, which most apps already ship — for every consumer including desktop-only
ones, since the choice is made at runtime.

@imdreamrunner
