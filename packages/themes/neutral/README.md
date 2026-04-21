# @xds/theme-neutral

Muted, minimal aesthetic. Uses [Lucide](https://lucide.dev) icons.

## Install

```bash
npm install @xds/theme-neutral
```

## Usage

Wrap your app with `XDSTheme` and pass the theme:

```tsx
import {XDSTheme} from '@xds/core/theme';
import {neutralTheme} from '@xds/theme-neutral/built';

function App() {
  return (
    <XDSTheme theme={neutralTheme}>
      {/* your app */}
    </XDSTheme>
  );
}
```

### Import paths

| Path | Use case |
|------|----------|
| `@xds/theme-neutral` | Source build (StyleX compilation via `@xds/build`) |
| `@xds/theme-neutral/built` | Pre-built dist (Tailwind, plain CSS, or no build step) |
| `@xds/theme-neutral/theme.css` | Pre-built CSS file (import in your stylesheet) |

If you're using `@xds/build` for StyleX source compilation, import from the bare path. Otherwise, use `/built`.

### CSS import

Add the theme CSS to your stylesheet:

```css
@import "@xds/theme-neutral/theme.css";
```

This is required for component-level theme overrides (colors, radii, typography) to take effect.

## Related Packages

| Package | Description |
|---------|-------------|
| [`@xds/core`](https://github.com/facebookexperimental/xds/tree/main/packages/core) | Core components and theme system |
| [`@xds/build`](https://github.com/facebookexperimental/xds/tree/main/packages/build) | Build plugins for StyleX source builds |
| [`@xds/cli`](https://github.com/facebookexperimental/xds/tree/main/packages/cli) | CLI tooling including `xds docs theme` |
