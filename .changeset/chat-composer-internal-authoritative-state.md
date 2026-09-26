---
'@astryxdesign/core': patch
---

[feat] `ChatComposerInput` now uses an internal-authoritative state model (#2473, Lexical-inspired): the contentEditable DOM and its Selection are the single source of truth for every mutation path (typing, token chips, trigger-menu replacements, paste-as-token, dictation, history recall, submit-clear), and the controlled `value` prop acts as a commit/override channel that only rewrites the content when it genuinely diverges from internal state. A pending-emissions ledger replaces the one-shot echo marker, so a parent's late, in-order commit of an earlier `onChange` emission no longer wipes keystrokes typed in the meantime. `handleRef` gains `setValue(text)`: a synchronous full replacement that emits exactly one `onChange`, re-evaluates the trigger menu (a menu left open over the replaced content closes), and places the caret at the end when the input has focus — while unfocused the document selection is left untouched, and the parent's echo of that value causes no DOM write. Props are unchanged; `setValue` is an optional member of the exported `ChatComposerInputHandle` type (handles returned by `ChatComposerInput` always provide it), so handle objects built elsewhere, such as mocks or custom inputs passed to `useChatPasteAsToken` or `useChatDictation`, keep compiling. Part of the Q3 Chat tracker (#3635).

@AKnassa
