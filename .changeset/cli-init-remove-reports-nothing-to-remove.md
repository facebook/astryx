---
'@astryxdesign/cli': patch
---

[fix] `init --remove-agents` says when there was nothing to remove.

In a clean project the command reported `{"removed": true}` and exit 0, exactly
as it does after removing a real block. The response type was the literal
`{removed: true}`, so the contract could not express "nothing to remove" even
if the code had wanted to.

`data.removed` is now a boolean: true when a managed agent-docs block was found
and removed, false when there was none. The human line says which happened.
`removeAgentDocs()` returns the files it changed instead of nothing.

@josephfarina
