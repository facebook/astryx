---
'@astryxdesign/cli': patch
---

[fix] `astryx component <Name>`'s plain-text output always showed `import {Name} from '@astryxdesign/core/...'`, even for a component owned by an integration package. The JSON response already resolved the import against the correct owner, but the command's text formatter recomputed its own hint via the core-only resolver and ignored that value.

The command now uses the already-resolved `import` field from the component's detail response, so the plain-text output matches the JSON output and shows the integration's own package.

@andrskr
