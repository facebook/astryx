---
'@astryxdesign/core': patch
---

[fix] List: keep list semantics for all listStyle variants by always emitting an explicit role="list", since the base style strips list-style-type for every variant and Safari/VoiceOver drops implicit list roles for such lists (WCAG 1.3.1)
@bhamodi
