# @astryxdesign/theme-default

Clean, professional default theme. Uses [Heroicons](https://heroicons.com) icons.

## Install

```bash
npm install @astryxdesign/theme-default
```

## Usage

Wrap your app with `XDSTheme` and pass the theme:

```tsx
import {XDSTheme} from '@astryxdesign/core/theme';
import {defaultTheme} from '@astryxdesign/theme-default/built';

function App() {
  return (
    <XDSTheme theme={defaultTheme}>
      {/* your app */}
    </XDSTheme>
  );
}
```

### Import paths

| Path | Use case |
|------|----------|
| `@astryxdesign/theme-default` | Source build (StyleX compilation via `@astryxdesign/build`) |
| `@astryxdesign/theme-default/built` | Pre-built dist (Tailwind, plain CSS, or no build step) |
| `@astryxdesign/theme-default/theme.css` | Pre-built CSS file (import in your stylesheet) |

If you're using `@astryxdesign/build` for StyleX source compilation, import from the bare path. Otherwise, use `/built`.

### CSS import

Add the theme CSS to your stylesheet:

```css
@import "@astryxdesign/theme-default/theme.css";
```

This is required for component-level theme overrides (colors, radii, typography) to take effect.

## Related Packages

| Package | Description |
|---------|-------------|
| [`@astryxdesign/core`](https://github.com/facebook/astryx/tree/main/packages/core) | Core components and theme system |
| [`@astryxdesign/build`](https://github.com/facebook/astryx/tree/main/packages/build) | Build plugins for StyleX source builds |
| [`@astryxdesign/cli`](https://github.com/facebook/astryx/tree/main/packages/cli) | CLI tooling including `astryx docs theme` |
