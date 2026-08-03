---
'@astryxdesign/core': patch
---

[feat] Markdown: expose per-block spacing to theming. Every block type now renders a stable theme target — `astryx-markdown-heading`, `-paragraph`, `-list`, `-codeblock`, `-blockquote`, `-table`, `-hr`, and `-image` — so a theme can tune the gap around any block (`marginBlockStart`/`marginBlockEnd`) via `defineTheme` instead of overriding global spacing tokens or reaching for fragile `[role="paragraph"]`-style descendant selectors. Each target reflects `data-density` (so spacing can differ per `default`/`compact`), and the heading target additionally reflects `data-level` (1–6) for per-level spacing. Targets apply only to the default render path — a custom `components.heading`/`code`/`blockquote`/`hr`/`image` continues to own its own styling. Purely additive — default rendering is unchanged.

@freddymeta
