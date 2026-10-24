---
'@astryxdesign/core': patch
---

[fix] Step: a clickable step's number badge and label are no longer adjacent text, so a text reading of the button no longer joins them as "1Account" (axe-core 4.14's Label in Name rule reported every clickable numbered step). A whitespace node now separates them in all four layouts; the rows are flex containers, so nothing changes on screen. A step's `description` inside the button is a separate Label in Name case and is unchanged.

Fixes #7966.

@HelloOjasMutreja
