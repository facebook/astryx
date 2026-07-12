---
'@astryxdesign/cli': patch
'@astryxdesign/core': patch
---

[fix] Anchor --dense / --zh doc overlays to their base sections (#2182)

The compressed and translated reference docs were merged into the base doc **by array position**, so an overlay whose sections were ordered differently — or which omitted one — grafted every title onto the wrong body.

The result was actively misleading. `astryx docs tokens --dense` printed the entire colour table under a heading that read `## Spacing`, above prose saying "gap props use space0-space12". An agent reading that learns spacing tokens are named `--color-*`. `docs theme --dense` lost the `Extending a Theme` and `Token Utilities` sections entirely and emitted `useTheme` twice, and `docs theme --zh` printed four headings in both Chinese and English. This is what turned a doc bug into a codegen bug: `CLAUDE.md` instructs every AI agent to run `docs tokens --dense` and `docs theme --dense` at bootstrap.

Overlay sections now name the base section they override (`section: 'Spacing Tokens'`), so order no longer matters and an overlay may cover any subset — sections it doesn't name keep their base content. A test asserts every overlay anchors to a real base section, so a future overlay cannot silently drift back.

@AKnassa
