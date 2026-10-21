---
'@astryxdesign/cli': patch
---

[fix] `astryx doctor integration validate`, `astryx integration check` and `astryx integration verify` say more plainly what is wrong in findings they already reported, and how to fix it:

- An empty doc or manifest, or one with no default export, says so and names what it does export, instead of "(root): Invalid input".
- A manifest key one or two letters off a known key asks "did you mean `components`?" before suggesting a newer CLI.
- A theme descriptor named for the built file (`ocean.doc.mjs` beside a built `ocean.js` that lacks the `ocean` export) says it must share its stem with the `defineTheme` source, naming that source when the built module's `Source:` line or the source's `defineTheme` name confirms it.
- A template doc with no source, a theme descriptor with no source, a theme source with no descriptor, and a component whose source is `.jsx` get a `Fix:`.
- A theme source named for its theme (`brand.ts`) beside the module the build writes (`brand.js`) is told to take the `brandTheme` stem.
- `verify` names packed files by their path in the package, not the scratch copy's; says npm pack does not follow a symlinked root instead of asking for a `files` entry; and, when a theme's `defineTheme` name differs from the files its package exports, says a rebuild writes files under the new name.

@josephfarina
