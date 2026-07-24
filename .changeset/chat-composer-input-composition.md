---
'@astryxdesign/core': patch
---

[feat] ChatComposer: make custom inputs first-class. `useChatComposerContext()` and its types are now public, so any input in the `input` slot can read `value`/`onChange`/`onSubmit`/`canSend`/`placeholder`/`isDisabled` and drive the shell's send button. Inputs can register a focus control on `inputControlRef` so click-to-focus works for any input shape (not just `contenteditable`/`textarea`); the shell keeps a DOM-query fallback for uninstrumented inputs.
@ejc3
