# XDS Example — Vite

Reference application for consuming **@xds/core** as a source distribution in a Vite + React project.

XDS ships as raw TypeScript + StyleX source. Consumers compile it at the application level — there's no pre-built CSS or JS bundle. This example shows the complete setup using `@stylexjs/unplugin`, which handles both StyleX compilation and CSS extraction in a single Vite plugin.

## How it differs from Next.js

| Concern             | Next.js                                                     | Vite                                 |
| ------------------- | ----------------------------------------------------------- | ------------------------------------ |
| StyleX integration  | Babel plugin + PostCSS plugin                               | `@stylexjs/unplugin` (single plugin) |
| CSS extraction      | PostCSS replaces `@stylex;` at-rule                         | Handled automatically by unplugin    |
| Config files needed | `babel.config.js` + `postcss.config.js` + `next.config.mjs` | `vite.config.ts` only                |
| Theme provider      | Needs `'use client'` boundary                               | No client/server boundary needed     |

## Setup Steps

### 1. Install dependencies

```bash
npm install @stylexjs/stylex @xds/core @xds/theme react react-dom
npm install --save-dev @stylexjs/unplugin @vitejs/plugin-react typescript \
  @types/react @types/react-dom vite
```

### 2. Vite config

`vite.config.ts` — configure the StyleX unplugin, React plugin, and resolve aliases:

```ts
import path from 'path';
import {fileURLToPath} from 'url';
import {defineConfig} from 'vite';
import react from '@vitejs/plugin-react';
import stylex from '@stylexjs/unplugin';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [
    stylex.vite({
      dev: process.env.NODE_ENV === 'development',
      runtimeInjection: false,
      treeshakeCompensation: true,
      unstable_moduleResolution: {
        type: 'commonJS',
        rootDir: __dirname,
      },
    }),
    react(),
  ],
  resolve: {
    alias: {
      '@xds/core/theme/tokens.stylex': path.resolve(
        __dirname,
        'node_modules/@xds/core/src/theme/tokens.stylex.ts',
      ),
      '@xds/core': path.resolve(__dirname, 'node_modules/@xds/core/src'),
    },
  },
});
```

> **Important:** The `resolve.alias` config points `@xds/core` to the source directory so Vite compiles XDS components from TypeScript source. The `unstable_moduleResolution` config helps StyleX resolve token definitions correctly. Plugin order matters — `stylex.vite()` must come before `react()`.

### 3. CSS entry point

`src/index.css` — a minimal CSS file so Vite emits a CSS asset for StyleX to append to:

```css
:root {
  --stylex-injection: 0;
}
```

Import it in `src/main.tsx`:

```tsx
import './index.css';
```

### 4. Theme provider

Wrap your app with `XDSTheme` and the default theme:

```tsx
import {XDSTheme} from '@xds/core/theme';
import {defaultTheme} from '@xds/theme/default';

export default function App() {
  return <XDSTheme theme={defaultTheme}>{/* your app */}</XDSTheme>;
}
```

No `'use client'` needed — Vite doesn't have server/client boundaries.

## Commands

```bash
# Start dev server with HMR
npm run dev

# Production build
npm run build

# Preview the production build
npm run preview
```

## Gotchas

| Issue                   | Symptom                                 | Fix                                                                       |
| ----------------------- | --------------------------------------- | ------------------------------------------------------------------------- |
| Missing resolve aliases | Module not found errors for `@xds/core` | Add `resolve.alias` pointing to source directory                          |
| Missing CSS entry point | StyleX has no CSS asset to append to    | Create a minimal `index.css` and import it in `main.tsx`                  |
| Plugin order            | Styles not extracted or HMR broken      | `stylex.vite()` must come before `react()` in the plugins array           |
| Duplicate React types   | JSX component type errors in monorepo   | Known monorepo issue with `@types/react` hoisting; doesn't affect runtime |

## Related

- [Issue #145 — Example apps for source distribution consumers](https://github.com/facebookexperimental/xds/issues/145)
- [StyleX Vite React example](https://github.com/facebook/stylex/tree/main/examples/example-vite-react)
- [XDS Example — Next.js](../example-nextjs/)
