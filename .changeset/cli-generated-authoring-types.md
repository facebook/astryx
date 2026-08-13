---
'@astryxdesign/cli': patch
---

[fix] Generate the published `./authoring` type declarations from their JSDoc instead of hand-writing them, the same way `./api` already works. The 13 hand-maintained `.d.mts` files are gone; `scripts/sync-api-types.mjs` now emits both trees at `prepack`, stamped `@generated`.

A hand-written declaration shadows the JSDoc in its `.mjs`, so it could disagree with the implementation and still compile. Both failure modes had shipped: a missing declaration made a strict consumer resolve that parser as `any`, and a stale `parseDoc` return union silently dropped `SchemaDoc`, `CommandDoc`, and `EnumDoc` — so consumers could not narrow a parsed doc to those kinds. Generation makes both impossible: `tsc` now rejects a `@returns` that disagrees with the code before a declaration can even be emitted.

Also fixes `parseFunction`, which was a bare re-export of `parseHook` and therefore published `HookDoc` as its return type instead of the general `FunctionDoc`. It is now a thin typed wrapper; runtime behavior (including error message prefixes) is unchanged.

The published `./authoring` surface is now covered by the same end-to-end pack-and-typecheck CI gate as `./api`.
@josephfarina
