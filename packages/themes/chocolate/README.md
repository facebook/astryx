# @xds/theme-chocolate

Warm chocolate theme with rich brown tones and cozy beige backgrounds. Uses Fraunces for headings, Albert Sans for body text, and [Lucide](https://lucide.dev) icons.

## Install

```bash
npm install @xds/theme-chocolate
```

## Usage

Wrap your app with `XDSTheme` and pass the theme:

```tsx
import {XDSTheme} from '@xds/core/theme';
import {chocolateTheme} from '@xds/theme-chocolate/built';

function App() {
  return (
    <XDSTheme theme={chocolateTheme}>
      {/* your app */}
    </XDSTheme>
  );
}
```

### Import paths

| Path | Use case |
|------|----------|
| `@xds/theme-chocolate` | Source build (StyleX compilation via `@xds/build`) |
| `@xds/theme-chocolate/built` | Pre-built dist (Tailwind, plain CSS, or no build step) |
| `@xds/theme-chocolate/theme.css` | Pre-built CSS file (import in your stylesheet) |

If you're using `@xds/build` for StyleX source compilation, import from the bare path. Otherwise, use `/built`.

### CSS import

Add the theme CSS to your stylesheet:

```css
@import "@xds/theme-chocolate/theme.css";
```
