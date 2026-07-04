---
'@astryxdesign/core': patch
---

[feat] Popover: expose hasLightDismiss and add hasEscapeDismiss so consumers can opt out of outside-click and Escape dismissal for explicit-dismiss surfaces like onboarding coachmarks. usePopover accepts the same new hasEscapeDismiss option; with it off, no handler is registered on the shared Escape stack so the key falls through untouched (#3287)
@arham766
