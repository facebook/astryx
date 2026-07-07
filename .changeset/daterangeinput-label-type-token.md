---
'@astryxdesign/core': patch
---

[fix] DateRangeInput: use the label type-size token for the trigger field. The trigger was reading the body size/leading tokens (`--text-body-size`/`--text-body-leading`) instead of the label ones (`--text-label-size`/`--text-label-leading`), so its text rendered a step larger than the other date inputs. (#3655)
@cixzhang
