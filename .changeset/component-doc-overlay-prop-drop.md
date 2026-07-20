---
'@astryxdesign/cli': patch
---

[fix] Translated component docs no longer drop props

A `docsZh` / `docsDense` block that carried its own `props` array replaced the English component doc **wholesale** rather than overlaying it, so any prop the translation had not caught up with simply ceased to exist. `astryx component Button --zh` silently omitted `isInterruptible` and `isIconOnly`; ten components were affected, including `MobileNav`, `Popover` and `Stack` through the multi-component `components[]` shape.

A reader of the translated docs cannot discover a prop that is not there — and `CLAUDE.md` instructs every AI agent to read `astryx component <Name>` before touching a component, so a missing prop is a prop that never gets used.

Translations are now an overlay, matched by prop **name** rather than position: a prop the translation does not cover falls back to its English entry instead of vanishing, and the prop's contract (`type`, `default`, `required`) stays authoritative from the English doc while the translation supplies the prose. Existing Chinese descriptions are unaffected. A test asserts no translated view can drop a prop the English doc documents.

@AKnassa
