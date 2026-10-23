---
'@astryxdesign/cli': patch
---

[feat] Docs can write commands so every reader sees their own: `{@command docs theme}` for an Astryx command, `{@pm install @acme/widgets --dev}` for a package-manager step, and `{@pm-only npm "<reason>" pkg set name=x}` for a step only one package manager can do. The CLI shows each one with the reader's runner and package manager (npm, pnpm, Yarn 1, Yarn 2 and newer, or Bun), and `{@@…}` shows a token as written. `astryx docs authoring/building-blocks/docs/doc-syntax` documents them. `doctor integration validate` lists each command a topic writes for one package manager (`package_manager_command`), bare (`plain_command`) or with a runner (`runner_command`), and each token that does not parse (`doc_token`), each with the token to write. (#7868)

`integration check --next` counts the findings the next minor release turns into warnings, the notes marked `next`, as warnings now, so `--strict --next` fails on them. Every run says how many there are. Without `--next`, `integration check --strict` exits as before.

@josephfarina
