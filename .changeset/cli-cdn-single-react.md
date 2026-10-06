---
'@astryxdesign/cli': patch
---

[fix] Enforce one React instance across every Astryx esm.sh import in the no-build CDN recipes.

The generated starter now renders a theme-provided semantic icon, and its browser smoke test verifies that icon loads without a second React copy.

@ejhammond
