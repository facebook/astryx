---
'@astryxdesign/cli': patch
---

[feat] `astryx docs <namespace> --full --flatten` compiles the namespace and every descendant guide into one document. Descendants keep tree order and nested headings, and `--json` returns the same subtree as structured data. Existing namespace reads remain one level by default.

@josephfarina
