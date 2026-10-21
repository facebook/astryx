---
'@astryxdesign/cli': patch
---

[feat] Add the `@astryxdesign/cli/host` entry: `runHostedCli` runs the CLI once per process for a tool that carries it, with the command name that tool's users type (printed commands start with it) and, when the tool skipped the project's own CLI, the reason, so that CLI is never run
@josephfarina
