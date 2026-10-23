---
'@astryxdesign/cli': patch
---

[experimental] Icon sets: authoring a set from a library takes fewer steps and fewer guesses. Only the experimental icon commands, the icon-set guide, and `astryx template` in a project that sets `experimental.iconSet` change; every stable command reads exactly as before without the opt-in.

- **`experimental icon new-set`.** `--from` maps a definition only when an icon has its exact name and lists those entries for review; other likely icons come back as at most three suggestions per definition, never written. It records the library and version as `source`, copies the library's license notices and takes its license, keeps `--exclude` in the data file's `exclude` for every refresh, and names the exports it left out as not icons. It wires the generated module into the package's entry (creating `index.js`, `index.d.ts`, and `exports`, `main`, `types`, and `files` when the package has none), declares `react` and optional `@types/react` and `@astryxdesign/cli` peers, and adds a `typecheck` script. `--variants` and `--default` declare variants; `--display-name` and `--description` fill the descriptor, on a refresh too. Ids keep a dimension as one word (`squares-2x2`), a library's other names for an icon become its words, and `…Provider` and `…Context` exports are never icons. A library of 1,600 icons is read in about two seconds.
- **`experimental icon add` and `map`.** `add --variant <name> --from <module> --all` adds a variant for every icon at once; `add --id <id> --remove` takes an icon out with its variants, map entries, and generated exports; a `./` file is named as written and its folder joins package.json `files`. `map --pairs a=b,c=d` writes many entries in one checked write, and both accept a definition's kebab id and an icon's other names or export name.
- **Listing.** `experimental icon --set <set> --all-icons` lists every icon of a set (`icon.setIcons`) and `--definitions` lists every Astryx definition, built in or optional (`icon.definitions`). Search shows partial matches only when nothing better matches.
- **Templates.** A mapped icon drops the library's sizing props (`size`, `strokeWidth`, `absoluteStrokeWidth`), reported as `dropped`, and comments on a rewritten import line are kept.
- **Definitions.** Thirteen new icon definitions (`rotate`, `flipHorizontal`, `flipVertical`, `alignLeft`, `alignCenter`, `alignRight`, `panelLeft`, `panelRight`, `gitBranch`, `gitFork`, `scale`, `cpu`, `textCase`), declared by the templates that draw them, and more common glyph names in built-in definitions' words.
- **Checks.** `integration check` suggests icons by the same rule and lists each optional definition with its description and words; the version-drift warning gives the refresh command.

@josephfarina
