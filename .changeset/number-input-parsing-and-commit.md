---
'@astryxdesign/core': patch
---

[fix] NumberInput parses locale-formatted paste safely and commits one complete draft: grouped numbers and machine decimal points work, arbitrary repeated punctuation is refused, out-of-range values clamp to the nearest bound, and fractional stepping cannot cross a rounded bound (#5152, #5450, #5459, #5510, #5546)

Invalid typed or pasted input preserves the prior value instead of committing a valid prefix. Pagination inherits the complete-draft and bound behavior, while inline Table filtering and PowerSearch keep their existing live and Enter-to-save behavior.

@cixzhang @jiunshinn
