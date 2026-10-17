---
'@astryxdesign/cli': patch
---

[fix] The CLI finds the project's `@astryxdesign/core` from any folder inside the project. `component`, `hook`, `build`, `search`, `swizzle`, `theme targets` and `doctor` still search the folders they searched before, and past them continue up to the workspace root of the nearest folder whose package.json declares an Astryx package. They now work five or more folders deep, in workspace members whose Core the workspace installs at its root, and in Yarn Plug'n'Play projects. `upgrade --from` run from any folder in a project upgrades that project, the nearest folder whose package.json declares an Astryx package or that an Astryx workspace lists, found without passing a repository root or counting the home folder: it scans the project's `src` by default, reads a `--path` you type from the folder you ran in, names the files in its `--json` result relative to that folder, and refreshes the project's agent docs. It targets only the project's own Core: the one in its `node_modules`, or for a member its workspace lists, the one the workspace installs. With no such project, `upgrade` reads only the current folder, as before. A `packages/core` folder that holds another package is no longer read as Core, and an integration named in `astryx.config` now loads when the workspace installs it at its root, as an autolinked one already did.

@josephfarina
