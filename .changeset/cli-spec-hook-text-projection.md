---
'@astryxdesign/cli': patch
---

[fix] `astryx hook <name>` text output no longer lists block templates that the `--json` envelope does not carry. It now names the related components and points to `astryx component <name> --blocks`, which returns their block templates as JSON. (#6537)

@josephfarina
