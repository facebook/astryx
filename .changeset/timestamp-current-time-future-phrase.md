---
'@astryxdesign/core': patch
---

[fix] Stop `Timestamp` from rendering "in a few seconds" for a time that is
"right now". The component captures its `now` reference at render time, so a
value equal to the current instant can land a fraction of a second in the
future relative to that baseline and round to a tiny negative delta. That tiny
negative delta was treated as a future date and formatted as "in a few
seconds". Values at (or a hair before/after) the present now read as "just
now".

@cixzhang
