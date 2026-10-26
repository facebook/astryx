---
'@astryxdesign/core': patch
---

[feat] A `Link` without `href`, which renders a `<button>`, now takes its letter spacing, word spacing, case, text shadow and text alignment from the surrounding text, as a `Link` with `href` already does. The browser's stylesheet sets these on a `<button>`, so in uppercase or tracked text the button form showed lowercase, untracked words beside an anchor form that matched the text, and its wrapped lines stayed centered. Text indent stays reset: inherited, it would indent the words inside the button's own box.

To keep the old look, add `button.astryx-link { letter-spacing: normal; word-spacing: normal; text-transform: none; text-shadow: none; text-align: center; }`.

@vjeux
