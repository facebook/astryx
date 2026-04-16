# @xds/vite-plugin

Vite plugin for XDS source builds. Wraps `@stylexjs/unplugin` and splits the compiled CSS into separate named layers so product styles always override library defaults.

## Install

```bash
npm install -D @xds/vite-plugin @stylexjs/unplugin @stylexjs/babel-plugin
```

## Usage

```ts
// vite.config.ts
import {xdsStylex} from '@xds/vite-plugin';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [
    ...xdsStylex({
      stylexOptions: {
        dev: process.env.NODE_ENV === 'development',
        runtimeInjection: false,
        treeshakeCompensation: true,
        unstable_moduleResolution: {
          type: 'commonJS',
          rootDir: __dirname,
        },
      },
    }),
    react(),
  ],
  resolve: {
    alias: {
      '@xds/core': path.resolve(__dirname, 'node_modules/@xds/core/src'),
    },
  },
  optimizeDeps: {
    exclude: ['@xds/core', '@xds/theme-default'],
  },
});
```

## What it does

`xdsStylex()` returns an array of three Vite plugins:

1. **Layer order declaration** — injects `@layer reset, xds-base, xds-theme, product;` into `<head>` before any CSS
2. **StyleX unplugin** — compiles StyleX from both XDS source and product code (delegates to `@stylexjs/unplugin`)
3. **Split-layer interceptor** — intercepts the StyleX CSS endpoint and rewrites the output, partitioning rules by file path into named layers

### Layer ordering

```
reset < xds-base < xds-theme < product
```

- **reset** — XDS reset stylesheet (`@xds/core/reset.css`)
- **xds-base** — XDS component styles (compiled from `node_modules/@xds/`)
- **xds-theme** — Theme overrides (`@xds/theme-default/theme.css`)
- **product** — Your app's StyleX styles (compiled from `src/`)

Product styles always win over XDS defaults without `!important`.

## Options

```ts
interface XDSVitePluginOptions {
  /** Options passed to @stylexjs/unplugin */
  stylexOptions: StylexUnpluginOptions;

  /** Pattern to identify library files (default: 'node_modules/@xds/') */
  libraryPattern?: string;

  /** Layer names */
  layers?: {
    library?: string; // default: 'xds-base'
    product?: string; // default: 'product'
  };
}
```

## How it works

The StyleX unplugin collects compiled CSS rules in an internal map keyed by source file path. In dev mode, it serves this CSS via a virtual endpoint (`/virtual:stylex.css`).

This plugin intercepts that endpoint with a middleware that runs before the unplugin's middleware. It reads the same rules map, partitions entries by whether their file path contains `node_modules/@xds/`, processes each group through `stylexBabelPlugin.processStylexRules()` separately, and wraps them in named `@layer` blocks.

## Related

- [`@xds/postcss-plugin`](../postcss-plugin/) — PostCSS plugin for Next.js source builds
- [`@stylexjs/unplugin`](https://github.com/facebook/stylex) — The underlying StyleX compiler
