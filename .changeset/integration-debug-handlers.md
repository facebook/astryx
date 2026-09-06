---
'@astryxdesign/cli': patch
---

[feat] An integration can now supply a `debug` handler, so installing it turns on its debug logs with no change to the app. Export `debug` from `astryx.integration.*`; the app's own `debug` still runs, both get every event, and a handler that throws cannot affect the command. Opt out with `{"astryx": {"inheritDebug": false}}`.

@josephfarina
