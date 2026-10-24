---
'@astryxdesign/core': patch
---

[fix] A BottomSheet drag follows the finger the way an iOS sheet does. The sheet stays exactly under the finger between detents, instead of being pulled toward a nearby detent in the last 40 px; the release picks where it lands. Pulled up past its tallest detent it holds still rather than stretching, as iOS sheets do.

@vjeux
