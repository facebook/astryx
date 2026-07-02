---
'@astryxdesign/core': patch
---

[fix] TimeInput/DateTimeInput: parse dotted meridiems correctly. "2:30 p.m." was silently accepted as 02:30 and "12 a.m." as noon because the meridiem-detection regex did not allow the dots that the AM/PM regexes accept; hasMeridiem is now derived from those regexes so they cannot drift (#3462)
@arham766
