---
'@astryxdesign/cli': patch
---

[fix] Report coverage on verbatim phrase matches in CLI search, which were returning without it and failing the published type surface. (#PENDING)

@ernestt

`scoreQuery` declares `{score, reason, matched, total}`, and the top-tier branch added by #5289 — a whole-query match on a name or a declared keyword, promoted above the token-sum path — returned only `{score, reason}`. So the strongest possible hit was also the one hit that told callers nothing about coverage, and `build`, which gates its pages group on exactly that, saw `undefined`. It now goes through the same `asFull` helper as the other whole-phrase branches: a verbatim match on the whole query has answered every concept in it by definition.

This also unbreaks `main`. The mismatch is a type error under `checkJs`, so the "Verify the published CLI ./api type surface" step fails, and with it the `test` check and the Storybook build every PR's visual evidence depends on.
