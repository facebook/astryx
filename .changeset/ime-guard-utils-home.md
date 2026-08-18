---
'@astryxdesign/core': patch
---

[chore] `isImeKeyEvent` — the guard that stops an IME composition keystroke being read as a command — now lives at `@astryxdesign/core/utils` alongside the other pure helpers, with the reasoning for its two signals written down in one place. It stays exported from `@astryxdesign/core/hooks` for this release but is deprecated there: it is a plain predicate, not a hook, and that barrel is a `'use client'` boundary, so importing it from `hooks` pulls a server-safe function onto a client path. Move imports to `@astryxdesign/core/utils`; the `hooks` re-export will be removed in an upcoming major (#4907).

@nynexman4464
