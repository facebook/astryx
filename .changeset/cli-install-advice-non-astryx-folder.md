---
'@astryxdesign/cli': patch
---

[fix] Install advice never adds an Astryx package to a `package.json` that is not an Astryx project's. The project is the one `spec:AST-040` FR9 finds: the nearest folder whose `package.json` declares an Astryx package, or a member its workspace lists, never the home folder and never past a repository root. Run from a folder inside such a project whose own `package.json` is not the project's, such as a tool folder that installs its own `@astryxdesign/core`, the daily hint that matches a project's CLI to its Core, the setup reminder and `astryx doctor`'s version-alignment fix used to name a command that added the CLI to that folder's `package.json`, making it a separate Astryx project. They now compare the CLI with the Core the run reads, as before, and when the two differ they say to run from the project's folder, or to declare an Astryx package in that folder; the update notice upgrades the project from its folder, with the project's release. A member its workspace lists keeps its own advice. In a folder that belongs to no Astryx project, the hint, the setup reminder and the update notice no longer print, and `astryx doctor`'s fix says how to reach a project. In a folder whose `package.json` declares an Astryx package, the advice is unchanged. No JSON shape or exit code changes.

@josephfarina
