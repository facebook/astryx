---
'@astryxdesign/core': patch
---

[fix] FileInput no longer nests interactive controls (the clear and status buttons) inside a role="button" trigger. The trigger is now a visually hidden button alongside them in a non-interactive container, resolving the nested-interactive a11y violation (WCAG 4.1.2) while keeping click, keyboard, and drag-and-drop behavior. (#4522)

@cixzhang
