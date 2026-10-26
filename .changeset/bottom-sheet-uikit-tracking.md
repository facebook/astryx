---
'@astryxdesign/core': patch
---

[fix] A BottomSheet dragged by a finger follows it the way an iOS sheet does: exactly under the finger between detents, instead of being pulled toward a nearby detent in the last 40 px, so the release picks where it lands. Pulled up past its tallest detent, it stretches by UIKit's rubber band, no farther than the space it reserves below. A mouse or pen drag is unchanged.

@vjeux
