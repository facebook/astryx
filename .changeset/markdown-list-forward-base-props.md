---
'@astryxdesign/core': patch
---

[fix] Markdown and List forward the rest of `BaseProps`

Both declare `BaseProps`, and `BaseProps` documents that `data-*`, `aria-*` and
`role` reach the element — but each destructured a fixed set of props and
forwarded only `data-testid`, so an `aria-label` a consumer passed silently
disappeared. `<Markdown aria-label="Release notes">` named nothing, and a list
could not be labelled by a heading it did not render itself.

Consumer props spread first, so what a component sets for itself still wins:
the block root stays `role="document"`, the list keeps the explicit `role="list"`
that restores Safari/VoiceOver announcements, and a list rendering its own
header keeps that association rather than one pointed elsewhere. The
`aria-labelledby` for that header is only written when the header exists —
writing `undefined` unconditionally would erase a consumer's own label.

@lexs
