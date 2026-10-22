---
'@astryxdesign/cli': patch
---

[fix] The agent guide that global mode writes to the home folder now says what to do when `astryx` is not found: run the command that installed the CLI for the computer first, with the same package manager and folder, such as `npm i -g @astryxdesign/cli` or `pnpm add -g @astryxdesign/cli`. On machines that keep the home folder but reset system folders on restart, the guide outlived the CLI installed for the computer and told agents to run a command that was gone. Outside a project, when the guide names `astryx` and no `astryx` command is on the search path, apart from a package runner's own copy, `astryx doctor` now says so and names the install step the guide records, or npm's when it records none. The global-mode guide for CI and containers explains how to keep the CLI across restarts. A guide written for a host's own command is unchanged. No JSON shape or exit code changes.

@josephfarina
