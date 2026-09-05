---
'@astryxdesign/core': patch
---

[fix] ChatComposerInput no longer discards a pending draft when you click the
composer's padding and press ArrowUp. Focusing a contentEditable collapses the
caret to the start of the draft, which is the one position where ArrowUp means
"recall history", so the first ArrowUp after that click replaced what you had
typed. The composer now places the caret after the draft when it focuses
itself — clicking the space after the text means "put me there" — so ArrowUp
moves the caret with a draft present and still recalls history when the
composer is empty. Multi-line caret navigation is unchanged.

@cixzhang
