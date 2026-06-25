---
'@astryxdesign/cli': patch
---

[feat] Make generated agent docs build-first and restructure `init` output.

The generated `CLAUDE.md` now leads with the `build` workflow (search reframed as
a neutral universal find), and includes a required-CSS setup note
(`reset.css` + `astryx.css`) so components never render unstyled. `init` now
points agents at `astryx build`/`astryx search` instead of dumping page-template
names.
@joeyfarina
