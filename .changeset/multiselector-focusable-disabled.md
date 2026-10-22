---
'@astryxdesign/core': patch
---

[fix] A disabled `MultiSelector` keeps its place in the tab order, so keyboard and screen-reader users can reach it and hear that it is unavailable (WCAG 2.2 SC 2.1.1 Keyboard and 4.1.2 Name, Role, Value; `spec:AST-085` FR1–FR4). Before, its trigger rendered the native `disabled` attribute and `tabIndex={-1}`, so Tab skipped it and a focused trigger lost focus when disabled; now it exposes `aria-disabled="true"`, keeps focus, still opens nothing, and submits no form value. Like a natively disabled button, it runs no caller event handler other than focus and blur, and a press on it reaches no handler. A focused disabled trigger shows a keyboard focus ring, dimmed with the rest of the control (SC 2.4.7 Focus Visible; `spec:AST-085` FR6).

@cixzhang
