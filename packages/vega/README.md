# @xds/vega

XDS Vega wrapper — chart and data visualization components.

Compiles [Vega-Lite](https://vega.github.io/vega-lite/) specs and renders them via the [Vega](https://vega.github.io/vega/) runtime directly, giving you full access to the live `View` object for signals, data streaming, and event listeners.

<!-- SYNC: When files in this directory change, update this document. -->

## File Manifest

| File | Role | Purpose |
|------|------|---------|
| `package.json` | Config | Package metadata, deps, build scripts |
| `tsconfig.json` | Config | TypeScript compiler config (extends root) |
| `tsup.config.ts` | Config | Build config — CJS + ESM + `.d.ts` outputs |
| `src/index.ts` | Barrel | Public API surface |
| `src/VegaChart.tsx` | Component | Compiles Vega-Lite → Vega and owns the View lifecycle |
| `src/types.ts` | Types | Shared TypeScript types for this package |

## Installation

```bash
yarn add @xds/vega vega vega-lite
```

## Usage

```tsx
import {VegaChart} from '@xds/vega';

const spec = {
  mark: 'bar',
  data: {values: [{a: 'A', b: 28}, {a: 'B', b: 55}]},
  encoding: {
    x: {field: 'a', type: 'ordinal'},
    y: {field: 'b', type: 'quantitative'},
  },
};

<VegaChart spec={spec} />
```

Access the live Vega `View` via `onReady` for signals, streaming data, or event listeners:

```tsx
<VegaChart
  spec={spec}
  onReady={view => {
    view.addSignalListener('highlight', (name, value) => {
      console.log('signal:', name, value);
    });
  }}
/>
```

## API

### `<VegaChart>`

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `spec` | `TopLevelSpec` | — | Vega-Lite specification (required) |
| `viewConfig` | `Config` | — | Vega runtime config (renderer defaults, logging, etc.) |
| `renderer` | `'svg' \| 'canvas'` | `'svg'` | Rendering backend |
| `className` | `string` | — | CSS class on the container div |
| `style` | `CSSProperties` | — | Inline styles on the container div |
| `onReady` | `(view: View) => void` | — | Called with the live Vega View when ready |
| `onError` | `(err: Error) => void` | — | Called on compile or render failure |

## Build

```bash
yarn workspace @xds/vega build
```
