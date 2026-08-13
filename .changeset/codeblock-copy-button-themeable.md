---
'@astryxdesign/core': patch
---

[feat] CodeBlock: the built-in copy button is now a themeable ghost `IconButton` with a default "Copy code" tooltip, reachable via the stable `astryx-codeblock-copy-button` class (theme it through the `codeblock-copy-button` component key). Restyle or keep the copy control without turning it off and re-implementing it. The tooltip stays "Copy code" after copying — the copy→check icon flip is the confirmation. (#4867)

[feat] New `useClipboard` hook (`@astryxdesign/core/hooks`): the shared copy-to-clipboard behavior — clipboard write, a transient `isCopied` flag with its reset timer, and an optional polite screen-reader announcement. CodeBlock and Timestamp now build their copy buttons on it; reach for it directly for copy affordances that are not a plain icon button.

@freddymeta
