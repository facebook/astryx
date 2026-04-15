# @xds/vega

XDS Vega wrapper -- chart and data visualization components.

Renders [Vega](https://vega.github.io/vega/) and [Vega-Lite](https://vega.github.io/vega-lite/) specifications via the Vega runtime. The component inspects `$schema` to decide whether to compile (Vega-Lite) or render directly (Vega), validates the schema URL before doing either, and exposes the full Vega `parse()` and `View` construction APIs as props.

<!-- SYNC: When files in this directory change, update this document. -->

## File Manifest

| File | Role | Purpose |
|------|------|---------|
| `package.json` | Config | Package metadata, deps, build scripts |
| `tsconfig.json` | Config | TypeScript compiler config (extends root) |
| `tsup.config.ts` | Config | Build config -- CJS + ESM + `.d.ts` outputs |
| `src/index.ts` | Barrel | Public API surface |
| `src/XDSVegaChart.tsx` | Component | Inspects `$schema`, compiles or renders, owns View lifecycle |
| `src/schema.ts` | Utility | Parses and validates Vega/Vega-Lite `$schema` URLs |
| `src/types.ts` | Types | Shared TypeScript types for this package |

## Installation

```bash
yarn add @xds/vega vega vega-lite
```

## Usage

### Vega-Lite spec (compiled automatically)

```tsx
import {XDSVegaChart} from '@xds/vega';

<XDSVegaChart
  spec={{
    $schema: 'https://vega.github.io/schema/vega-lite/v5.json',
    mark: 'bar',
    data: {values: [{a: 'A', b: 28}, {a: 'B', b: 55}]},
    encoding: {
      x: {field: 'a', type: 'ordinal'},
      y: {field: 'b', type: 'quantitative'},
    },
  }}
/>
```

### Vega spec (rendered directly, no compilation)

```tsx
<XDSVegaChart
  spec={{
    $schema: 'https://vega.github.io/schema/vega/v5.json',
    marks: [...],
  }}
/>
```

### Full configuration

```tsx
<XDSVegaChart
  spec={spec}
  parseConfig={{background: '#1a1a1a'}}
  parseOptions={{ast: true}}
  viewOptions={{
    renderer: 'canvas',
    logLevel: 1,
    tooltip: myTooltipHandler,
    locale: myLocale,
    loader: myLoader,
  }}
  onReady={view => {
    view.addSignalListener('highlight', (name, value) => {
      console.log('signal:', name, value);
    });
  }}
  onError={err => console.error('Chart error:', err.message)}
/>
```

## API

### `<XDSVegaChart>`

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `spec` | `AnySpec` | -- | Vega or Vega-Lite spec with `$schema` (required) |
| `data` | `ViewData` | -- | Initial dataset values — `{datasetName: tuples[]}` |
| `compileOptions` | `CompileOptions` | -- | Options passed to `compile(spec, options)` — Vega-Lite only |
| `parseConfig` | `Config` | -- | Vega config passed to `parse(spec, config)` |
| `parseOptions` | `ParseOptions` | -- | Options passed to `parse(spec, config, options)` |
| `viewOptions` | `Omit<ViewOptions, 'container'>` | -- | Options passed to `new View(runtime, options)` |
| `className` | `string` | -- | CSS class on the container div |
| `style` | `CSSProperties` | -- | Inline styles on the container div |
| `onReady` | `(view: View) => void` | -- | Called with the live Vega View when ready |
| `onError` | `(err: Error) => void` | -- | Called on schema error, compile failure, or render failure |

`viewOptions` maps directly to [`ViewOptions`](https://vega.github.io/vega/docs/api/view/) with `container` omitted (always set by the component). Notable fields:

| `viewOptions` field | Type | Description |
|---|---|---|
| `renderer` | `'svg' \| 'canvas'` | Rendering backend (default: `'svg'`) |
| `hover` | `boolean` | Enable hover encoding (default: `true`) |
| `logLevel` | `number` | Vega log verbosity |
| `logger` | `LoggerInterface` | Custom logger |
| `tooltip` | `TooltipHandler` | Custom tooltip handler |
| `locale` | `LocaleFormatters` | Number and time format locale |
| `loader` | `Loader` | Custom data loader |
| `background` | `Color` | Chart background color |

`compileOptions` fields (Vega-Lite specs only, ignored otherwise):

| `compileOptions` field | Type | Description |
|---|---|---|
| `config` | `VegaLiteConfig` | Vega-Lite config merged on top of the spec's config |
| `logger` | `LoggerInterface` | Custom logger used during compilation |
| `fieldTitle` | `(fieldDef, config) => string` | Custom field title formatter |

`parseOptions` fields:

| `parseOptions` field | Type | Description |
|---|---|---|
| `ast` | `boolean` | Retain expression AST in the runtime (useful for tooling) |

### Data loading

`data` maps dataset names to tuple arrays and is applied via `view.data(name, tuples)` during View initialization, before the first render. It is *not reactive* — changes after mount are ignored.

To update data dynamically after render, use `onReady` to get the live View and drive it yourself:

```tsx
<XDSVegaChart
  spec={spec}
  data={{table: [{category: 'A', value: 28}, {category: 'B', value: 55}]}}
  onReady={view => {
    // Later, update data dynamically:
    view.data('table', newRows);
    view.runAsync();
  }}
/>
```

### `parseSchema(schema)` (exported utility)

Parses and validates a Vega `$schema` URL. Returns:
- `{ok: true, library: 'vega' | 'vega-lite', version: string}` on success
- `{ok: false, error: string}` if the URL is missing, malformed, or names an unknown library

## Schema validation

`XDSVegaChart` validates `spec.$schema` before doing any work. It will call `onError` (and render nothing) if:

- `$schema` is missing or not a string
- The URL doesn't match the expected format (`schema/{library}/{version}.json`)
- The library name is not `vega` or `vega-lite`

## Build

```bash
yarn workspace @xds/vega build
```
