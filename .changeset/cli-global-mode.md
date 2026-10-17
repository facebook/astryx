---
'@astryxdesign/cli': patch
---

[feat] Install the CLI once for your computer (`npm i -g @astryxdesign/cli`) and run `astryx` in any folder. In a project, the CLI release equal to the project's `@astryxdesign/core` answers, whichever copy of the CLI you start: a copy hands the run to the project's own CLI when that CLI matches its Core, and otherwise to the matching release, which it installs once into your per-user cache (from the installed Core, else the lockfile, else the declared range). The hand-off keeps the arguments, folder, standard streams, and exit status. Outside a project, the copy installed for your computer answers with the newest release, which it checks for at most once an hour in the background, verifies, and keeps beside the release it replaced; commands that read Core use the Core of the answering release there, installed into the cache when first needed. When the release a run needs cannot be installed, the run fails before writing anything with the new `ERR_VERSIONS_UNAVAILABLE`.

Every successful `--json` result now carries `meta.answeredBy` (`cli`, `core`, `copy`). In text mode, a run answered by anything other than the project's own CLI prints one `astryx: answered by …` line on standard error. Printed commands start with a name that reaches the same release: the project's runner when its own CLI answers, `astryx` outside a project for the copy installed for the computer, and otherwise the CLI package pinned to the answering version (`npx @astryxdesign/cli@0.7.2`). The new `ERR_PROJECT_REQUIRED` code names a command that needs a project. See `astryx docs cli/install-once`.

@josephfarina
