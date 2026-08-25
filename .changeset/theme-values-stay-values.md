---
'@astryxdesign/core': patch
'@astryxdesign/cli': patch
---

[fix] Theme CSS generation guarantees that a declaration stays one declaration. Every consumer-supplied declaration (tokens, local tokens, component variants, pseudo blocks, `onDark`/`onLight`, adaptations, inherited themes) is checked against CSS syntax before it is emitted: valid CSS a browser keeps inside one declaration passes through byte-identically, including `url(data:...;base64,...)` in any case, escaped identifiers such as `Gill\ Sans`, closed comments, semicolons inside strings, nested parentheses, and vendor-prefixed property names. Only a value that would end the declaration or rule early (an unquoted `;`, `{` or `}`, an unbalanced closer, an unclosed string, comment, block, or `url(`, or a bad string/url) is dropped. The `<Theme>` runtime still reports a drop with `console.warn`; every generator (`generateThemeCSS`, `generateThemeRules`, `generateThemeRulesSplit`, `generateOnMediaCSS`, `generateAdaptationCSS`) also accepts an optional `{onDiagnostic}` handler, and `astryx theme build` uses it to list each dropped declaration in the receipt's `warnings` instead of returning `warnings: []` while the CSS omits a value. (#5529)

@bhamodi
