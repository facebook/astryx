---
'@astryxdesign/cli': patch
---

[feat] Link docs by identity, and let integrations add to the docs tree. (#6626)

A doc links another doc inside its text with `{@link [<provider>:]<kind>:<name>}`,
such as `{@link command:doctor}`. The CLI prints each link as the `astryx docs`
command that opens the doc; a link that names no doc prints as written, and
`astryx doctor` warns on it. An older CLI prints the link as plain text.
`reference`, `workflow`, and `collection` blocks stay in namespace docs.

An integration can ship namespace docs and place its guides in them. They show
up in `astryx docs` beside `cli`, with the same moves, links, and search, and
`astryx doctor integration docs` checks them before the package ships. A
namespace doc in an integration's docs directory no longer fails to load, and
`astryx integration add doc <name> --parent <namespace>` writes a placed guide.
A CLI release that does not read the docs tree can hide every doc topic of a
package that ships a namespace doc or a placed guide, with nothing saying why,
so `--parent` declares the CLI that reads them as an optional
`@astryxdesign/cli` peer, and `astryx integration verify` fails a package
that ships either one without it.

The CLI keeps its own routes: an integration's flat topic or namespace named
`cli`, `unorganized`, or after one of the CLI's topics (compared without case)
is withdrawn from the tree, its name opens the CLI's doc, and doctor warns.

Every flat topic now sits in `astryx docs unorganized`, under its own name,
so every doc has a place in the tree with a way up and across. Search hits
for a topic name the level and the package that wrote it.

New guides on writing docs for an integration: `astryx docs cli/integrations/docs`.

@josephfarina
