---
'@astryxdesign/cli': patch
---

[feat] A failed `astryx component`, `template` or `docs` lookup lists the entry you most likely meant first. Components that tie on match score are ordered by how early the name you typed appears in their keywords and by how close their names are, instead of alphabetically; among the suggestions offered, a component one of whose other names was typed (including another library's name for it, such as `MUI TextField`, with or without the library's name) comes first; a compound name that does not exist (a family part named with other words, or without one of its family's words) suggests the real part or its family. Templates are ordered by how closely their id or title matches the name you typed, and unknown docs routes by how closely the route matches. Suggestion lists never get longer, every suggestion is a real entry, and a name that resolved before still resolves to the same entry.

@josephfarina
