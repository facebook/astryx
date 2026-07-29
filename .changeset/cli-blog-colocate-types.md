---
'@astryxdesign/cli': patch
---

[refactor] CLI: colocate the `blog` command's types with its API — `api/blog/blog.type.mjs` is now the source of truth for `BlogPost`/`BlogListData`/`BlogDetailData`/`BlogListResponse`/`BlogDetailResponse`, and the leaves' `@returns` reference it directly ("functions own their types"). `types/blog.d.ts` re-exports the colocated typedefs, so the `@astryxdesign/cli/api` public surface is unchanged. Types-only reorg — no runtime change (the `.type.mjs` is an empty module at runtime). First step of the Phase 3 type-colocation migration (piloted on blog); JSDoc→`.d.ts` generation + the `exports` flip land in a follow-up.
@josephfarina
