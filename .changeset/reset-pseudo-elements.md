---
'@astryxdesign/core': patch
---

[fix] The reset now reaches `::before`, `::after`, `::placeholder` and the search field decoration (#7320). Pseudo-elements are invalid inside `:where()`, so the browser silently dropped them and those rules matched nothing. Pseudo-elements now use `border-box` and the 0-width solid border reset, placeholders take the reset color at full opacity, and a raw `type="search"` field loses the native cancel button in Chromium.

@harjothkhara
