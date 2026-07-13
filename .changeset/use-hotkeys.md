---
'@astryxdesign/core': patch
---

[feat] Add `useHotkeys` hook for global keyboard shortcuts. Registers one window `keydown` listener per hook instance with handlers kept in a ref (re-renders never re-subscribe). Combos like `'mod+k'` or `'escape'` — `mod` maps to ⌘ on Apple platforms (same detection as Kbd) and Ctrl elsewhere. Skips typing targets (input/textarea/select/contenteditable) unless `allowInInputs`, skips `defaultPrevented` events, and calls `preventDefault()` on match. SSR-safe.

@thedjpetersen
