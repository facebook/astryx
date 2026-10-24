---
'@astryxdesign/core': patch
---

[feat] A Lightbox gallery now pages the way the iOS Photos viewer does. On a touch screen, drag or flick between items: the row follows your finger, and the release lands on the next or previous item, one at most. A gap of 40 px separates the items while they move. A zoomed photo pans with your finger until it reaches its edge; a new drag from that edge moves to the next item. A photo you leave zoomed returns to its fitted size once the gallery rests. The previous and next buttons and the arrow keys slide to the item instead of swapping it in place.

Each item's caption now moves with its item, and the gallery fills the viewer on every screen, so the viewer keeps its size from item to item. `onIndexChange` also reports a swipe. A mouse still moves between items with the buttons and arrow keys.

@vjeux
