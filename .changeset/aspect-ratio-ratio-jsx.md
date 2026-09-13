---
'@astryxdesign/core': patch
---

[docs] AspectRatio: show the `ratio` prop in its JSX form (#6093)

The best-practice line told readers to express the ratio as a fraction like `16/9` without showing it in JSX, and nothing else in the CLI output gives `ratio` an example. Rewrites it to `ratio={16 / 9}` and names the string form as a type error.

@Kyujenius
