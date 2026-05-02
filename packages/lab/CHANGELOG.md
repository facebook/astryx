# @xds/lab

# 0.0.13

#### New Features

- **XDSChart** — Composable d3-based chart components (#1389)
- **XDSChartColors** — Palette accessor for data visualization (#1388)
- **XDSSankeyChart** — Ribbon-based flow visualization (#1516)
- **Advanced charts** — WebGL, streaming, confidence intervals, candlestick (#1397)
- **Radial charts + 3D charts** + `useXDSChartRange` (#1440)
- **Chart interactions** — brush, crosshair, zoom, select, highlight, reference lines (#1463)
- **Chart v2 architecture** — config model with series renderers (#1548, #1730)

#### Fixes

- Chart Tier 1 correctness — xKey in context, bars from zero (#1402)
- Chart Tier 2 — remove hardcoded colors, document DPR contract (#1424)
- Rewrite zoom/pan + fix yDomain ratcheting (#1527)
- Merge Crosshair into Tooltip, use XDS Layer for top-layer rendering (#1514)
- CodeEditor: perf/theme stories, remove span fallback (#1470)
- CodeBlock: per-line tokens, skip default color, fix `::highlight` selectors (#1369)

#### Patch Changes

- Updated dependencies
  - @xds/core@0.0.13

---

# 0.0.5

#### Patch Changes

- Updated dependencies
  - @xds/core@0.0.5
