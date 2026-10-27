---
'@astryxdesign/cli': patch
---

[docs] The theme authoring guide says an extending theme's `motion` inherits field by field: the fields the child sets regenerate their duration tokens, and `slow` or `easing` left unset keep the base theme's values. It used to say the child's motion config replaced the base's entirely.

@cixzhang
