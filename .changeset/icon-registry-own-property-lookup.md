---
'@astryxdesign/core': patch
---

[fix] Icon lookups no longer resolve inherited `Object.prototype` members. `getIcon`, `getExtendedIcon`, and `getIconRegistry` indexed their registries directly, so an icon key that collides with a built-in member returned the prototype's value instead of missing: `getExtendedIcon('toString', <Fallback />)` handed back `Object.prototype.toString` — a function the icon slot then tried to render as a component — and the caller's fallback was never reached. All three now use own-property lookups, and `getIconRegistry`'s extension-key skip uses `Object.hasOwnProperty.call` rather than `in`, so such a key can no longer enter the typed snapshot. Genuinely registered keys of that name still resolve.

@AKnassa
