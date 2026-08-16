---
'@astryxdesign/cli': patch
---

[fix] The unloaded-font advisory is a notice, not a warning. A theme file cannot load a font — Astryx sets `--font-family-*` and loading is the app's job — so #5045's advisory fires on any theme naming a webfont, including a perfectly correct one. As a warning that made a clean build read as defective, and it put the shipped template permanently in violation of its own "compiles with no warnings" guard (#5079 had to allowlist the template's two font names in that assertion).

The `theme.build` receipt now separates the two: `warnings` are defects the author should fix, `notices` are advisories about a correct theme. The font advisory moves to `notices` and to stdout with the rest of the build's progress; stderr stays for defects. The template guard is back to `warnings` being empty, and no longer needs to know which fonts the template names.

Programmatic callers reading `data.warnings` for font advisories should read `data.notices`; the message text is unchanged.

@cixzhang
