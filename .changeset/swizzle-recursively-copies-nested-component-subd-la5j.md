---
'@astryxdesign/cli': patch
---

[fix] `swizzle` now recursively copies a component's nested source subdirectories (#3506). The copy loop read the component directory non-recursively and skipped anything that was not a file, so a component whose source is split across subfolders ejected broken: `swizzle Table` reported 17 files copied while the entry barrel still re-exported 15+ modules from a `plugins/` directory that was never written, failing module resolution (TS2307) on first build. The overwrite pre-flight and the reported file list shared the same blind spot, so consumer edits inside a nested path were clobbered without the usual `ERR_FILE_EXISTS` refusal and the receipt never mentioned nested files.

One recursive walk now feeds all three: the pre-flight conflict check, the copy, and the receipt's `files` list (paths relative to the output directory, e.g. `plugins/selection/index.ts`). Import rewriting is depth-aware: a nested file's `../` chain is only rewritten to the owner package once it climbs past the component root, so `plugins/selection/x.tsx` keeps `../../types` relative while `../../../Icon` still becomes `@astryxdesign/core/Icon`. Directories are created per copied file, so a directory whose contents are all excluded (`__tests__/`, `__snapshots__/`) never appears in the output. `swizzle Table` now ejects 47 files (17 top-level + 30 nested) and every relative import in the output resolves.

@jiunshinn
