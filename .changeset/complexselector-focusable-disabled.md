---
'@astryxdesign/core': patch
---

[fix] A disabled `ComplexSelector` keeps its place in the tab order, so keyboard and screen-reader users can reach it and hear that it is unavailable (WCAG 2.2 SC 2.1.1 Keyboard and 4.1.2 Name, Role, Value; `spec:AST-085` FR1, FR2 and FR4). Before, its trigger rendered the native `disabled` attribute, so Tab skipped it and a focused trigger lost focus when disabled; now it exposes `aria-disabled="true"`, keeps focus, shows its keyboard focus outline, and still opens nothing. A press or key on it reaches no handler: not the toggle, not a caller's `onClick` or `onKeyDown`, and not an ancestor's click handler.

@cixzhang
