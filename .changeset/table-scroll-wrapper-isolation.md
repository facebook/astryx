---
'@astryxdesign/core': patch
---

[fix] Table's scroll wrapper now isolates itself, so the local paint order its plugins use — pinned columns, a pinned header, pinned group headings, the resize handle — stays inside the table instead of meeting unrelated page chrome. Those ranks also come from one shared table now, so no two things that can land on the same pixels share a tier. A scroll-wrapper plugin's own `className` and `style` survive the wrapper's merge rather than being overwritten, and a plugin may set `hasPluginOwnedOverflow` to take over the wrapper's overflow entirely, so exactly one source declares it. (#6221)
@ernestt
