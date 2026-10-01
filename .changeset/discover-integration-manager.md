---
'@astryxdesign/cli': patch
---

[feat] `astryx discover` browses integrations: the ones a project has and, through discover sources, the ones it could add, with every version and what each one adds. It searches every kind of item and filters with `--type`, `--installed`, `--available`, and `--limit`. A project sets a source as `discover` in `astryx.config`, and an integration exports one as a `discover` named export. Discover only reads: it prints the command that adds a package and never runs it. Existing `--json` fields keep their meaning. A free-text query now always lists its matches, even an exact component name, and `astryx discover <package>/<Name>` opens one.

@josephfarina
