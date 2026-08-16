---
'@astryxdesign/cli': patch
---

[fix] `main` was left red by #5045: the font advisory it added fires on the shipped theme template, which the template's own guard reads as a defect. Both are right — the template names Inter and Geist Mono deliberately, and no theme file can load a font, which is why its header opens with SHIP THE FONTS YOU NAME and gives both recipes. So the guard now says what it means: the template compiles with exactly those two font advisories and no other warning, instead of none at all. A real defect in the template still fails it.

@cixzhang
