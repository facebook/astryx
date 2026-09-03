# @astryxdesign/theme-neutral

Muted, minimal aesthetic with Figtree typography and [Lucide](https://lucide.dev) icons.

## Install

```bash
npm install @astryxdesign/theme-neutral
```

## Usage

Wrap your app with `Theme`, import the built stylesheet, and pass the theme:

```tsx
import {Theme} from '@astryxdesign/core/theme';
import {neutralTheme} from '@astryxdesign/theme-neutral/built';
import '@astryxdesign/theme-neutral/theme.css';

function App() {
  return (
    <Theme theme={neutralTheme} mode="system">
      {/* your app */}
    </Theme>
  );
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

The repository keeps Neutral's approved palette in `src/neutralPalettes.ts` for
theme authoring and audits. It is not part of the package API, `defineTheme`, the
built theme, or runtime CSS. Each family contains exact light- and dark-mode palette
entries labeled from 0 through 100 in increments of five. By convention, lower
labels identify darker stops and higher labels lighter stops in both modes. The
labels identify approved entries rather than guaranteeing that each hex value
measures at that exact HCT coordinate.

Use semantic theme tokens for components. When a new semantic token or audit
tool needs a raw color, consult an exact family, mode, and numbered stop from
this palette. For example, `blue.light[45]` means blue, the light-mode ramp,
stop 45. Theme mappings retain the selected hex explicitly so later palette
changes do not silently recolor the theme. Alpha overlays and other intentional
deviations should be documented at the token that uses them.

### CSS import

Add the theme CSS to your stylesheet:

```css
@import '@astryxdesign/theme-neutral/theme.css';
```

This is required for component-level theme overrides (colors, radii, typography) to take effect.

### Font loading

The theme names Figtree but does not load font files. Load it in the consuming
application before rendering the theme; otherwise the configured system-font
fallback stack is used.

```html
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link
  rel="stylesheet"
  href="https://fonts.googleapis.com/css2?family=Figtree:wght@400;500;600;700&display=swap" />
```

## Related Packages

| Package                                                                              | Description                               |
| ------------------------------------------------------------------------------------ | ----------------------------------------- |
| [`@astryxdesign/core`](https://github.com/facebook/astryx/tree/main/packages/core)   | Core components and theme system          |
| [`@astryxdesign/build`](https://github.com/facebook/astryx/tree/main/packages/build) | Build plugins for StyleX source builds    |
| [`@astryxdesign/cli`](https://github.com/facebook/astryx/tree/main/packages/cli)     | CLI tooling including `astryx docs theme` |
