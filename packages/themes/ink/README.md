# @xds/theme-ink

**Dark-only** atmospheric ink theme for XDS — deep blue-gray surfaces, distressed display heading, and dusty pastel categorical accents that read as illuminated panels against the dark page. Uses Manufacturing Consent for display, Fustat for body and headings, and [Lucide](https://lucide.dev) icons.

> Ink is a single-mode theme — it always renders dark, regardless of the user's system color preference. For best browser-chrome integration (scrollbars, native form controls), pass `mode="dark"` to your `XDSTheme` provider.

## Install

```bash
npm install @xds/theme-ink
```

## Usage

Wrap your app with `XDSTheme` and pass the theme:

```tsx
import {XDSTheme} from '@xds/core/theme';
import {inkTheme} from '@xds/theme-ink/built';

function App() {
  return (
    <XDSTheme theme={inkTheme} mode="dark">
      {/* your app */}
    </XDSTheme>
  );
}
```

### Import paths

| Path                       | Use case                                               |
| -------------------------- | ------------------------------------------------------ |
| `@xds/theme-ink`           | Source build (StyleX compilation via `@xds/build`)     |
| `@xds/theme-ink/built`     | Pre-built dist (Tailwind, plain CSS, or no build step) |
| `@xds/theme-ink/theme.css` | Pre-built CSS file (import in your stylesheet)         |

If you're using `@xds/build` for StyleX source compilation, import from the bare path. Otherwise, use `/built`.

### CSS import

Add the theme CSS to your stylesheet:

```css
@import '@xds/theme-ink/theme.css';
```

## Aesthetic

Ink is dark-only by design — every token is a single value, and the
output CSS contains no `light-dark()`, so the theme renders identically
whether the user prefers light or dark.

| Aspect       | Choice                                                 |
| ------------ | ------------------------------------------------------ |
| Mode         | Dark only — no light variant                           |
| Neutral      | Cool blue-gray (#101314 → #E8F1F6)                     |
| Status       | Sage moss, dusty rose, aged gold                       |
| Categorical  | Dusty pastels — light backgrounds, dark text           |
| Radius       | Subtle rounding (2–24px)                               |
| Motion       | Slower / theatrical (150ms → 800ms, 0.75 ratio)        |
| Type scale   | 14px base, 1.2 ratio                                   |

## Fonts

This theme uses custom typefaces:

| Role    | Font                  | Vibe                       |
| ------- | --------------------- | -------------------------- |
| Body    | Fustat                | Clean modern sans          |
| Heading | Fustat                | Same as body for hierarchy |
| Display | Manufacturing Consent | Distressed display         |
| Code    | JetBrains Mono        | Crisp, monospaced          |

Headings (h1–h6) use Fustat to match the body for clean readability;
Manufacturing Consent is reserved for `display-1/2/3` text where the
distressed character has the most visual impact.

**These fonts must be loaded separately.** The theme references them by name but does not bundle the font files.

Add this to your HTML `<head>`:

```html
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link
  rel="stylesheet"
  href="https://fonts.googleapis.com/css2?family=Fustat:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600;700&family=Manufacturing+Consent&display=swap" />
```

Without this, the theme falls back to system fonts (Manufacturing Consent → UnifrakturMaguntia → Old English Text MT → serif).

## Tonal palettes

The theme exports raw tonal palettes for custom components or data
visualization. Each palette has 21 tone steps (0–100 in 5s):

```tsx
import {inkPalettes} from '@xds/theme-ink';

// e.g. cathedral plum at tone 50
const plum = inkPalettes.purple[50]; // '#a363bd'

// or use the metadata for derived tools
const {hue, chroma} = inkPalettes.neutral; // {hue: 210, chroma: 4}
```

Available palettes: `neutral`, `blue`, `cyan`, `green`, `orange`, `pink`,
`purple`, `red`, `teal`, `yellow`.
