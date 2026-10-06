---
'@astryxdesign/cli': patch
---

[feat] Point at `discover` where people look for things to add

Nothing an agent reads named `discover`, so agents asked to find a theme
searched the package registry instead. The agent block `astryx init` writes now
lists `discover <words>` (integrations you could add, and the ones you have),
`theme list` ends with `More themes in packages you could add: astryx discover
theme`, and a text search ends with `More in packages you could add: astryx
discover <query>` (except `--type hook`, since no integration adds hooks). JSON
output is unchanged.

@josephfarina
