# XDS Example — Next.js

Reference application for consuming **@xds/core** as a source distribution in a Next.js project.

XDS ships as raw TypeScript + StyleX source. Consumers compile it at the application level — there's no pre-built CSS or JS bundle. This example shows the complete setup.

## Setup Steps

### 1. Install dependencies

```bash
npm install @stylexjs/stylex @xds/core next react react-dom
npm install --save-dev @stylexjs/babel-plugin @stylexjs/postcss-plugin \
  @babel/preset-react @babel/preset-typescript typescript @types/react @types/react-dom
```

### 2. Babel config

`babel.config.js` — configure StyleX as a **plugin** (not a preset) with `next/babel`:

```js
const path = require('path');

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
        aliases: {
          '@xds/core/*': [path.join(__dirname, 'node_modules/@xds/core/*')],
          '@xds/core': [path.join(__dirname, 'node_modules/@xds/core')],
        },
        unstable_moduleResolution: {
          type: 'commonJS',
          rootDir: __dirname,
        },
      },
    ],
  ],
};
```

> **Important:** The `aliases` config is required for `stylex.createTheme` to resolve token definitions correctly. Without it, theme overrides silently fail.

### 3. PostCSS config

`postcss.config.js` — this is how Next.js extracts StyleX CSS:

```js
const babelConfig = require('./babel.config');

module.exports = {
  plugins: {
    '@stylexjs/postcss-plugin': {
      include: [
        'src/**/*.{js,jsx,ts,tsx}',
        'node_modules/@xds/core/**/*.{ts,tsx}',
      ],
      babelConfig: {
        babelrc: false,
        parserOpts: {plugins: ['typescript', 'jsx']},
        presets: [
          ['@babel/preset-react', {runtime: 'automatic'}],
          '@babel/preset-typescript',
        ],
        plugins: babelConfig.plugins,
      },
      useCSSLayers: true,
    },
  },
};
```

### 4. CSS entry point with `@stylex;` directive

`src/app/globals.css`:

```css
@stylex;
```

Import it in your root layout:

```tsx
import './globals.css';
```

### 5. Next.js config

`next.config.mjs` — add `transpilePackages` so Next.js compiles XDS source:

```js
const nextConfig = {
  transpilePackages: ['@xds/core', '@xds/theme-default'],
  typescript: {ignoreBuildErrors: true},
};
export default nextConfig;
```

Also add a `browserslist` to `package.json` to set proper CSS build targets. The StyleX babel plugin uses lightningcss internally, and without modern targets it will lower `light-dark()` into broken polyfill variables:

```json
{
  "browserslist": ["last 1 Chrome version"]
}
```

> For internal tools targeting latest Chrome, `"last 1 Chrome version"` is sufficient. For broader browser support, use targets that include Chrome 123+ (when `light-dark()` shipped).

### 6. Theme provider (client boundary)

```tsx
// src/app/providers.tsx
'use client';
import {XDSTheme} from '@xds/core/theme';
import {defaultTheme} from '@xds/theme-default';

export function Providers({children}) {
  return <XDSTheme theme={defaultTheme}>{children}</XDSTheme>;
}
```

## Gotchas

| Issue                               | Symptom                                     | Fix                                                              |
| ----------------------------------- | ------------------------------------------- | ---------------------------------------------------------------- |
| Missing `@stylex;` directive        | PostCSS produces empty CSS with no error    | Add `@stylex;` to your CSS entry file                            |
| PostCSS `include` doesn't cover XDS | XDS component styles are missing            | Add `node_modules/@xds/core/**/*.{ts,tsx}` to `include`          |
| Missing `aliases` in babel config   | `createTheme` token overrides silently fail | Add `aliases` mapping for `@xds/core` and `@xds/core/*`          |
| No `'use client'` on theme provider | Server component error from `createContext` | Mark the provider file with `'use client'`                       |
| StyleX as preset instead of plugin  | Build errors or missing styles              | Use `plugins` array, not `presets`, for `@stylexjs/babel-plugin` |

## Testing outside the monorepo

This example lives in the XDS monorepo for convenience, but it should be representative of a real app consuming `@xds/core` from npm. Monorepo workspace resolution can silently bypass issues that external consumers hit (missing dependencies, wrong include paths, different CSS pipeline behavior).

**Before merging changes to this example, test it as an external consumer** — see the [Testing Example Apps](https://github.com/facebookexperimental/xds/wiki/Testing-Example-Apps) wiki page for the full procedure.

## Related

- [Issue #145 — Add example-nextjs project](https://github.com/facebookexperimental/xds/issues/145)
- [StyleX examples](https://github.com/facebook/stylex/tree/main/examples)
- [Working prototype (cixzhang/xds_sandbox)](https://github.com/cixzhang/xds_sandbox)
