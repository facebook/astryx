---
'@astryxdesign/lab': patch
---

[feat] `DiffViewer` accepts a CodeBlock language value as `language`, imported on its own or made with `createCodeLanguage`. It also takes a `codeLanguages` list, so a file's extension or name can pick a listed value: for example, `schema.graphql` picks `graphql`, and `Dockerfile` picks `dockerfile`. C, C++, SQL, Rust, Kotlin, Swift, and Go files are now inferred and coloured with no setup.

@cixzhang
