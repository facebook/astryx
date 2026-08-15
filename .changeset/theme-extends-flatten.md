---
'@astryxdesign/cli': patch
'@astryxdesign/core': patch
---

[fix] `extends` now reaches the CSS. A theme that extended another built a stylesheet holding only the declarations it stated itself: the base's tokens, component overrides and surface rules were all absent, and because each theme is `@scope`d to its own `data-astryx-theme` value, loading the base's stylesheet alongside could not fill the gap either. Every consumer of an inheritance chain silently got stock geometry, elevation and type with a new palette painted over it. Nothing warned; the loss only showed up by diffing two generated stylesheets token by token.

The cause was `theme build` shadowing its own inputs. It writes `<name>.js` next to `<name>.ts`, and the loader resolved a plain `./<name>` specifier to that generated artifact before the source — so the second build of a family read the artifact, which carries no `components` and exports `<name>Theme` rather than whatever the source exports. A named import that missed became `extends: undefined`, and `defineTheme` treated an absent base as no base at all. The loader now resolves source extensions first, which is also the resolution the author's TypeScript sees, so the CSS a build emits matches the theme that type-checked.

Three things behind it are fixed too, so the failure cannot come back by another route. `defineTheme` **throws** when `extends` is present but is not a theme, naming the likely cause, instead of inheriting nothing — the one behavior change here, and it turns a silent stylesheet into a build error. A theme's `onDark`/`onLight` surfaces and its `__inputTokens` are now inherited like its tokens and components were, so a child no longer reverts its base's inverted-surface customizations to the defaults or loses its `[light, dark]` tuples. And a built theme module now carries the resolved `components` and surfaces alongside its tokens, so extending one — the `./built` subpath every shipped theme exposes — is no longer lossy. `theme build` also stopped hand-picking fields when it re-resolves a plain object theme file, which dropped `extends`, `color` and `syntax` on the way in.

An extended theme is flat: everything it inherits is resolved into its own output, and its stylesheet stands alone. Measured on a 14-theme family (one base, 13 palettes extending it): each palette went from 25 custom properties and no component rules to the base's full 175 and 70, with its own colours still winning.

@cixzhang
