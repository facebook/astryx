---
'@astryxdesign/cli': patch
---

[feat] Improve `astryx build` output into a complete composition kit.

`build "<idea>"` now returns an agent-ready kit grouped by role: a START line
(scaffold vs compose), the closest PAGE template, an always-on FRAME (page
shell) and FOUNDATION (layout/typography/action primitives), idea-specific
BLOCKS and DOMAIN COMPONENTS (with a relevance floor to cut noise), and a SETUP
reminder. The always-on FRAME/FOUNDATION groups fix low recall of the
structural primitives every page needs but that never keyword-match an idea
(measured: component recall 15% to 71% on an agent-grounded eval).
@joeyfarina
