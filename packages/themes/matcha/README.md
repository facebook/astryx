# @xds/theme-matcha

Earthy green theme with Figtree typography. Uses [Lucide](https://lucide.dev) icons.

## Install

```bash
npm install @xds/theme-matcha
```

## Usage

Wrap your app with `XDSTheme` and pass the theme:

```tsx
import {XDSTheme} from '@xds/core/theme';
import {matchaTheme} from '@xds/theme-matcha/built';

function App() {
  return (
    <XDSTheme theme={matchaTheme}>
      {/* your app */}
    </XDSTheme>
  );
}
```

### Import paths

| Path | Use case |
|------|----------|
| `@xds/theme-matcha` | Source build (StyleX compilation via `@xds/build`) |
| `@xds/theme-matcha/built` | Pre-built dist (Tailwind, plain CSS, or no build step) |
| `@xds/theme-matcha/theme.css` | Pre-built CSS file (import in your stylesheet) |

If you're using `@xds/build` for StyleX source compilation, import from the bare path. Otherwise, use `/built`.

### CSS import

Add the theme CSS to your stylesheet:

```css
@import "@xds/theme-matcha/theme.css";
```
