---
'@astryxdesign/cli': patch
---

[feat] Integrations installed for the computer. An integration package installed in the same place as the CLI installed for the computer (`npm i -g`, `pnpm add -g`, `yarn global add`, or `bun add -g` beside `@astryxdesign/cli`), or installed with the CLI in one package set by a tool that runs it, is a computer-level integration. Outside a project, it loads the way a project's integrations do: its components, templates, docs, themes, discover source, and `cliCommand` apply, with the same validation, and one whose `@astryxdesign/core` or `@astryxdesign/cli` peer range excludes the CLI's release is skipped. pnpm 11 and later, which give each global package a folder of its own, count every one of those folders. Inside a project, only the project's own integrations load: a computer-level one adds nothing there, and `astryx discover` lists it under `meta.available` with source `installed for this computer` and the project's install command in `install`, when its peer range admits the project's release and it loads. A project that installs the same integration uses only its own copy. `astryx doctor` adds a `computer-integrations` check: outside a project, each one it uses, each the folder replaces with its own copy, and a warning for each it skips or cannot load; inside one, the ones the project could add.

@josephfarina
