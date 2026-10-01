---
'@astryxdesign/cli': patch
---

[fix] `astryx template <name> <path>` now names the packages the scaffolded file imports that the project does not list, with the command that installs them in the project's package manager. Most page templates import an icon or chart package (`@heroicons/react`, `recharts`, `lucide-react`); scaffolding one into a project without it used to report success and leave a build that failed on the first unresolved import.

The `template.copy` data gains `missingPackages` (sorted package names, `[]` when nothing is missing) and `installCommand` (for example `npm install @heroicons/react@2 recharts@3`, or `null`), and the text output prints both under a `[warn]` line. `astryx build` carries the same two fields on its `start` template and each alternative, so a builder sees what a template needs before scaffolding it. Existing fields are unchanged.

@thedjpetersen
