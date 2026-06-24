# @astryxdesign/theme-brutalist

Zero radius, monospace, heavy borders.
> **Note:** This theme is private and not published to npm.
## Install

```bash
npm install @astryxdesign/theme-brutalist
```

## Usage

Wrap your app with `XDSTheme` and pass the theme:

```tsx
import {XDSTheme} from '@astryxdesign/core/theme';
import {brutalistTheme} from '@astryxdesign/theme-brutalist/built';

function App() {
  return (
    <XDSTheme theme={brutalistTheme}>
      {/* your app */}
    </XDSTheme>
  );
}
```

### Import paths

| Path | Use case |
|------|----------|
| `@astryxdesign/theme-brutalist` | Source build (StyleX compilation via `@astryxdesign/build`) |
| `@astryxdesign/theme-brutalist/built` | Pre-built dist (Tailwind, plain CSS, or no build step) |
| `@astryxdesign/theme-brutalist/theme.css` | Pre-built CSS file (import in your stylesheet) |

If you're using `@astryxdesign/build` for StyleX source compilation, import from the bare path. Otherwise, use `/built`.

### CSS import

Add the theme CSS to your stylesheet:

```css
@import "@astryxdesign/theme-brutalist/theme.css";
```

This is required for component-level theme overrides (colors, radii, typography) to take effect.

## Related Packages

| Package | Description |
|---------|-------------|
| [`@astryxdesign/core`](https://github.com/facebook/astryx/tree/main/packages/core) | Core components and theme system |
| [`@astryxdesign/build`](https://github.com/facebook/astryx/tree/main/packages/build) | Build plugins for StyleX source builds |
| [`@astryxdesign/cli`](https://github.com/facebook/astryx/tree/main/packages/cli) | CLI tooling including `astryx docs theme` |
