---
'@astryxdesign/cli': patch
---

[fix] New ASTRYX_NO_PROJECT_CODE=1 gate for running the CLI in checkouts you don't trust (CI, triage, agent runs): a present astryx.config.* is acknowledged and skipped instead of executed, and every other workspace-module import (integration manifests, doc modules, codemods) refuses with an error naming the variable. Default behavior is unchanged.

@bhamodi
