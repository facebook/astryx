---
'@astryxdesign/cli': patch
---

[fix] `astryx swizzle` copies a component's subdirectories. Only the files directly inside the component directory were copied, so a swizzled Markdown, Table, Dialog, DropdownMenu, Calendar, CodeBlock, Outline or ScrollableArea kept imports of its own `plugins/`, `modules/`, `hooks/` or `languages/` that no longer existed. The copy now walks the whole component (tests and snapshots excluded), keeps each nested file's imports inside the component relative, and rewrites only the imports that leave it. The response's `files` lists nested paths with `/` separators.

@thecodebasedot
