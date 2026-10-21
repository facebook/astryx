---
'@astryxdesign/cli': patch
'@astryxdesign/core': patch
---

[feat] An integration can set the command its users run the CLI with: a new `cliCommand` field in `astryx.integration.*`, such as `cliCommand: 'acme astryx'`. In a project that loads that integration, every command the CLI prints starts with it instead of the package-manager prefix (`npx astryx`, `pnpm exec astryx`): next-step hints, errors, suggestions, Doctor fixes, `--help`, the setup reminder, the agent-docs block, and doc text. If two loaded integrations set different commands, neither is used, and the new `cli-command` check in `astryx doctor` warns. An invalid `cliCommand` is ignored with an `invalid_cli_command` warning; the rest of the manifest still loads.

Docs, including an integration's, are now written with bare `astryx ...` commands, and `astryx docs` prefixes them for the project when it prints them. JSON output keeps every command bare, as before. The install-time setup reminder from `@astryxdesign/core` and `@astryxdesign/cli` names the command the project's package manager runs, instead of always `npx @astryxdesign/cli`.

@josephfarina
