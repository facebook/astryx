# Ocean theme family

This fixture is the consumer example and browser test for one keyed family:

```sh
astryx theme build --family ocean.mjs ocean-calm.mjs ocean-calm-deep.mjs ocean-midnight.mjs --family-key ocean-family
```

It writes `ocean-family.css`, `.js`, and `.d.ts` beside the root source. Load the
CSS once (a native `<link>` or Vite CSS import) and import the ESM separately.
The eager stylesheet makes every member ready on first paint, so switching only
changes `data-astryx-theme`. Apps needing one member can keep using the complete
standalone `astryx theme build ocean.mjs` output.
