---
'@astryxdesign/cli': patch
---

[fix] `astryx theme add <slug> --import` names the npm package that owns the added theme, in its JSON envelope (`package`, directly after `type`) and in its text output, the same way other results about one artifact do. A local theme has no package, so its result has no `package`, and `theme remove` and `theme use` are unchanged.

`astryx theme add --list` keeps its JSON. Its text now names `theme add <slug> --import` to use a theme and `theme eject <slug>` to fork one, instead of the deprecated copy form.

`astryx doctor` adds a `theme-management` check, and focused `theme-*` checks once a project has a generated theme module.

@josephfarina
