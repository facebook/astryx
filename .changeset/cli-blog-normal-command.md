---
'@astryxdesign/cli': patch
---

[feat] CLI: `blog` is now a normal, agent-facing command — it appears in `--help` and the capability manifest and supports `--json` (emitting `blog.list` / `blog.detail` envelopes), instead of being hidden. Human output is unchanged; the reader still consumes the public RSS feed. Also scriptable through the `./api` barrel as `blog(slug?)`.
@josephfarina
