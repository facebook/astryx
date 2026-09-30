---
'@astryxdesign/cli': patch
---

[feat] `astryx build "<idea>"` now always names a page template to start from (#6707).

A page template carries the page frame, the spacing, and the section rhythm. A page composed from components has to rediscover them. Before, the kit recommended scaffolding only when a template matched almost by name. Other ideas got "use it as a layout reference", which pointed at a 35-line `--skeleton`, and an idea that no template matched got "frame with AppShell, then compose". Now:

- `start` names the template to scaffold, with the `template <id> --type page <path>` command that selects it (an integration replacement through the Core id it replaces), a `basis`, a one-line `reason`, and `alternatives`: the next two templates. A page ranker built for the long ideas builders write ("ops dashboard with a KPI row, a sortable table and a trend chart") picks it. Every matched word counts, weighted by how rare it is among page templates. The words before the first "with", ":" or "," name the page's family, a container ("in a modal") names its frame, and a word that only modifies another ("product" in "product response") counts half. A family's base template (`dashboard`, `settings`) leads its family unless a variant's own words outweigh it. Family words come from the templates' own ids. `basis` is `direct` when the ranker's pick is also search's direct match, `closest` when it is not, and `fallback` when nothing has the evidence to lead and the page starts from the `shell-top-nav` app shell (`blank` when that is not available). A template that is not ready yet is never the start.
- Search matches words more strictly. A term matches inside a name or keyword only at the start of one of its words ("input" finds `TextInput`, "file" no longer finds "profile"), plurals and stems count as the same word, and typo tolerance applies only to one-word lookups of words long enough that one edit rarely makes another word ("site" no longer matches "side", nor "cable" "table").
- Blocks and components that matched only one description word of a multi-word idea are no longer offered.
- The text output has four sections: TEMPLATE (with its reason and command), OTHER TEMPLATES, BLOCKS, and COMPONENTS (with the frame and foundation names). They replace RECOMMENDED START and PAGE TEMPLATES. Search's page matches (`pages`) move to one line, with their full entries under `--verbose`. Descriptions stop at their first sentence, and blocks and components show the top three, each with one shared command line. `--verbose` shows every block and component, with full descriptions, import paths, and match reasons. The recommended command always scaffolds (`template <id> --type page <path>`), where for most ideas it used to print a `--skeleton` or `component AppShell`.

The `build` playbook, the generated agent docs, and the `working-with-ai` and `layout` guides now start every page from a template.

Compatibility: the `build.kit` JSON only gains `start`. Every existing field keeps its shape and meaning. Which pages, blocks, and components are listed, and `directMatch`, change with the stricter matching, as ranking results do. The human-readable output is reorganized. Options, exit codes, and the `build.help` shape are unchanged, and `build` still writes nothing. The same matching changes the ranking of `search` results.

@josephfarina
