---
'@astryxdesign/core': patch
---

[fix] RadioList: give an unselected radio group a deterministic keyboard tab stop. When focus enters a group with no selected value, the group now normalizes the entry point — first radio when tabbing forward, last radio when tabbing backward — matching the ARIA radio-group pattern. A selected value keeps its native tab stop, and moving between radios inside the group is never redirected. (#3390)
@cixzhang
