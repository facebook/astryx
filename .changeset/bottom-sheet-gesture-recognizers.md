---
'@astryxdesign/core': patch
---

[fix] BottomSheet's drag runs on the shared gesture recognizers. A drag begins after 10 px of travel and moves the sheet by the travel past that, as UIKit's does. A mouse's release velocity is now the same filter as a finger's (it was the speed over the last 100 ms), and a pointer held still for more than 40 ms before the release throws nothing. A second finger that lands during a drag no longer sends the sheet back to its detent.

@vjeux
