---
'@astryxdesign/cli': patch
---

[fix] Install advice never adds an Astryx package to a `package.json` that is not an Astryx project's. Run from a folder inside an Astryx project whose own `package.json` declares no Astryx package, such as a tool folder that installs its own `@astryxdesign/core`, the daily hint that matches a project's CLI to its Core, the setup reminder, the update notice and `astryx doctor`'s version-alignment fix used to name a command that added the CLI to that folder's `package.json`, making it a separate Astryx project. They now name the project as `spec:AST-040` FR9 finds it: the command changes to that project's folder and adds the CLI there, at that project's Core, and the update notice uses that project's release. A member its workspace lists keeps its own advice, as before. In a folder that installs Core but belongs to no Astryx project, the hint and the update notice no longer print, and `astryx doctor`'s fix says to run from the project's folder or to declare an Astryx package in that folder. In a folder whose `package.json` declares an Astryx package, the advice is unchanged. No JSON shape or exit code changes.

@josephfarina
