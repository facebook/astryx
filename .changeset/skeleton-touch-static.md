---
'@astryxdesign/core': patch
---

[feat] On a touch screen, Skeleton rests still instead of pulsing, as iOS placeholders (SwiftUI's redacted views) do, at the pulse's top step: about the weight of SwiftUI's placeholder, where the 0.25 rest is barely visible on a phone. With a mouse or trackpad the pulse is unchanged. Reduced motion still stops the pulse everywhere; on a touch screen the still rest stays at the pulse's top step under it.

@vjeux
