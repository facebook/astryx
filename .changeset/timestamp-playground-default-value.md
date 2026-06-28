---
'@astryxdesign/core': patch
---

[docs] Restore the Timestamp properties-tab preview on the docsite. `value` is a required prop with no semantic default, so the preview rendered "Invalid time value"; it now seeds a valid ISO 8601 date (#2877)
@cixzhang
