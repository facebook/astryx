---
'@astryxdesign/cli': patch
---

[feat] Every command now reports what it returned in its debug logs, and a new command cannot skip it.

A command's action returns a `CommandResult` — either `{kind: 'results', count, resultKind, ...}` or `{kind: 'none'}` for the commands whose work is an effect (build, init, upgrade, doctor). The CommandDoc converter records it centrally, so `resultCount`, `emptyResult`, `resultKind`, and `directMatch` are now populated for `component`, `docs`, `hook`, `template`, `theme list`/`add`/`targets`, `discover`, `blog`, `swizzle --list`, `upgrade --list`, `layout grammar`, and `manifest`, not just `search` and `build`. `resultKind` gains `theme`, `integration`, `migration`, `command`, and `none`; a null now means the run never reached an answer rather than "this command has nothing to say".
@josephfarina
