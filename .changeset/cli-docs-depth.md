---
'@astryxdesign/cli': patch
---

[feat] `astryx docs <route> --depth <levels>` reads as far down the docs tree as you ask, from one doc to everything below it.

`--depth 0` reads only the namespace you name, `--depth 1` adds the docs right below it (what a read without `--depth` shows), and `--depth all` goes to the bottom. With `--depth`, `--detail` sets how much of each doc below shows: `brief` (the default) is one line each, named by where it sits so you can open it, `compact` adds its sections, and `full` prints it whole. So `astryx docs cli --depth all` is a map of every CLI doc, and `astryx docs cli/integrations --depth all --detail full` prints the integration guides as one read. Where a read stops, a namespace says how many docs sit below it. `--json` returns the same tree as `docs.node`: each child carries its own `slots` while the read goes deeper, `childCount` where it stops, and its text at `compact` or `full`. `docs()` takes the same `depth` and `detail` options. Reads without `--depth` are unchanged.

@josephfarina
