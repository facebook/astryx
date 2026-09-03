---
'@astryxdesign/cli': patch
---

[feat] CLI: `astryx init --json` now works. It emits the install receipt as a standard envelope — `init.run` with the mode, the features that ran, the agent-doc files written, any soft `docsError`, and the template outcome, or `init.remove` for `--remove-agents`. Human output is suppressed so stdout carries only the envelope, and the exit code is unchanged from human mode.

`init` was the last side-effecting command still refused by the `--json` gate. That gate existed to stop a command writing half a project and only then reporting that `--json` was unsupported; since `init()` already returned a typed receipt, the fix was to emit it rather than to keep refusing. `theme` and `layout` remain off the allowlist, but both are command groups with no output of their own.

@josephfarina
