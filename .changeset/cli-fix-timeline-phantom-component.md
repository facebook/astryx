---
"@astryxdesign/cli": patch
---

[fix] `extractComponents` reported phantom components from locally-declared helper functions in template files — e.g. "Timeline", derived from a `function TimelineSection() {...}` helper declared directly in the detail-page template, which isn't a real component. It now excludes any name that corresponds to a local `function`/`const`/`let`/`class` declaration in the same file, before suffix-stripping runs, so a locally-declared helper is never mistaken for an imported component.

@abu-abdullah22
