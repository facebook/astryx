# @stylexjs/esbuild-plugin

Use StyleX with _esbuild_ bundler.

This plugin transforms files that contain `stylexjs` imports and generates a
`stylexjs` CSS bundle.

## Installation

```
npm install --save-dev @stylexjs/esbuild-plugin
```

## Usage

```typescript
import esbuild from 'esbuild';
import stylexPlugin from '@stylexjs/esbuild-plugin';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

esbuild.build({
  entryPoints: ['src/index.js'],
  bundle: true,
  outfile: './build/bundle.js',
  minify: true,
  plugins: [
    stylexPlugin({
      // If set to 'true', bundler will inject styles in-line
      // Do not use in production
      dev: false,
      // Required. File path for the generated CSS file
      generatedCSSFileName: path.resolve(__dirname, 'build/stylex.css'),
      // Aliases for StyleX package imports
      // default: '@stylexjs/stylex'
      stylexImports: ['@stylexjs/stylex'],
      // Required for CSS variable support
      unstable_moduleResolution: {
        // type: 'commonJS' | 'haste'
        // default: 'commonJS'
        type: 'commonJS',
        // The absolute path to the root of your project
        rootDir: __dirname,
      },
    }),
  ],
});
```
## Plugin Options
It inherits all options from `@stylexjs/babel-plugin` and can be found [here 🔗](https://stylexjs.com/docs/api/configuration/babel-plugin/). Along with other options like <br/>

### generatedCSSFileName
```js
generatedCSSFileName: string // Default: 'stylex.css'
```
The name of the output css file.

---
### useCSSLayers
```js
useCSSLayers: boolean // Default: false
```
Enabling this option switches Stylex from using `:not(#\#)` to using `@layers` for handling CSS specificity.

---
### babelConfig
```js
babelConfig: {
  plugins: PluginItem[],
  presets: PluginItem[]
} // Default: { plugins: [], presets: [] }
```
List of custom babel plugins and presets which can be used during code transformation.


---
You can see the example usage
[here](https://github.com/facebook/stylex/apps/examples-esbuild).
