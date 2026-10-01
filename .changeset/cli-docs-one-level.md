---
'@astryxdesign/cli': patch
---

[feat] In text, `astryx docs <topic>` lists the topic's sections when it has more than one. (#6626)

Read one with `astryx docs <topic> <section>`, or print the whole topic with `--full`. `--dense` still prints the whole dense doc, so the agent bootstrap in AGENTS.md reads the same as before. The JSON contract is unchanged: `astryx docs <topic> --json` and `docs(topic)` in `@astryxdesign/cli/api` still return the whole topic (`docs.detail`), and `--index` returns its section list.

@josephfarina
