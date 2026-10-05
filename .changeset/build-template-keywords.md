---
'@astryxdesign/cli': patch
---

[feat] Templates declare their `keywords`, and `build` tells a part of a page from a page by the components the project can use (#6805)

- `TemplateDoc` gains an optional `keywords` list: the ideas, domains, and other names a builder might use for what the template serves. `parseTemplate` validates it, discovery carries it from every template source, `astryx search` matches it as it matches a template's description, and `astryx build` ranks page templates on it. Each Core page template's closing list of ideas moved out of its `description` into `keywords`, so descriptions describe the layout.
- `build` starts a part of a page where it lives (`spec:AST-048` FR3), and the project's own components say what a part is: an idea whose head noun is a word of a component's name or keywords, Core's or an integration's, asks for a part, unless the noun names a family of page templates or the idea lists three or more pieces. A part starts from the base template of the family the idea names, else from the app shell; a change to an existing page or part (an idea whose "existing" names a page family or a component, such as "the existing table", and that does not ask for a new page) starts from the app shell. The start's reason says which case applies and why.
- A family's base template leads its family unless a variant matches two terms of its own; a base that cannot start on its own never displaces the variant that leads.

Integration templates that set `keywords` need `@astryxdesign/cli` 0.7.0 or later. The template metadata object is strict, so a stable CLI before 0.7.0 rejects the field, drops that template, and hides the package's doc topics; only `template --list` and `search` print a warning. `integration verify` fails a package whose template sets `keywords` until it declares `@astryxdesign/cli >=0.7.0`, as it does for `replaces`.
@josephfarina
