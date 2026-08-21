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
sheet up, so a mistake can be corrected in place; Save closes the picker, and
Reset puts it back to how it opened — no date, current month. The grid spills
adjacent-month days, muted and unselectable, and the weekday header is three
letters rather than two, both as the desktop calendar has them.

Opening the wheels is a cover, not a cross-fade: an opaque plate the colour of
the sheet lands over the calendar on the first frame and the month and year
fade in against it, so nothing of the calendar animates and no frame shows a
day number and a year through each other. Tapping Done uncovers in one frame.

Nothing changes at the call site. It is one component with two surfaces, not
two components — same props, same values, no new import, no media query to
write. Existing usage is untouched: with a mouse the rendered output is the
control that was always there.

The switch is the pointer alone, deliberately with no width bound. `pointer`
means the PRIMARY device, so a touchscreen laptop reports `fine` and keeps the
typable field (its keyboard is right there), while a narrowed desktop window is
still a mouse. Adding a width test would only re-exclude tablets, which are the
clearest case for a thumb picker.

The public surface barely moves. One new export — `TOUCH_POINTER_QUERY`, the
media query the switch uses, so an app can ask the same question the component
does and lay out to match — plus six `@astryx.dateInput.*` catalog keys for
the picker's header and footer.

Nothing else is published, on purpose. There is no export that forces a
surface: the touch picker is reachable by being on a touch device, which is
the only place it is worth looking at. The picker's two sizes (the 44px day
cell, the 28px wheel row) are compile-time constants rather than theme
variables — the day size is an accessibility floor, and a variable a theme can
quietly lower is not a floor. And the sheet's header button is addressed by a
`data-` attribute rather than a theme target, because nothing has asked to
restyle it. Each of those is additive later and awkward to withdraw once
shipped.

The wheels also answer a mouse now. A wheel is a scroll container, so a finger
pans it for free; a mouse got nothing, because browsers do not drag-scroll an
overflow container — pressing and pulling on the one control shaped like a
thing you spin did nothing at all. Dragging with a mouse works, and fixes a
related bug on the way: BottomSheet begins its own drag from a `pointerdown`
on its body and captures the pointer for it, so a click on a wheel row that
wobbled more than a pixel or two used to select nothing.

@imdreamrunner
