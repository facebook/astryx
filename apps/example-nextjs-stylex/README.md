# XDS Example: Next.js + StyleX (Dist)

Reference application for consuming **@xds/core** as a pre-built dist package with **StyleX** for product-level styles.

XDS component CSS comes pre-built; there is no need to compile XDS source. StyleX is only used for your own app-level layout and custom styles, compiled at build time via the PostCSS plugin.

## CSS Layer Integration

This example uses StyleX's `useCSSLayers.before` option to declare XDS dist layers before the StyleX app layers:

```js
// postcss.config.js
useCSSLayers: {
  before: ['reset', 'xds-base', 'xds-theme'],
}
```

This produces a layer order of:

```
reset < xds-base < xds-theme < stylex.base < stylex.1 < stylex.2 < ...
```

Product-level StyleX styles always win over XDS component defaults without needing `!important` or extra specificity.

## Key Difference from Source Build

|                     | This example (dist + StyleX)                | Source build                                 |
| ------------------- | ------------------------------------------- | -------------------------------------------- |
| XDS CSS             | Pre-built via `@import "@xds/core/xds.css"` | Compiled from source via StyleX babel plugin |
| PostCSS `include`   | `src/**/*` only (your code)                 | `src/**/*` + `node_modules/@xds/core/**/*`   |
| StyleX `aliases`    | Not needed                                  | Required for `createTheme` resolution        |
| `transpilePackages` | Not needed                                  | Required in next.config                      |
| Layer ordering      | `useCSSLayers.before` declares XDS layers   | `useCSSLayers: true` (XDS layers mixed in)   |

## Setup Steps

### 1. Install dependencies

```bash
npm install @stylexjs/stylex @xds/core @xds/theme-default next react react-dom
npm install --save-dev @stylexjs/babel-plugin @stylexjs/postcss-plugin \
  @babel/preset-react @babel/preset-typescript typescript @types/react @types/react-dom
```

### 2. Browserslist

```json
{
  "browserslist": ["last 1 Chrome version"]
}
```

### 3. Babel config

`babel.config.js`: StyleX for app-level styles only:

```js
module.exports = {
  presets: ['next/babel'],
  plugins: [
    [
      '@stylexjs/babel-plugin',
      {
        dev: process.env.NODE_ENV === 'development',
        runtimeInjection: false,
        genConditionalClasses: true,
        treeshakeCompensation: true,
        unstable_moduleResolution: {
          type: 'commonJS',
          rootDir: __dirname,
        },
      },
    ],
  ],
};
```

> No `aliases` config needed; we're not compiling XDS source.

### 4. PostCSS config

`postcss.config.js`: scan your app source, declare XDS layers before StyleX layers:

```js
module.exports = {
  plugins: {
    '@stylexjs/postcss-plugin': {
      include: ['src/**/*.{js,jsx,ts,tsx}'],
      babelConfig: {
        /* ... */
      },
      useCSSLayers: {
        before: ['reset', 'xds-base', 'xds-theme'],
      },
    },
  },
};
```

### 5. CSS entry point

`src/app/globals.css`:

```css
@import '@xds/core/reset.css';
@import '@xds/core/xds.css';
@import '@xds/theme-default/theme.css';

@stylex;
```

### 6. Theme + Link provider

```tsx
'use client';
import Link from 'next/link';
import {Theme} from '@xds/core/theme';
import {LinkProvider} from '@xds/core/Link';
import {defaultTheme} from '@xds/theme-default/built';

export function Providers({children}) {
  return (
    <Theme theme={defaultTheme}>
      <LinkProvider component={Link}>{children}</LinkProvider>
    </Theme>
  );
}
```

## Related

- [Plain dist example](../example-nextjs/): no CSS framework, inline styles for layout
- [Dist + Tailwind example](../example-nextjs-tailwind/): Tailwind for layout styles
