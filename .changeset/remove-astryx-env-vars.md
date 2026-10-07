---
'@astryxdesign/cli': minor
---

[breaking] Stop reading the Astryx-owned agent variables ASTRYX_AGENT_ID, ASTRYX_AGENT_SESSION_ID, and ASTRYX_AGENT_METADATA
@josephfarina

The CLI must not define or read an Astryx-owned environment variable (spec:AST-017 FR14). The theme-import change already stopped reading ASTRYX_THEME; these three were the last. A test now fails on any `process.env.ASTRYX_*` read in the CLI source.

Classification: incompatible-fix. IFIX-0001 / CLN-0007.
Authority: spec:AST-017 FR14 (current): "The CLI MUST NOT define or read an Astryx-owned environment variable."
Released victim: published 0.6.5 reads ASTRYX_AGENT_ID, ASTRYX_AGENT_SESSION_ID, and ASTRYX_AGENT_METADATA to attribute debug events to an agent and its session.
Migration: set `AGENT` and `AGENT_SESSION_ID`, which the CLI already reads, instead of the Astryx-prefixed variants. ASTRYX_AGENT_METADATA has no replacement variable.
