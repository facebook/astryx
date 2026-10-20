---
'@astryxdesign/cli': patch
---

[fix] `extractComponents` reported phantom components from locally-declared helper functions in template files — e.g. "Timeline", derived from a `function TimelineSection() {...}` helper declared directly in the detail-page template, which isn't a real component. It now excludes any name bound by a top-level `function`, `class`, `const`, `let` or `var` declaration in the same file (read from the parsed source, so comments, strings and type annotations don't count), before suffix-stripping runs, so a locally-declared helper is never mistaken for an imported component. A component whose whole name is a stripped suffix, such as a bare `Section`, now stays in the list instead of emptying out.

@abu-abdullah22
