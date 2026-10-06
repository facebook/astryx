# @astryxdesign/charts

Astryx charts — a config-model data visualization library built on d3.

```tsx
import {Chart, bar, line} from '@astryxdesign/charts';

<Chart data={data} xKey="month" series={[bar('revenue'), line('trend')]} />;
```

Marks are factory functions (`bar`, `line`, `area`, `dot`, `band`, `candlestick`,
`errorBar`, `referenceLine`, and WebGL variants) that return config objects passed
via the `series` prop. The chart root owns **one** x/y scale that every mark, axis,
and grid line reads, so they can never disagree. It consumes `@astryxdesign/core`
theme tokens directly (StyleX build mirrors `@astryxdesign/lab`).

> Note: this package is the successor to the experimental `Chart` (formerly
> `ChartV2`) that used to live in `@astryxdesign/lab`; that code has moved here and
> d3 is a direct dependency. (Supersedes the original "thin wrappers over a peer
> engine" framing of the bootstrap scaffold.)

## Status

Stable from its first stable release on the `latest` tag. From then on, its
package exports, its six documented components and their props, and its two block
templates follow Astryx's stable compatibility promise: no breaking change outside
a scheduled minor, and removal only after deprecation. Canary builds keep
publishing under `@canary`. See [`docs/`](./docs/) for the plan, design research,
readiness audit, and verification checklist.

## Install

```bash
npm install @astryxdesign/charts @astryxdesign/core
```

## Usage

```tsx
import {Chart, bar, line, ChartGrid, ChartAxis} from '@astryxdesign/charts';
import '@astryxdesign/core/astryx.css';
import '@astryxdesign/charts/charts.css';
```
