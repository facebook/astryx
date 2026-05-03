# @xds/theme-stone

Warm stone and slate theme with earthy neutral tones. Uses Montserrat for headings, Figtree for body text, and [Lucide](https://lucide.dev) icons.

## Install

```bash
npm install @xds/theme-stone
```

## Usage

Wrap your app with `XDSTheme` and pass the theme:

```tsx
import {XDSTheme} from '@xds/core/theme';
import {stoneTheme} from '@xds/theme-stone/built';

function App() {
  return (
    <XDSTheme theme={stoneTheme}>
      {/* your app */}
    </XDSTheme>
  );
}
```

### Import paths

| Path | Use case |
|------|----------|
| `@xds/theme-stone` | Source build (StyleX compilation via `@xds/build`) |
| `@xds/theme-stone/built` | Pre-built dist (Tailwind, plain CSS, or no build step) |
| `@xds/theme-stone/theme.css` | Pre-built CSS file (import in your stylesheet) |

If you're using `@xds/build` for StyleX source compilation, import from the bare path. Otherwise, use `/built`.

### CSS import

Add the theme CSS to your stylesheet:

```css
@import "@xds/theme-stone/theme.css";
```
