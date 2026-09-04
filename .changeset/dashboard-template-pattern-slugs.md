---
'@astryxdesign/cli': patch
---

[fix] Rename five dashboard page template catalog slugs to reusable pattern names, per the naming convention in Contributing Templates: `dashboard-data` → `dashboard-comparison`, `dashboard-executive-summary` → `dashboard-scorecard`, `dashboard-portfolio` → `dashboard-composition`, `dashboard-project-status` → `dashboard-progress`, and `dashboard-service-monitoring` → `dashboard-alert-rail`. Each old slug named the data or task rather than the reusable pattern, so it under-served neighbouring requests: the composition-over-time shape is not specific to portfolios, and the alert-rail shape is not specific to service monitoring. The old slugs no longer resolve because catalog lookup is exact-match; use the new current-catalog values above. The `template` command and machine-readable schema are unchanged.

Two categories move with their slugs: `dashboard-comparison` takes `Dashboard - Comparison` (it previously shared `Dashboard - Analytics` verbatim with the `dashboard` template, so neither owned the keyword) and `dashboard-scorecard` takes `Dashboard - Scorecard`. Both values are added to the `TemplateCategory` union; the superseded values stay reserved. Domain vocabulary — portfolio, holdings, monitoring, uptime, executive summary — is untouched in each `description`, which is where retrieval actually reads it from.

Also fixes a typo in the scorecard template's `name` field ("Executive Summary Dashoard").

@kentonquatman
