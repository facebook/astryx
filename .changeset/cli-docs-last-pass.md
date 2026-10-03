---
'@astryxdesign/cli': patch
---

[fix] Fix the CLI's topic docs and how they print.

- A code block's label now prints above the block instead of as a `// label` line inside it, so copied bash, CSS, JSON, and HTML stay valid. Table cells escape `|`, so a union type stays in one column.
- `astryx search dark mode` searches for both words; it used to drop every word after the first. A result that matches every word of a query, one of them by name or keyword, now outranks one that matches only some, and a section whose title or heading holds the whole query ranks near the top. Topics can declare search `keywords`, now a documented ReferenceDoc field, and a namespace's `keywords` now count too. A query keeps its phrase when common words such as `make`, `build`, or `an` drop out, so `astryx search make an integration` finds the integration guides, a plural of a doc's name matches it, one step below the exact name, and a component's name typed as words, such as `command palette`, finds the component. Outside an app, where `@astryxdesign/core` is not installed, `astryx search` searches the docs instead of failing, and says so; `--type component`, `hook`, or `template` still needs Core.
- Snippets that failed when copied now work: StyleX token imports, the `fr-FR.json` locale path, Tailwind `rounded-lg`, `--color-background-muted`, icon and color values, and the Cursor rule path.
- Claims that did not match the code are corrected: the 30 shipped locales and how RTL mirroring works, what `astryx init` writes, `--detail brief` for a shorter read, the Neutral and Matcha fonts, the components that need anchor positioning, `gap` steps, Card's radius, and the Next.js StyleX example. The deprecated bare classes are still emitted and will be removed in a later release.
- `astryx docs tokens` lists all 258 tokens, adding the data visualization and syntax groups, and shows both halves of every `light-dark()` value.
- Long sections are split, vague titles renamed, and the `--dense` and Chinese versions no longer drop blocks. Eleven long section keys are shorter, such as `astryx docs styling stylex-setup`, and every old key still resolves. An integration section that extends a Core topic by a section's old title still replaces that section.
- `astryx integration add codemod --to` help says it takes the Core version whose upgrade runs the codemod.
- The agent block that `astryx init` writes now says `upgrade --from <old version> --apply`; `upgrade --apply` alone stops with "Missing required --from".
- The contributor-only sections, on adding a semantic icon and on strings and text direction inside components, moved to CONTRIBUTING.md.

@josephfarina
