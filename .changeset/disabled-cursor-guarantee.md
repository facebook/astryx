---
'@astryxdesign/core': patch
---

[fix] A disabled element answers the pointer with `default`, never an interactive cursor. Every `cursor` in core and lab carries `':is(:disabled,[aria-disabled="true"])': 'default'`, and the reset gives the same cursor to any disabled element that declares none — `[aria-disabled]` included, which previously got nothing. A lint rule and a Chromium sweep over every story keep it that way. Disabled elements sealed behind `pointer-events: none` are unchanged: the pointer never reaches them, so their cursor comes from an ancestor — which is why the guarantee is `default` rather than a distinct disabled cursor the library could only paint on some of them (#5323).

@cixzhang
