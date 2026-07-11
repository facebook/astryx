---
'@astryxdesign/cli': patch
---

[fix] `runCodemods` now returns `writtenFiles`, so `astryx upgrade`'s post-codemod hooks (prettier/eslint formatting) actually run on core-codemod changes.

The runner built the `writtenFiles` list internally but omitted it from its return object, so `upgrade.mjs` read `codemodResult.writtenFiles ?? []` as always-empty and the configured `hooks.postCodemod` (e.g. `prettier --write`, `eslint --fix`) received no files and silently skipped. As a result, jscodeshift's default double-quote output (`"@astryxdesign/core/Button"`) was never reformatted to the project's style, failing `prettier-format` lint on migrated apps. The sibling `integration-runner` already returned `writtenFiles` correctly, so integration-codemod changes were formatted while core-codemod changes were not.

@ejhammond
