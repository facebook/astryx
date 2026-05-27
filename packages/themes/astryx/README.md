# @xds/theme-astryx

Warm minimal theme for XDS — cream backgrounds, warm near-black text, and a single muted tan accent, paired with Figtree as the only typeface.

Built canonically with `defineTheme()` — the `color` scale derives the accent, surface, border, and text token families via the HCT model; explicit `tokens` only pin the visible palette anchors (cream body, warm near-black ink) and the warm-leaning status hues.

## Install

```bash
npm install @xds/theme-astryx
```

## Usage

Wrap your app with `XDSTheme` and pass the theme:

```tsx
import {XDSTheme} from '@xds/core/theme';
import {astryxTheme} from '@xds/theme-astryx/built';

function App() {
  return <XDSTheme theme={astryxTheme}>{/* your app */}</XDSTheme>;
}
```

### Import paths

| Path                          | Use case                                               |
| ----------------------------- | ------------------------------------------------------ |
| `@xds/theme-astryx`           | Source build (StyleX compilation via `@xds/build`)     |
| `@xds/theme-astryx/built`     | Pre-built dist (Tailwind, plain CSS, or no build step) |
| `@xds/theme-astryx/theme.css` | Pre-built CSS file (import in your stylesheet)         |

If you're using `@xds/build` for StyleX source compilation, import from the bare path. Otherwise, use `/built`.

### CSS import

Add the theme CSS to your stylesheet:

```css
@import '@xds/theme-astryx/theme.css';
```

## Palette

### Light (default)

| Role              | Hex       |
| ----------------- | --------- |
| Surface (body)    | `#F7F2EA` |
| Surface (raised)  | `#FFFFFF` |
| Surface (sunken)  | `#EFE9DC` |
| Text primary      | `#1F1B17` |
| Text secondary    | `#5A544B` |
| Text disabled     | `#A39C8E` |
| Border            | `#E5DDCD` |
| Border emphasized | `#B7AC95` |
| Accent            | `#7A5A3B` |
| Accent hover      | `#5E4429` |
| Success           | `#5C7A4F` |
| Warning           | `#B58A3E` |
| Danger            | `#9E4A3D` |

### Dark

| Role             | Hex       |
| ---------------- | --------- |
| Surface (body)   | `#1E1A15` |
| Surface (raised) | `#2A251E` |
| Text primary     | `#F2EBDC` |
| Text secondary   | `#A8A091` |
| Accent           | `#C8A37A` |

## Typography

Astryx uses **[Figtree](https://fonts.google.com/specimen/Figtree)** as its single typeface across body and headings (warm minimal = one quiet sans). Base 14px, ratio 1.2 — matching `@xds/theme-default`.

The theme's font-family chain is:

```
var(--font-figtree, Figtree), "Figtree Variable", system-ui, -apple-system, ...
```

This honors the three loading paths from the [theming wiki](https://github.com/facebookexperimental/xds/wiki/Theming-Infrastructure#font-declarations):

1. **Best — `next/font/google`** (self-hosted, no FOUC). In Next.js, expose Figtree as a CSS variable and the theme picks it up automatically:

   ```tsx
   import {Figtree} from 'next/font/google';
   const figtree = Figtree({subsets: ['latin'], variable: '--font-figtree'});
   // <html className={figtree.variable}>
   ```

2. **Good — Google Fonts `<link>`** in your document `<head>`:

   ```html
   <link
     rel="stylesheet"
     href="https://fonts.googleapis.com/css2?family=Figtree:wght@400;500;600;700&display=swap"
   />
   ```

3. **Fallback** — system sans stack (`system-ui`, `-apple-system`, …). The page still renders cleanly if Figtree never loads.
