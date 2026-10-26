---
'@astryxdesign/cli': patch
'@astryxdesign/core': patch
---

[feat] CodeBlock's `tokenizer` prop is deprecated in favour of a custom language value: pass `language={createCodeLanguage({name, identifiers, tokenize})}` with the same function. The prop still works exactly as released. `astryx upgrade` rewrites it when it sits beside a static `language`. For example, `tokenizer={fn}` with `language="zig"` becomes `language={createCodeLanguage({name: 'zig', identifiers: ['zig'], tokenize: fn})}`. Uses it cannot prove are left unchanged, with a TODO comment: a computed, missing, or `plaintext` language, or a block that spreads props.

@cixzhang
