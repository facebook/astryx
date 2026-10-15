---
'@astryxdesign/core': minor
---

[breaking] `reset.css` now gives the button inside a file input (`::file-selector-button`) the reset every `<button>` gets. As a pseudo-element it escaped the reset's element selectors and kept the browser's font stack, button text color, 2px outset border and grey fill. It now inherits the input's font and color, has a `0 solid` border on a `border-box`, and has `appearance: button` with a transparent background, like a bare `<button>`; its own padding and margin stay. A bare `<input type="file">` therefore shows its button as plain text in the page's font, as a bare `<button>` already does. Astryx's `FileInput` is unaffected: its native input is visually hidden.

To keep the browser's button look, style `::file-selector-button` yourself. There is no codemod: whether a page relies on the browser's button look cannot be read from its source.

@vjeux
