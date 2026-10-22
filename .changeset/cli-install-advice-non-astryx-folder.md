---
'@astryxdesign/cli': patch
---

[fix] Install advice never adds an Astryx package to a `package.json` that declares none. Run from a folder inside an Astryx project whose own `package.json` declares no Astryx package, such as a tool folder that installs its own `@astryxdesign/core`, the daily hint that matches a project's CLI to its Core, the setup reminder, the update notice, and `astryx doctor`'s version-alignment fix used to name a command that added the CLI to that folder's `package.json`, making it a separate Astryx project. They now name a command that changes to the Astryx project's folder and adds the CLI there, at that project's Core. With no Astryx project above, they give no install command. In a folder whose `package.json` declares an Astryx package, the advice is unchanged, and no JSON shape changes.

@josephfarina
