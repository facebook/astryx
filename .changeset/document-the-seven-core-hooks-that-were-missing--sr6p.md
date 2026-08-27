---
'@astryxdesign/cli': patch
'@astryxdesign/core': patch
---

[docs] `useAnnounce`, `useTypeahead`, `useInteractiveRole`, `useLongPress`, `useInputStatusIcon`, `useDevWarning` and `useIndicatorFocusRing` are now discoverable. The CLI's hook index is built from the `.doc.mjs` files next to each hook, and these seven shipped without one; so `astryx hook <name>` answered "No hook named", `astryx hook` omitted them and `astryx search` never returned them, while the package exported them with full TSDoc. Agents following the documented discovery workflow concluded the primitives did not exist and hand-rolled replacements; for `useAnnounce` that means a hand-built `aria-live` region, which usually does not announce at all. A test now fails when a hook is exported from the barrel without a doc, so the index cannot silently go stale again.

@cixzhang
