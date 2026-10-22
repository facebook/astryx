---
'@astryxdesign/cli': patch
---

[fix] `astryx component <Member> --package @astryxdesign/core` now answers with that member, as the unscoped lookup does. A Core component documented in its family's doc (HStack and VStack in the Stack doc) used to come back as the family doc, named after the family and with no props.

@cixzhang
