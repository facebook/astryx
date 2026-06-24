# @astryxdesign/theme-matcha

Earthy green theme with Figtree typography. Uses [Lucide](https://lucide.dev) icons.

## Install

```bash
npm install @astryxdesign/theme-matcha
```

## Usage

Wrap your app with `XDSTheme` and pass the theme:

```tsx
import {XDSTheme} from '@astryxdesign/core/theme';
import {matchaTheme} from '@astryxdesign/theme-matcha/built';

function App() {
  return <XDSTheme theme={matchaTheme}>{/* your app */}</XDSTheme>;
}
```

### Import paths

| Path                          | Use case                                               |
| ----------------------------- | ------------------------------------------------------ |
| `@astryxdesign/theme-matcha`           | Source build (StyleX compilation via `@astryxdesign/build`)     |
| `@astryxdesign/theme-matcha/built`     | Pre-built dist (Tailwind, plain CSS, or no build step) |
| `@astryxdesign/theme-matcha/theme.css` | Pre-built CSS file (import in your stylesheet)         |

If you're using `@astryxdesign/build` for StyleX source compilation, import from the bare path. Otherwise, use `/built`.

### CSS import

Add the theme CSS to your stylesheet:

```css
@import '@astryxdesign/theme-matcha/theme.css';
```

## Fonts

This theme uses custom typefaces:

| Role    | Font              |
| ------- | ----------------- |
| Body    | DM Sans           |
| Heading | Playwrite US Trad |
| Code    | JetBrains Mono    |

**These fonts must be loaded separately.** The theme references them by name but does not bundle the font files.

Add this to your HTML `<head>`:

```html
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link
  rel="stylesheet"
  href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600;700&family=Playwrite+US+Trad:wght@100..400&display=swap" />
```

Without this, the theme falls back to system fonts.
