# @xds/theme-gothic

Dark gothic theme with deep blue-gray tones and blackletter headings. Uses Manufacturing Consent for headings, Fustat for body text, and [Lucide](https://lucide.dev) icons.

## Install

```bash
npm install @xds/theme-gothic
```

## Usage

Wrap your app with `XDSTheme` and pass the theme:

```tsx
import {XDSTheme} from '@xds/core/theme';
import {gothicTheme} from '@xds/theme-gothic/built';

function App() {
  return <XDSTheme theme={gothicTheme}>{/* your app */}</XDSTheme>;
}
```

### Import paths

| Path                          | Use case                                               |
| ----------------------------- | ------------------------------------------------------ |
| `@xds/theme-gothic`           | Source build (StyleX compilation via `@xds/build`)     |
| `@xds/theme-gothic/built`     | Pre-built dist (Tailwind, plain CSS, or no build step) |
| `@xds/theme-gothic/theme.css` | Pre-built CSS file (import in your stylesheet)         |

If you're using `@xds/build` for StyleX source compilation, import from the bare path. Otherwise, use `/built`.

### CSS import

Add the theme CSS to your stylesheet:

```css
@import '@xds/theme-gothic/theme.css';
```

## Fonts

This theme uses custom typefaces:

| Role    | Font                  |
| ------- | --------------------- |
| Body    | Fustat                |
| Heading | Manufacturing Consent |
| Code    | JetBrains Mono        |

**These fonts must be loaded separately.** The theme references them by name but does not bundle the font files.

Add this to your HTML `<head>`:

```html
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link
  rel="stylesheet"
  href="https://fonts.googleapis.com/css2?family=Fustat:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600;700&family=Manufacturing+Consent&display=swap" />
```

Without this, the theme falls back to system fonts.
