---
'@astryxdesign/cli': patch
---

[fix] Make `foundation/` a true bottom layer: it no longer imports `api/`, and ESLint now enforces that direction alongside the existing `authoring/` and `api/` rules.

Two things were reaching upward. `Project` pulled template discovery out of `api/template`, whose adapter imported `Project` straight back — so the module cycle ran across the layer boundary. And both `Project` and `integration-warnings` imported `validateLoadedIntegration` from the `validate-integration` command.

Neither was really misplaced logic, just misplaced files: the template adapter had no `api/` imports at all, and the contribution validators are shared infra that foundation itself runs. The adapter now lives at `foundation/discovery/template-adapter.mjs` and the validators at `foundation/integrations/validate-contributions.mjs`, so both sit with their callers.

To be precise about what did and did not change: `Project` and the template adapter still import each other, so the module cycle itself remains — it is simply contained within foundation now instead of spanning two layers. The redundant nested `Project.load()` inside integration-template discovery, and `Project.templates()` filtering those integration templates back out, are also untouched. Both are worth cleaning up, but doing so would change behavior, and this change is deliberately behavior-preserving.

Internal only — no public API change, and no behavior change: the CLI's observable surface (help, command output, error paths, exit codes) is byte-identical across 84 invocations.
@josephfarina
