---
'@astryxdesign/core': patch
---

[fix] Platform detection reads the client-hints `Unknown` sentinel as no answer, and lives in one place

Follow-up to #5325, which taught `useHotkeys` and `Kbd` to fall through to
`navigator.platform` when `userAgentData.platform` is blank. `Unknown` is the
User-Agent Client Hints spec's own value for "cannot say", and it names a
platform no more than `''` does, yet it still committed to the client-hints
branch and answered "not Apple". It now falls through the same way.

The two detections were independent copies kept aligned by a docstring. They
are now one internal util that both import, so the next change to this logic
cannot land on one surface and miss the other. The util is deliberately not
named in `utils/index.ts`, which would publish it as API.

@Astro-Han
