---
'@astryxdesign/cli': patch
---

[fix] A CLI installed with npm under a prefix of its own (`npm i -g --prefix ~/.local`, `NPM_CONFIG_PREFIX`, or `prefix=` in an `.npmrc`) is now upgraded into that same prefix: the update notice and `astryx doctor` print `npm i -g --prefix <prefix> @astryxdesign/cli@latest`, with `~` for the home folder. npm's default prefixes (Node's own, `/usr/local`, `/usr`, and `%APPDATA%\npm` on Windows) keep the plain command.

@josephfarina
