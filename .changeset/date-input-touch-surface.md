---
'@astryxdesign/core': patch
---

[feat] DateInput fits the pointer: a touch picker on a finger, the text field
on a mouse

`DateInput` has always been a control for a mouse — a field you type into with
a calendar in a popover beside it. On a phone or a tablet that is the wrong
shape: the popover is a desktop calendar operated by thumb, and focusing the
field summons a keyboard that covers the thing it is meant to fill in.

The same component now renders a second surface where the primary pointer is a
finger (`pointer: coarse`): a bottom sheet holding one month per screen, swiped
sideways, with month and year wheels behind the header title for the far jumps
swiping is bad at, arrows in the header corner for a single step, and every
target floored at 44px. A day commits the moment it is tapped and leaves the
sheet up, so a mistake can be corrected in place; Done just closes.

Nothing changes at the call site. It is one component with two surfaces, not
two components — same props, same values, no new import, no media query to
write. Existing usage is untouched: with a mouse the rendered output is the
control that was always there.

The switch is the pointer alone, deliberately with no width bound. `pointer`
means the PRIMARY device, so a touchscreen laptop reports `fine` and keeps the
typable field (its keyboard is right there), while a narrowed desktop window is
still a mouse. Adding a width test would only re-exclude tablets, which are the
clearest case for a thumb picker.

Also new, all additive:

- `TOUCH_POINTER_QUERY` — the media query the switch uses, exported so an app
  can ask the same question the component does.
- `DateInputTouchSurface` — the touch surface with the pointer test skipped,
  for a story or test that has to show it on a desktop browser, and for an app
  that only ever runs on a handset. Prefer `DateInput`, which chooses.
- `--date-input-touch-day-size` and `--date-input-touch-wheel-item-size` theme
  variables, and four `@astryx.dateInput.*` catalog keys for the picker's
  header and footer.

The wheels also answer a mouse now. A wheel is a scroll container, so a finger
pans it for free; a mouse got nothing, because browsers do not drag-scroll an
overflow container — pressing and pulling on the one control shaped like a
thing you spin did nothing at all. Dragging with a mouse works, and fixes a
related bug on the way: BottomSheet begins its own drag from a `pointerdown`
on its body and captures the pointer for it, so a click on a wheel row that
wobbled more than a pixel or two used to select nothing.

@imdreamrunner
