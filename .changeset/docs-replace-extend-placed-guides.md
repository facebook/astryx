---
'@astryxdesign/cli': patch
---

[feat] An integration's doc can now replace or extend one of the CLI's guides by its route, such as `replaces: 'authoring/quick-start'` or `extends: 'authoring/quick-start'`, so a package changes the guide agents already read for every app that installs it. An extension's section can set `before` or `after` to a section's key to go there instead of at the end; an older CLI rejects those fields, so `integration verify` warns when the package's `@astryxdesign/cli` peer range admits one. Every read names the replacing or extending package: `package` on the guide and on each section, and a replaced topic or guide now also carries `replacedPackage` beside `replaces` (in `docs`, `docs --index`, the topic list, and a namespace's children), with a `replaces <package>'s <topic>` line in text. A name that holds no topic or guide (such as a namespace) changes nothing, and a `before` or `after` key that names no section adds the section at the end: `integration validate` lists each as a note (`doc_target_not_found`, `doc_section_unplaced`), and two docs of one package that replace one guide as `duplicate_guide_replacement`; none fails anything until the next minor release.

@josephfarina
