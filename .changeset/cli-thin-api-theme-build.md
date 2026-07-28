---
'@astryxdesign/cli': patch
---

[feat] CLI: `theme build` is now fully scriptable through the `./api` barrel — the ~1,000-line theme compiler (defineTheme extraction, CSS generation via `@astryxdesign/core/theme`, variant/type-declaration + icon-module generation, override validation) lives in `api/theme/build` and returns a typed `theme.build` receipt, with the CLI reduced to a thin parse → API call → render wrapper. Human progress is emitted through an injectable logger, so a scripted `themeBuild()` stays silent while the generated CSS/JS/.d.ts, the `--json` envelope, and human output stay byte-identical for existing usage. Watch mode remains a thin CLI loop.
@josephfarina
