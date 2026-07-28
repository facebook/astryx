---
'@astryxdesign/cli': minor
---

[breaking] component/hook `--json` list responses collapsed. `--detail compact`/`full` previously emitted distinct `component.brief`/`component.full` (and `hook.*`) envelopes; they now all emit `component.list` (resp. `hook.list`) with a `data.detail: 'names' | 'compact' | 'full'` field. Migrate: switch on `data.detail`, not the `.brief`/`.full` discriminator. Removed types: ComponentBriefResponse, ComponentFullResponse, HookBriefResponse, HookFullResponse.

@josephfarina
