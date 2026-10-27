---
'@astryxdesign/core': patch
---

[feat] Under a finger, on every touch device, the picker wheels in the TimeInput, DateTimeInput and DateInput bottom sheets now move like UIPickerView. A flick coasts at UIKit's deceleration onto the row UIKit's projection picks. A finger landing on a moving wheel stops it. A tap on a row turns it onto the band. Past the first or last row, a drag rubber-bands and the wheel bounces back. As on iOS, the value commits when the wheel comes to rest, and the coast keeps running while the page's main thread is busy. Arrow keys and clicks on a row still commit at once. Under reduced motion a flick still coasts, as scrolling does; a tap, a key or a slow release cross-fades onto its row. `presentation="popover"` keeps the previous surface; no value keeps the native-scroll column under a finger. With a mouse the wheels keep today's column.

@vjeux
