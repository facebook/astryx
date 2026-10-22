# @astryxdesign/richtext

# 0.7.3

---

# 0.7.2

#### New Features

- Tables draw a line on every cell edge, not only between rows, on both `Markdown` and the RichText surfaces, and the grid closes at the table's rim. A reader following one row across never needed vertical lines, but someone editing a table has to aim at a cell and judge where a selection stops, and the empty 3×3 a toolbar insert produces was three horizontal rules with no sign it had three columns. The line is the same `--color-border` already used between rows, the rim merges with it into one rule rather than doubling at the edge, and both surfaces move together — the read and edit renderings match block for block, more closely than before.

#### Documentation

- The `RichTextEditor` docs now list `isOptional`, `isRequired`, `labelTooltip` and `namespace`, four props the editor already accepted, so `astryx component RichTextEditor` and the docsite props table show the Required/Optional indicator, `aria-required`, the label tooltip and the Lexical namespace.

#### Contributors

Thanks to everyone who contributed to this release:

- @cixzhang
- @potatowagon

---

# 0.7.1

#### New Features

- `@astryxdesign/richtext` is now a stable package, released together with `@astryxdesign/core` at the same version. Install it without the `@canary` tag: `npm install @astryxdesign/richtext`. It provides `RichTextEditor`, `RichTextView`, `RichTextEditorToolbar`, `RichTextEditorAutoLinkPlugin`, the headless Markdown serializers (also at `@astryxdesign/richtext/markdown`), and Markdown plugin support through `createRichTextExtension`. `RichTextView` and core `Markdown` render the same document the same way, and Markdown that is imported and exported without edits comes back byte for byte. `lexical` and the `@lexical/*` packages remain optional peer dependencies. (#7224)

#### Fixes

- `@astryxdesign/richtext` (and the Lab and Charts packages) now declare their stylesheet as a side effect, so a bundler that removes side-effect-free imports keeps `import '@astryxdesign/richtext/richtext.css'` instead of dropping it and leaving the editor unstyled. JavaScript modules stay tree-shakable. (#7586)
- `astryx.css`, `reset.css`, and every other package stylesheet (`richtext.css`, `lab.css`, `charts.css`) now open with `@layer reset, astryx-base, astryx-theme;`, the same line theme stylesheets carry. The Astryx layer order holds whichever Astryx stylesheet loads first: loading `reset.css` after `astryx.css` no longer lets the reset override component styles, and theme overrides keep winning. Setups that already declare the order on their own first line are unchanged. (#7585)

#### Documentation

- The `@astryxdesign/richtext` README shows the full stylesheet setup: Core's `reset.css` and `astryx.css`, your theme's CSS, and `richtext.css`. It says the package ships prebuilt CSS, so you never compile its source, and that `richtext.css` sits in `@layer astryx-base`, so theme overrides win once `reset.css` (or the layer-order line) loads first. (#7582)

#### Contributors

Thanks to everyone who contributed to this release:

- @cixzhang

---

# 0.1.9
