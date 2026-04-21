# @xds/theme-meta

Meta brand identity with blue accent and clean aesthetics. Includes custom icon set.
> **Note:** This theme is private and not published to npm.
## Install

```bash
npm install @xds/theme-meta
```

## Usage

Wrap your app with `XDSTheme` and pass the theme:

```tsx
import {XDSTheme} from '@xds/core/theme';
import {metaTheme} from '@xds/theme-meta/built';

function App() {
  return (
    <XDSTheme theme={metaTheme}>
      {/* your app */}
    </XDSTheme>
  );
}
```

### Import paths

| Path | Use case |
|------|----------|
| `@xds/theme-meta` | Source build (StyleX compilation via `@xds/build`) |
| `@xds/theme-meta/built` | Pre-built dist (Tailwind, plain CSS, or no build step) |
| `@xds/theme-meta/theme.css` | Pre-built CSS file (import in your stylesheet) |

If you're using `@xds/build` for StyleX source compilation, import from the bare path. Otherwise, use `/built`.

### CSS import

Add the theme CSS to your stylesheet:

```css
@import "@xds/theme-meta/theme.css";
```

This is required for component-level theme overrides (colors, radii, typography) to take effect.

## Related Packages

| Package | Description |
|---------|-------------|
| [`@xds/core`](https://github.com/facebookexperimental/xds/tree/main/packages/core) | Core components and theme system |
| [`@xds/build`](https://github.com/facebookexperimental/xds/tree/main/packages/build) | Build plugins for StyleX source builds |
| [`@xds/cli`](https://github.com/facebookexperimental/xds/tree/main/packages/cli) | CLI tooling including `xds docs theme` |
