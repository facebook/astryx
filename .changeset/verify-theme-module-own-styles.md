---
'@astryxdesign/cli': patch
---

[fix] `astryx integration verify` accepts a theme module that loads the theme's own styles. Such a module imports the theme's exported stylesheet and font stylesheet for their side effects, and re-exports from the module `astryx theme build` writes either everything or only its theme, under the theme's export name. Verify also finds that built module by the name `theme build` gives it, the theme's own name, so a theme whose name differs from its slug no longer fails to rebuild. Any other difference from the built module still fails with `theme_module_stale`, and for a module that re-exports the theme, the message now says what is wrong.

@josephfarina
