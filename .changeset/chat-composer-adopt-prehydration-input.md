---
'@xds/core': patch
---

fix(core/Chat): adopt field content present at mount instead of wiping it

`ChatComposerInput`'s controlled-value sync effect overwrote the field with `controlledValue` on mount, discarding any text already in the contentEditable — e.g. typed into the server-rendered composer before hydration attached `onChange`, or filled by the browser. It now adopts that content on the first sync by emitting it through `onChange` (so it becomes the controlled value) instead of erasing it, and marks the field with `suppressHydrationWarning` so React doesn't clobber pre-hydration input. Post-mount behavior is unchanged: an empty `controlledValue` against a non-empty field is still treated as a deliberate external clear.
