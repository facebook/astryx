---
'@astryxdesign/cli': patch
---

[fix] `gap-report` fails when a listed integration cannot load, instead of reporting a clean result.

An integration whose `astryx.integration` module throws on import or fails
validation was left out of the handler set. With no other handler, the report
fell through to the built-in GitHub fallback for Core: the command exited 0
with `consent_required`, printed nothing on stderr, and offered
`--confirm-public` to file on Core's public tracker a report the integration
might have been meant to receive.

The unloadable integration now records a failed delivery in its config
position, with the load error and the fix in its message. Like any handler, it
turns the fallback off, so the report never goes to another package's tracker.
The command exits 1, and a failed or partial report now prints each failed
delivery on stderr as well as in the receipt.

@josephfarina
