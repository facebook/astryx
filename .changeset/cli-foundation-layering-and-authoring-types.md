---
'@astryxdesign/cli': patch
---

[fix] CLI internals: a true `foundation/` bottom layer, and generated `./authoring` types (#4736).

`foundation/` no longer imports `api/`, and ESLint now enforces that direction alongside the existing `authoring/` and `api/` rules. Two things were reaching upward: `Project` pulled template discovery out of `api/template`, whose adapter imported `Project` straight back, and both `Project` and `integration-warnings` imported `validateLoadedIntegration` from the `validate-integration` command. Neither was misplaced logic, just misplaced files — the adapter now lives at `foundation/discovery/template-adapter.mjs` and the validators at `foundation/integrations/validate-contributions.mjs`. To be precise: `Project` and the template adapter still import each other, so that module cycle remains, contained within foundation instead of spanning two layers. Behavior-preserving — the CLI's observable surface is byte-identical across 84 invocations.

The published `./authoring` type declarations are now generated from their JSDoc instead of hand-written, the same way `./api` already works. The 13 hand-maintained `.d.mts` files are gone; `scripts/sync-api-types.mjs` emits both trees at `prepack`, stamped `@generated`. A hand-written declaration shadows the JSDoc in its `.mjs`, so it could disagree with the implementation and still compile — and both failure modes had shipped: a missing declaration made a strict consumer resolve that parser as `any`, and a stale `parseDoc` return union silently dropped `SchemaDoc`, `CommandDoc` and `EnumDoc`. Also fixes `parseFunction`, a bare re-export of `parseHook` that published `HookDoc` instead of the general `FunctionDoc`.

@josephfarina
