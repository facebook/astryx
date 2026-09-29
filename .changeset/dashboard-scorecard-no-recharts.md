---
'@astryxdesign/cli': patch
---

[fix] The `dashboard-scorecard` page template no longer depends on `recharts`: its comparison and composition charts are now dependency-free inline SVG (with `role="img"`, accessible labels, and point tooltips), so the template installs with zero third-party chart dependencies. It declares `react`, `@stylexjs/stylex`, `@astryxdesign/core`, and `@heroicons/react` in its template metadata. (#6717)
@kiranbadam
