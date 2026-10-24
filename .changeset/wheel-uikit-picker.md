---
'@astryxdesign/core': patch
---

[fix] The picker wheels in the TimeInput, DateTimeInput and DateInput bottom sheets now look and move like iOS's own picker. The rows sit on a cylinder seen in perspective, with one capsule band across every column and the row inside it magnified. A flick coasts at UIKit's deceleration onto the row UIKit's projection picks. A finger landing on a moving wheel stops it. A tap on a row turns it onto the band. Past the first or last row, a drag rubber-bands and the wheel bounces back. As on iOS, the value commits when the wheel comes to rest, and the coast keeps running while the page's main thread is busy. Arrow keys and clicks on a row still commit at once.

@vjeux
