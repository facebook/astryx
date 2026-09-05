---
'@astryxdesign/cli': patch
---

[fix] CLI: recorded runs no longer carry a raw agent session id, and the environment snapshot is scrubbed like every other value.

@cixzhang

A `DebugEvent` claimed `redacted: true` while `env` had never been through the scrubbing pass, and it stored the raw `agentSessionId` beside its hash. A session id follows one person across every run they make, and a handler may forward these records anywhere — so the record shipped a stable identifier, and an agent name pasted in from the environment went out verbatim, under a flag that said neither had.

The contract is now explicit on `DebugEventEnv`: no identity, attribution only from positive evidence, and free text scrubbed. `env.agentSessionId` is always null — join runs on `env.agentSessionIdHash`, which is what the raw value was for. Everything the CLI derives itself (platform, CI provider, locale, the hash) is still recorded verbatim, because a scrubbed snapshot is not worth keeping. `redacted` is set only on the sealed copy, after every pass has actually run.

`DebugSchemaVersion` widens to `1 | 2` and the CLI emits `2`, so code that switches on it is forced to handle both rather than silently reading a field that no longer means what it did. `parseDebugEvent` is version-aware to match: a v1 record may carry the raw id, a v2 record may not and is rejected if it does.

Not a breaking change: `debug` and the whole `DebugEvent` surface are unreleased — they land in this same release — so no published consumer ever saw the raw identifier.
