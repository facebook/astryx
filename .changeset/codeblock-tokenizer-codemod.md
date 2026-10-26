---
'@astryxdesign/cli': patch
---

[feat] `astryx upgrade` rewrites the deprecated CodeBlock `tokenizer` prop when it sits beside a static `language`. For example, `tokenizer={fn}` with `language="zig"` becomes `language={createCodeLanguage({name: 'zig', identifiers: ['zig'], tokenize: fn})}`. Uses it cannot prove are left unchanged, with a TODO comment: a computed, missing, or `plaintext` language, or a block that spreads props.

@cixzhang
