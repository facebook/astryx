---
'@astryxdesign/cli': patch
---

[docs] The integration guides make `integration check --strict` a required step in every integration's build: the quick start installs `typescript@6` (the checks need its JavaScript compiler API, which TypeScript 7 does not ship) and adds "Check it in every build (required)", the Build an integration overview says so, and the checks guide's section reads "Run every check in every build (required)".

@josephfarina
