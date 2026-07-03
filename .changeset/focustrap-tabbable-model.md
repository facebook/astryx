---
'@astryxdesign/core': patch
---

[fix] useFocusTrap: the focusable-element detection now includes `contenteditable`, media with `controls`, `iframe`, and an open `<details>`'s `<summary>`, and excludes elements hidden via `display:none`/`visibility:hidden` or inside `inert`/`hidden` subtrees. Previously a trapped surface whose only interactive content was (e.g.) a contenteditable composer could let Tab escape (infra-8).
@cixzhang
