---
'@astryxdesign/core': patch
---

[fix] `Slider`: End now reaches `max` and Home reaches `min` even when the step grid does not land on them (for `max={100}` with `step={3}`, End stopped at 99). Arrow and Page key results still snap to the nearest step and then clamp.

@cixzhang
