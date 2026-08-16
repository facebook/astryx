---
'@astryxdesign/core': patch
---

[fix] Banner names its dismiss control after the banner it closes. Stacked banners — one per failed operation, say — gave a screen-reader user a run of identical "Dismiss, button" nodes with nothing to tell them apart, and `isDismissable` being a boolean left no way to qualify the name. The accessible name is now "Dismiss {title}" whenever `title` is a string, from the new `@astryx.banner.dismissTitled` message, so the common case is fixed without any consumer opting in. The new `dismissLabel` prop overrides it for a `title` that is not plain text. The visible tooltip still reads "Dismiss".

@cixzhang
