# @xds/postcss-plugin

PostCSS plugin for XDS source builds. Compiles StyleX from both XDS library source and product code, then splits the output into separate CSS layers.

## Install

```bash
npm install -D @xds/postcss-plugin @stylexjs/babel-plugin @babel/core
```

## Usage

```js
// babel.config.js
const path = require('path');

module.exports = {
  presets: ['next/babel'],
  plugins: [
    [
      '@stylexjs/babel-plugin',
      {
        dev: process.env.NODE_ENV !== 'production',
        runtimeInjection: false,
        enableInlinedConditionalMerge: true,
        treeshakeCompensation: true,
        aliases: {
          '@xds/core/*': [path.join(__dirname, 'node_modules/@xds/core/*')],
          '@xds/core': [path.join(__dirname, 'node_modules/@xds/core')],
        },
        unstable_moduleResolution: {type: 'commonJS'},
      },
    ],
  ],
};
```

```js
// postcss.config.js
const babelConfig = require('./babel.config');

module.exports = {
  plugins: {
    '@xds/postcss-plugin': {
      appDir: 'src',
      babelPlugins: babelConfig.plugins,
    },
  },
};
```

```css
/* globals.css */
@import './layers.css';
@import '@xds/core/reset.css';
@import '@xds/theme-default/theme.css';

@stylex;
```

```css
/* layers.css */
@layer reset, xds-base, xds-theme, product;
```

## What it does

The plugin scans both your app source and `node_modules/@xds/` for StyleX usage. It compiles everything in a single pass using the Babel plugin, then partitions the resulting CSS rules by file path:

- Rules from `node_modules/@xds/` → `@layer xds-base`
- Rules from your app source → `@layer product`

### Layer ordering

```
reset < xds-base < xds-theme < product
```

Product styles always win over XDS defaults without `!important`.

## Options

```ts
{
  /** Directory containing your app source (default: 'src') */
  appDir?: string;

  /** StyleX babel plugins from your babel.config.js */
  babelPlugins?: any[];

  /** Layer names (override if needed) */
  layers?: {
    library?: string;  // default: 'xds-base'
    product?: string;  // default: 'product'
  };

  /** Additional include globs beyond appDir and @xds packages */
  extraInclude?: string[];

  /** Exclude globs */
  exclude?: string[];
}
```

## Why a separate `layers.css` file?

The `@layer` order declaration must appear before any layer content in the CSS output. In Next.js, webpack hoists `@import` content above inline CSS in the same file, so an inline `@layer` statement in `globals.css` would appear _after_ `reset.css` and `theme.css` content. A separate `layers.css` file imported first ensures correct ordering.

## Related

- [`@xds/vite-plugin`](../vite-plugin/) — Vite plugin for source builds
- [example-nextjs-source](../../apps/example-nextjs-source/) — Full Next.js source build example
