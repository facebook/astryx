---
'@astryxdesign/cli': patch
---

[fix] `theme build` icon detection no longer reads comments as code, and an inline registry is dropped loudly instead of silently. The icon-registry scan ran two regexes over the raw theme source, so a doc comment that quoted an old import line (`import { icons } from './icons'`) was scraped and re-emitted as executable code in the generated module, pointing at a file that may not exist (#5058). The scan now blanks line and block comments (string contents untouched) before matching. And a theme whose `icons:` names a binding that no import backs — a registry declared inline as a const — used to build "successfully" into a module with no `icons` key at all: the registry vanished with no diagnostic. It still cannot ride along (a registry holds React elements, which do not serialize), but the build now says so, in the CLI output and in the receipt's `warnings`, and tells the author to move the registry to its own module.

@jiunshinn
