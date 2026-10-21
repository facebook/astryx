---
'@astryxdesign/cli': patch
---

[feat] A `{@link <target>}` in a component doc's text now reads as the command that opens its doc, in `astryx component <Name>`, its `--props` view, and component lists, in text and JSON: the description, usage, best practices, anatomy and accessibility notes, and each prop's and example's description. A topic's description reads the same way in `astryx docs`, its list, and the docs tree. Code fields and code ticks show the link as written. A Core component's links resolve against the CLI's docs; an integration's against its own. `astryx doctor integration components` warns on a link in an integration's component docs that names no doc, and `doctor integration docs` does the same for a topic's description. The written-pointer warning also reads component docs and topic descriptions, and each finding now names its `kind` and `field`.

@josephfarina
