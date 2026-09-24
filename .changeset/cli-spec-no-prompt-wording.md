---
'@astryxdesign/cli': patch
---

[docs] `astryx theme add --overwrite` and `astryx upgrade --install-deps` no longer describe a prompt the CLI never shows; each now says what happens without the flag (`ERR_FILE_EXISTS` with nothing written, or `ERR_DEP_MISSING`). `ERR_FILE_EXISTS` is described as "Refused to overwrite an existing file." without the "non-interactive mode" qualifier; its meaning is unchanged.

@josephfarina
