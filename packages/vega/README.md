# @xds/vega

XDS Vega wrapper — chart and data visualization components.

Wraps [`vega-embed`](https://github.com/vega/vega-embed) in a React component that integrates cleanly with the XDS design system.

<!-- SYNC: When files in this directory change, update this document. -->

## File Manifest

| File | Role | Purpose |
|------|------|---------|
| `package.json` | Config | Package metadata, deps, build scripts |
| `tsconfig.json` | Config | TypeScript compiler config (extends root) |
| `tsup.config.ts` | Config | Build config — CJS + ESM + `.d.ts` outputs |
| `src/index.ts` | Barrel | Public API surface |
| `src/VegaChart.tsx` | Component | React wrapper around `vega-embed` |
| `src/types.ts` | Types | Shared TypeScript types for this package |

## Installation

```bash
yarn add @xds/vega vega-lite vega-embed
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

## API

### `<VegaChart>`

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `spec` | `TopLevelSpec` | — | Vega-Lite specification (required) |
| `options` | `EmbedOptions` | `{}` | vega-embed options (renderer, actions, tooltip…) |
| `className` | `string` | — | CSS class on the container div |
| `style` | `CSSProperties` | — | Inline styles on the container div |
| `onReady` | `() => void` | — | Called when the chart is fully rendered |
| `onError` | `(err: Error) => void` | — | Called on render failure |

## Build

```bash
yarn workspace @xds/vega build
```
