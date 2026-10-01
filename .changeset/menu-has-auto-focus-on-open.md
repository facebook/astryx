---
'@astryxdesign/core': patch
---

[feat] DropdownMenu, Selector and ComplexSelector take `hasAutoFocusOnOpen`.

`hasAutoFocusOnOpen={false}` opens without moving focus, for a picker or menu
that unfolds beside a text field the user is typing in. The default `true`
keeps today's focus landing.

@vjeux
