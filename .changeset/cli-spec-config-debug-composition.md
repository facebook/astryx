---
'@astryxdesign/cli': patch
---

[fix] The `debug` entry of the `AstryxConfig` type and of `astryx docs authoring config` now states how handlers from integrations combine with the app's own: the app's runs first, then each integration's in load order, a handler that throws is skipped without affecting the others or the command, and `{"astryx": {"inheritDebug": false}}` refuses inherited handlers. The type no longer claims that leaving `debug` out records nothing.

@josephfarina
