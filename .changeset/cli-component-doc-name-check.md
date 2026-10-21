---
'@astryxdesign/cli': patch
---

[feat] `astryx doctor integration validate` and `astryx integration check` check the component names a package's docs and blocks give, and list what they find with its fix. Nothing counts these findings yet and `integration check --strict` does not fail on them; they become failing warnings in the next minor release:

- `doc_name_mismatch`, in validate's new `docNames` report, lists a component doc whose `name` is not the name the component is listed under when the module its printed import names (the doc's `import`, the published subpath, or the package root) provably does not export that name, so `astryx component` would print a broken import. The `Fix:` proposes the file name when that module exports it, otherwise the component it exports. A name that module's exports cannot prove or rule out (a re-export from another package, `export =`, a destructured binding, a namespace, an import that resolves to no file, or, when no import can be resolved, a source that only exports a default) is listed as not checked, with the reason.
- `unknown_block_component`, in validate's new `blockComponents` report, lists a name a template's `exampleFor` or `componentsUsed` gives that neither the package nor Core has (every doc `astryx component` resolves in Core counts) and the template does not import it. Imports the template's local helpers make count too, including through a barrel such as `parts/index.ts`. A name is judged only where the template reaches components solely through named imports and re-exports from the package itself, Core, React, StyleX, or local helpers read in full: anything else (an import from another package, which may render other components, any `default` binding, a namespace import, an alias of or member read off an imported binding, a component held in a variable, `require()`, a dynamic `import()`, a file that does not parse cleanly, or a local module this check cannot read), and, without Core installed, any name only Core could resolve, is listed as not checked.

`integration check --strict` does not fail on anything listed as not checked.

@josephfarina
