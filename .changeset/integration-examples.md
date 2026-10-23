---
'@astryxdesign/cli': patch
---

[feat] `doctor integration validate`, and so `integration check`, lists what a package's examples need to work everywhere they are shown, as notes for the next minor release (`integration check --strict --next` fails on them now): (#7891)

- `component_without_example`: a published component that no block template shows with `exampleFor: '<Name>'` and `isShowcase: true` (or `alsoShowcaseFor`). A block named like a showcase that sets neither does not count. Hidden docs, family members, docs with `isHiddenFromOverview` and `Utility` components are exempt. The note carries a template doc to paste.
- `template_category`: a template `category` written as a path, such as `components/X`, with a `"<Group> - <Variant>"` one to write.
- `showcase_not_standalone`: a showcase (a block with `isShowcase: true` or `alsoShowcaseFor` names) that imports what a browser cannot load (`server-only`, `next/headers`, `next/server`, `next/cache`, a Node built-in) or reads `process.env` past `NODE_ENV`. Type-only imports and comments don't count, and live data through the app is fine.
- `template_asset_not_packed`: a file or folder a template loads with `new URL(…, import.meta.url)` that does not exist, sits outside the package, or that npm leaves out of the package: by `files` in package.json (the note names a `!` entry that excludes it), or by a `.npmignore` or `.gitignore` line (the note names the line). What `npm pack --dry-run` packs decides; when npm cannot answer, an asset it may pack is listed under `data.exampleAssets` as not checked.

@josephfarina
