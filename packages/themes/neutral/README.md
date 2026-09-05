# @astryxdesign/theme-neutral

Muted, minimal aesthetic with system fonts. Uses [Lucide](https://lucide.dev) icons.

## Install

```bash
npm install @astryxdesign/theme-neutral
```

## Usage

Wrap your app with `XDSTheme` and pass the theme:

```tsx
import {XDSTheme} from '@astryxdesign/core/theme';
import {neutralTheme} from '@astryxdesign/theme-neutral/built';

function App() {
  return <XDSTheme theme={neutralTheme}>{/* your app */}</XDSTheme>;
}
```

### Import paths

| Path                                    | Use case                                                    |
| --------------------------------------- | ----------------------------------------------------------- |
| `@astryxdesign/theme-neutral`           | Source build (StyleX compilation via `@astryxdesign/build`) |
| `@astryxdesign/theme-neutral/built`     | Pre-built dist (Tailwind, plain CSS, or no build step)      |
| `@astryxdesign/theme-neutral/theme.css` | Pre-built CSS file (import in your stylesheet)              |

If you're using `@astryxdesign/build` for StyleX source compilation, import from the bare path. Otherwise, use `/built`.

## Approved palette

The repository keeps Neutral's generation request in `palette.config.json`, the
exact `astryx-oklch-v1` output in `src/neutralPalettes.generated.ts`, and its
generation receipt beside that file. `src/neutralPalettes.ts` provides the stable
theme-local import. Neutral currently uses 21 numbered stops in each light and
dark ramp, but that layout is a Neutral decision rather than a requirement for
other themes.

Exact solid endpoints use the same stable palette namespace as the tonal
families: `neutralPalettes.black` and `neutralPalettes.white`. Theme definitions
can assign those values directly to semantic tokens without treating a neutral
ramp endpoint as the named color.

```ts
import {neutralPalettes} from '@astryxdesign/theme-neutral';

const tokens = {
  '--color-background-inverted': [neutralPalettes.black, neutralPalettes.white],
};
```

Neutral opts into a muted dark edge for chromatic families. Stops 5 through 25
use 50% of their realized chroma, then recover smoothly to the standard dark
recipe at stop 60. Yellow uses a gentler 65% edge multiplier. Light ramps,
neutral ramps, and stops 60 through 100 remain unchanged.

Neutral is the reference implementation for palette-aware theme templates.
Templates may follow its ownership, review, and alignment workflow without
copying its colors or stop layout.

Use semantic theme tokens in components. Neutral's runtime theme does not import
the complete authoring palette. Mapping semantic tokens to reviewed stops is a
separate change, so palette generation and token adoption can be reviewed
independently.

The committed request and receipt preserve the generation inputs and provenance.
CLI regeneration is not yet a supported release workflow; until that tooling
ships, treat the generated module and receipt as reviewed artifacts rather than
editing them by hand.

### CSS import

Add the theme CSS to your stylesheet:

```css
@import '@astryxdesign/theme-neutral/theme.css';
```

This is required for component-level theme overrides (colors, radii, typography) to take effect.

This theme uses system fonts; no external font loading is required.

## Related Packages

| Package                                                                              | Description                               |
| ------------------------------------------------------------------------------------ | ----------------------------------------- |
| [`@astryxdesign/core`](https://github.com/facebook/astryx/tree/main/packages/core)   | Core components and theme system          |
| [`@astryxdesign/build`](https://github.com/facebook/astryx/tree/main/packages/build) | Build plugins for StyleX source builds    |
| [`@astryxdesign/cli`](https://github.com/facebook/astryx/tree/main/packages/cli)     | CLI tooling including `astryx docs theme` |
