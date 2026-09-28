---
'@astryxdesign/cli': patch
---

[fix] `doctor` no longer claims a built theme is fresh when it has not established that, and no longer compiles anything to find out.

The freshness check asked one question — is the theme entry newer than the artifact? — and treated "no" as proof. It is not proof. A theme imports its tokens, so editing a token leaves the entry's mtime untouched: `doctor` reported green while `theme build --check` exited 1 on the same tree. And when the entry _was_ newer, the check recompiled to be sure, which means jiti executing the theme and its whole import graph with a filesystem cache — code execution and a write, from a command whose contract is read-only.

`theme build` now records a digest over every local file a theme is compiled from, and `doctor` verifies freshness by reading and hashing those same files. No module is loaded, nothing is written, and a changed import is caught because it is part of the input set. Where that proof is not available — an artifact built by an older CLI, or an input graph that could not be walked completely — the check reports exactly that and points at `theme build --check`, rather than passing. Fail closed: "no evidence" must not render as "fine".

Every input is accounted for, none assumed harmless. A relative import is content-hashed. A bare specifier is resolved and classified: a package is classified by how it RESOLVES, not by its version string: one that really lives under `node_modules` is immutable in place and is fingerprinted `name@version`; one whose symlink escapes `node_modules` is live linked source and is content-hashed. The version cannot make that call — a workspace package carrying a normal `1.2.3` is still live source, and treating it as immutable left the digest unmoved while its tokens changed. Treating bare specifiers as out of scope was wrong and measurably so: a changed workspace token package left the digest identical, so `doctor` reported "in step with source", the same false green this change exists to remove. Anything unresolvable, or a computed `import()` or `require()`, yields no digest rather than one that silently omits an input.

Caught by building a real app rather than another unit test: import-shaped prose is not an import. Core's `<Theme>` prints a performance hint whose text contains an example `import '@astryxdesign/theme-<name>/theme.css'`. The walk read those two lines as unresolvable specifiers, marked the input graph incomplete, and suppressed the digest — so every real build recorded `Inputs: unverifiable` and freshness could never verify anything. The whole check was inert in practice while every unit test passed. Template-literal contents are now blanked before specifiers are read; plain quoted strings are untouched, because that is where a real specifier lives.

Verified end to end against a built app: edit an imported token and doctor fails; touch the artifact so it looks newest and it still fails; rebuild and it passes; wire the build into predev and staleness drops to info; point predev at a different theme, or drop its argument, and it fails again.

The first version of that fix over-corrected: blanking template CONTENTS swallowed `${require('./tokens')}`, which is a real dependency, so the digest stopped moving when tokens changed — a stale theme reported as current, the opposite false green. Template TEXT is prose and is blanked; `${...}` is code and is kept.

`doctor` also returned "no built theme output found" without checking whether the walk had finished. A project whose theme sits past the directory bound got the reassuring skip message while the remainder was never examined; that case now warns.

@josephfarina
