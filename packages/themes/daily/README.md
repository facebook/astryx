# @astryxdesign/theme-daily

Warm, productivity-focused theme. Uses [Lucide](https://lucide.dev) icons.

## Install

```bash
npm install @astryxdesign/theme-daily
```

## Usage

Wrap your app with `XDSTheme` and pass the theme:

```tsx
import {XDSTheme} from '@astryxdesign/core/theme';
import {dailyTheme} from '@astryxdesign/theme-daily/built';

function App() {
  return <XDSTheme theme={dailyTheme}>{/* your app */}</XDSTheme>;
}
```

### Import paths

| Path                         | Use case                                               |
| ---------------------------- | ------------------------------------------------------ |
| `@astryxdesign/theme-daily`           | Source build (StyleX compilation via `@astryxdesign/build`)     |
| `@astryxdesign/theme-daily/built`     | Pre-built dist (Tailwind, plain CSS, or no build step) |
| `@astryxdesign/theme-daily/theme.css` | Pre-built CSS file (import in your stylesheet)         |

If you're using `@astryxdesign/build` for StyleX source compilation, import from the bare path. Otherwise, use `/built`.

### CSS import

Add the theme CSS to your stylesheet:

```css
@import '@astryxdesign/theme-daily/theme.css';
```

This is required for component-level theme overrides (colors, radii, typography) to take effect.

## Fonts

This theme uses custom typefaces:

| Role    | Font           |
| ------- | -------------- |
| Body    | Figtree        |
| Heading | PT Serif       |
| Code    | JetBrains Mono |

**These fonts must be loaded separately.** The theme references them by name but does not bundle the font files.

Add this to your HTML `<head>`:

```html
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link
  rel="stylesheet"
  href="https://fonts.googleapis.com/css2?family=Figtree:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600;700&family=PT+Serif:wght@400;700&display=swap" />
```

Without this, the theme falls back to system fonts.

## Related Packages

| Package                                                                              | Description                            |
| ------------------------------------------------------------------------------------ | -------------------------------------- |
| [`@astryxdesign/core`](https://github.com/facebook/astryx/tree/main/packages/core)   | Core components and theme system       |
| [`@astryxdesign/build`](https://github.com/facebook/astryx/tree/main/packages/build) | Build plugins for StyleX source builds |
| [`@astryxdesign/cli`](https://github.com/facebook/astryx/tree/main/packages/cli)     | CLI tooling including `astryx docs theme` |
