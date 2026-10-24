---
'@astryxdesign/core': patch
---

[experimental] The `uikit` table in `@astryxdesign/core/motion/experimental` gains the navigation values the lab NavigationStack runs on, each measured on iOS 26.2: `navigation.contentPopHysteresis` (the content back swipe's 27 pt start), `navigation.interactivePopVelocitySamples` (the release velocity averages the last 3), `springs.navigationBackButton` (the chevron's fade) and `springs.navigationCoveredTitle` (the covered title's slide). The catalog gains `@astryx.navigationStack.back`.

@vjeux
