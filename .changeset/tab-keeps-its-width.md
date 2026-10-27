---
'@astryxdesign/core': patch
---

[fix] A `Tab` in the default `hug` layout no longer shrinks below its label. On a narrow screen the strip's flex shrank every tab before overflow could scroll, so the labels drew over one another ("Transactions" over "Statements" at 362px). Each hugging tab now keeps its width and the strip scrolls, as its overflow handling intends; `fill` tabs still share the strip.

@light-merlin-dark
