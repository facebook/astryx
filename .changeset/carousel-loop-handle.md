---
'@astryxdesign/core': patch
---

[feat] Carousel: add `hasLoop` for wrap-around scrolling (next at the end returns to the start, prev at the start jumps to the end; navigation buttons stay active at both edges) and a `handleRef` imperative handle (`CarouselHandle`) exposing `scrollNext`, `scrollPrev`, `scrollTo(index)`, `canScrollNext()`, and `canScrollPrev()` for programmatic control.
@freddymeta
