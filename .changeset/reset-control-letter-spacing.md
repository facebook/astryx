---
'@astryxdesign/core': minor
---

[breaking] Under `reset.css`, form controls (`button`, `input`, `optgroup`, `select`, `textarea`) now inherit `letter-spacing` from their parent, as they already inherit its font and color. The browser's stylesheet sets `letter-spacing: normal` on them, and `letter-spacing` is not part of `font`, so text in a control ignored any tracking set on its container. A page with letter-spacing on a container of native controls now sees it in those controls too.

To keep the old spacing, set `letter-spacing: normal` on the controls. There is no codemod: whether a page relies on controls ignoring their container's tracking cannot be read from its source.

@vjeux
