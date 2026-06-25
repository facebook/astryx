---
'@astryxdesign/cli': patch
---

[feat] Densify agent docs + tailor styling guidance to the project's configured system

Tightened the generated `CLAUDE.md`/`AGENTS.md` block from ~48 lines to ~26
(the per-topic `docs` dump collapsed to one line, `build`/`search`/`component`
no longer duplicated between workflow and reference, run-prefix stated once,
filler prose removed) — same information, far denser.

`init`/`agent-docs` now detect whether the consumer project has the StyleX
compiler, Tailwind, or neither, and write the matching custom-styling guidance
into the generated `CLAUDE.md`/`AGENTS.md`:

- StyleX compiler wired → `xstyle` / StyleX token imports
- Tailwind → utility classes backed by `@astryxdesign/core/tailwind-theme.css`
- neither → `style`/`className` with `var(--token)` design tokens, plus an
  explicit note NOT to use `xstyle`/utilities (they would not compile)

Previously the docs hardcoded "use the xstyle prop," which throws at runtime
(blank page) in a plain Vite app with no StyleX compiler, and ignored the
Tailwind bridge entirely. Also corrects the token prefix in the theme rule
(`--astryx-color-*` → `--color-*`).
@joeyfarina
