# @astryxdesign/theme-stone

Warm stone and slate theme with earthy neutral tones. Uses Montserrat for headings, Figtree for body text, and [Lucide](https://lucide.dev) icons.

## Install

```bash
npm install @astryxdesign/theme-stone
```

## Usage

Wrap your app with `XDSTheme` and pass the theme:

```tsx
import {XDSTheme} from '@astryxdesign/core/theme';
import {stoneTheme} from '@astryxdesign/theme-stone/built';

function App() {
  return <XDSTheme theme={stoneTheme}>{/* your app */}</XDSTheme>;
}
```

### Import paths

| Path                         | Use case                                               |
| ---------------------------- | ------------------------------------------------------ |
| `@astryxdesign/theme-stone`           | Source build (StyleX compilation via `@astryxdesign/build`)     |
| `@astryxdesign/theme-stone/built`     | Pre-built dist (Tailwind, plain CSS, or no build step) |
| `@astryxdesign/theme-stone/theme.css` | Pre-built CSS file (import in your stylesheet)         |

If you're using `@astryxdesign/build` for StyleX source compilation, import from the bare path. Otherwise, use `/built`.

### CSS import

Add the theme CSS to your stylesheet:

```css
@import '@astryxdesign/theme-stone/theme.css';
```

## Fonts

This theme uses custom typefaces:

| Role    | Font           |
| ------- | -------------- |
| Body    | Figtree        |
| Heading | Montserrat     |
| Code    | JetBrains Mono |

**These fonts must be loaded separately.** The theme references them by name but does not bundle the font files.

Add this to your HTML `<head>`:

```html
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link
  rel="stylesheet"
  href="https://fonts.googleapis.com/css2?family=Figtree:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600;700&family=Montserrat:wght@400;500;600;700&display=swap" />
```

Without this, the theme falls back to system fonts.
