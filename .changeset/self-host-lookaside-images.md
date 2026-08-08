---
'@astryxdesign/cli': patch
---

[chore] Self-host template demo imagery in the repo instead of streaming it
from the internal `lookaside.facebook.com` CDN.

- Template demo images are now committed under
  `apps/docsite/public/template-assets/` and referenced by root-relative
  `/template-assets/*` paths (previously Meta-internal CDN URLs invisible to
  external contributors).
- `stripTemplateAssetRefs` still swaps these paths for the inline `data:` URI
  placeholder on scaffold, so generated projects render with zero setup and no
  network dependency — no image is ever copied into a scaffolded project.

@imdreamrunner
