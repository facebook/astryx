---
'@astryxdesign/core': patch
---

[fix] Increase trailing padding on `ChatLayoutScrollButton` when a label is shown
@cixzhang

With a label (e.g. "New messages"), the chevron icon sits on the leading edge
and the text on the trailing edge. The symmetric inline padding left the label
text cramped against the pill's rounded corner. The trailing inline padding is
now widened when a label is present, giving the text comfortable breathing room
from the rounded edge. The icon-only (collapsed) state is unchanged and stays
balanced.
