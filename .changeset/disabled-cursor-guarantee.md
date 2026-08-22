---
'@astryxdesign/core': patch
---

[fix] A disabled control now answers the pointer with `not-allowed` wherever it can be pointed at: every `cursor` in core and lab carries `':is(:disabled,[aria-disabled="true"])': 'not-allowed'`, and the reset gives the same cursor to any disabled element that declares none — `[aria-disabled]` included, where it previously said `default` and only for native `:disabled`. A lint rule and a Chromium sweep over every story keep it that way. Disabled elements sealed behind `pointer-events: none` are unchanged: the pointer never reaches them, so their cursor comes from an ancestor.

@cixzhang
