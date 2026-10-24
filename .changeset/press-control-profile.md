---
'@astryxdesign/core': patch
---

[fix] Under a finger, a button, card, link or other control now highlights in the frame the finger lands, as UIKit's controls do, instead of after a 150 ms delay; inside a scroller it still waits that delay (a flick paints nothing), and a scroll that takes a held press cancels it with no fade and no click. The release fades over UIButton's 250 ms. List rows (Item, TreeList) keep a list cell's press: the 150 ms delay wherever they are, cancelled by 10 px of travel, released on the deselect clock. `usePressFeedback` takes `{profile: 'cell'}` for a local list row; the default is a control. A mouse on a desktop keeps `:active`.

@vjeux
