---
'@astryxdesign/cli': patch
---

[refactor] CLI — the public `@astryxdesign/cli/api` type surface is now generated from the runtime JSDoc, and the injectable logger is consolidated into one `Logger`.

Consumer-visible changes to `@astryxdesign/cli/api` (types only — runtime imports are unchanged):

- **Precise return types.** `component`, `docs`, `blog`, `discover`, `build`, `swizzle`, `upgrade`, `init`, and `themeBuild` previously resolved to `Promise<any>`; they now return their precise `{ type, data }` response unions. Code that leaned on `any` may surface new (correct) type errors.
- **Response types are now exported by name** — e.g. `ComponentDetailResponse`, `SearchResponse`, `UpgradeRunResponse` — alongside `themeAdd`/`themeList`/`listThemes` and a new shared `logger` value + `Logger` type.
- **Breaking:** the per-command return-union aliases `ComponentResult`, `DiscoverResult`, `DocsResult`, `HookResult`, and `TemplateResult` are no longer exported. Use `Awaited<ReturnType<typeof component>>` (still works), or import the member response types directly.

Internally, the three divergent loggers (`CliLogger`, `InitLogger`, `ThemeBuildLogger`) collapse into one `Logger`; the logger was never part of the public type surface, so this is transparent to callers.

@josephfarina
