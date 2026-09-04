---
'@astryxdesign/cli': patch
---

[fix] A thin `build` kit now says what to try instead of looking empty.

`build "quantum flux capacitor telemetry"` returned one incidental component and the always-on frame list, and said nothing else. An agent reading that does not conclude its wording was wrong — it concludes the package has nothing and falls back on its own memory of what Astryx contains, which is the failure `build` exists to prevent.

Below three offerable results the kit carries a `hint` naming the two commands that browse rather than search, and saying plainly that this is keyword matching, not semantic. The threshold counts what SURVIVED the score floors, not what search returned: `hasResults` is already true for a query that matched things and then filtered them all out, and that is the case most likely to be misread.

`hint` is structured — `{reason, commands}` with bare subcommands — not a sentence with commands baked into it. The API cannot know how a project invokes the CLI, and a hardcoded `astryx component --list` does not resolve in a pnpm workspace, where every other command in this output renders as `pnpm exec astryx`. The renderer formats them through `formatCliCommand`, so they are runnable as printed, and a JSON caller gets the parts rather than prose to re-parse.

`hint` is present only when it applies, so a healthy kit is byte-identical to before. The CLI renders it last, as a `FEW MATCHES` section listed in the legend's section order, so it is the line the reader leaves with.

Split out of #5320 at review request. Public response doc (`build.doc.mjs`) and the `BuildKitResponse` type both updated.

@josephfarina
