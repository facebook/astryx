---
'@astryxdesign/core': patch
---

[feat] CodeBlock: pair add/remove diff washes with `+`/`−` gutter markers, and add `language="diff"`. `highlightLines` now accepts `{line, type}` entries (`'add'`/`'remove'`/`'highlight'`); add/remove lines render success/error washes AND a `+`/`−` marker drawn as an `::after` pseudo-gutter, so the distinction never rests on colour alone (WCAG 2.1 SC 1.4.1) — the same non-colour-affordance approach as AvatarStatusDot (#4143), and range-mode safe (the pseudo never touches the bare text node). `language="diff"` treats `code` as a unified diff: `+`/`-` lines auto-derive add/remove accents, `@@`/file headers dim as metadata, and Copy yields the post-image (the resulting code: context + added lines), tolerating CRLF and the git no-newline sentinel. Plain-number `highlightLines` are unchanged. Builds on #3345/#3351 and answers the two follow-ups in #3351 (markers, `language="diff"`).
@thedjpetersen @cixzhang @ejc3
