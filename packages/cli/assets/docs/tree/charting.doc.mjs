// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file `astryx docs cli/integrations/building-blocks/components/charting`:
 * build theme-aware SVG, Canvas, GPU, exported, and third-party charts.
 */

/** @type {import('@astryxdesign/cli/authoring').ReferenceDoc} */
export const docs = {
  type: 'generic',
  name: 'charting',
  placement: {parent: 'namespace:components', slot: 'guides', order: 90},
  title: 'Theme chart components',
  category: 'guide',
  description:
    'Use existing Astryx theme tokens in editable SVG, Canvas, configuration-driven, and GPU charts.',
  keywords: [
    'data visualization',
    'chart theme',
    'chart color picker',
    'SVG chart',
    'Canvas chart',
    'WebGL chart',
    'Recharts',
    'Vega',
  ],
  sections: [
    {
      id: 'start-here',
      title: 'Start with the existing theme APIs',
      content: [
        {
          type: 'prose',
          text: 'Use Astryx’s existing theme tokens to style charts. Keep renderer settings, saved user choices, validation, and document storage in the product that owns the chart; Astryx does not define a shared chart editor or saved-color format in this version.',
        },
        {
          type: 'prose',
          text: 'Use the whole guide when people can customize a chart, save their choices, or show the same chart with more than one renderer, such as Recharts, Vega-Lite, or Canvas.',
        },
        {
          type: 'prose',
          text: 'For a fixed chart with no color controls, use the token and renderer guidance and skip the sections about color pickers and saved choices.',
        },
      ],
    },
    {
      id: 'choose-transport',
      title: 'Choose the color format where it is consumed',
      content: [
        {
          type: 'table',
          headers: ['Consumption point', 'Use', 'Theme update'],
          rows: [
            [
              'Verified live DOM or SVG paint with no library parsing',
              'A retained Astryx CSS token reference',
              'Let the CSS cascade repaint the existing node',
            ],
            [
              'Options, color math, Canvas, serialized config, workers, SSR, or export',
              'A concrete color from the active theme resolver',
              'Update the existing options or drawing state and redraw',
            ],
            [
              'GPU uniform or buffer',
              'A product-owned conversion to the channel format the GPU API expects',
              'Update the existing uniform or buffer',
            ],
            [
              'Gradient, pattern, image, or renderer runtime object',
              'A renderer-owned object built locally',
              'Rebuild only that paint resource',
            ],
          ],
        },
        {
          type: 'prose',
          text: 'Do not assume that every SVG renderer accepts CSS variables. Some libraries parse colors in JavaScript before creating SVG. Verify the exact property and renderer path you use.',
        },
      ],
    },
    {
      id: 'map-chart-roles',
      title: 'Map chart roles to existing Astryx tokens',
      content: [
        {
          type: 'table',
          headers: ['Visualization role', 'Astryx source'],
          rows: [
            ['Series fill or stroke', 'Categorical or scale data tokens'],
            [
              'Series identity beyond color',
              'Renderer-owned shapes, patterns, dash styles, or direct labels with a text equivalent',
            ],
            ['Grid', '`--color-border` or another verified structural token'],
            [
              'Axis and tick lines',
              '`--color-border-emphasized` or another verified structural token',
            ],
            [
              'Axis, legend, and annotation text',
              'Text color and typography tokens',
            ],
            [
              'Tooltip or popover surface',
              'Background, border, text, `--radius-element`, and shadow tokens',
            ],
            [
              'Container surface',
              '`--radius-container` when it owns a surface',
            ],
            [
              'Toolbar icons and controls',
              'Astryx `Icon` or `IconButton`, semantic foreground tokens, and established icon sizes',
            ],
            [
              'Toolbar, legend, and tooltip spacing',
              'Spacing tokens for toolbar, legend, tooltip, and control gaps; renderer-owned plot geometry',
            ],
            ['Focus', 'Focus outline tokens'],
            [
              'Hover or active series',
              'The same series color mixed with `--color-tint-hover`, plus a non-color cue',
            ],
            [
              'Selected, muted, forecast, or disabled series',
              'The same series identity plus a border, pattern, label, marker, or line-style change',
            ],
          ],
        },
        {
          type: 'prose',
          text: 'Use `Button` for chart actions with visible text and `IconButton` for familiar icon-only actions. Import `IconButton` from `@astryxdesign/core/IconButton` and render its glyph with `Icon` from `@astryxdesign/core/Icon`. `label` is the accessible name; add `tooltip` when sighted people may not recognize the action. If no semantic Astryx icon fits, pass a product-owned SVG component through `Icon` instead of rendering an unstyled SVG directly in the control.',
        },
        {
          type: 'code',
          lang: 'tsx',
          code: `import {Icon} from '@astryxdesign/core/Icon';
import {IconButton} from '@astryxdesign/core/IconButton';

// DownloadGlyph is a product-owned SVG component.
<IconButton
  icon={<Icon icon={DownloadGlyph} />}
  label="Download quarterly performance chart"
  tooltip="Download chart"
  variant="ghost"
/>`,
        },
        {
          type: 'prose',
          text: 'Use spacing tokens for application chrome around the plot. In StyleX code, import `spacingVars` from `@astryxdesign/core/theme/tokens.stylex`; current names use the numeric step scale such as `--spacing-2`, `--spacing-3`, and `--spacing-4`, not a `100` or `400` scale. Resolve the same verified tokens with `token()` when a non-CSS API needs concrete spacing. Plot margins, tick gaps, hit geometry, and data-density decisions stay local to the renderer. A compact treatment still needs readable labels and usable pointer and touch targets.',
        },
        {
          type: 'prose',
          text: 'Color cannot be the only way to distinguish a series or state. Combine it with a direct label, marker shape, line style, pattern, border, or another cue. Apply the same cue to the plotted mark, legend key, tooltip or direct label, and exported form; a legend-only shape does not distinguish otherwise identical marks in the plot.',
        },
        {
          type: 'prose',
          text: 'For Canvas or exported output, draw renderer-owned icon paths or images with concrete resolved colors. Do not serialize React icon components or document-dependent CSS references.',
        },
        {
          type: 'prose',
          text: 'Do not create renderer-named tokens such as `--recharts-grid-color`. Keep data, scales, interactions, events, and renderer compatibility in the chart component that owns them.',
        },
      ],
    },
    {
      id: 'store-product-owned-intent',
      title: 'Keep end-user color choices product-owned',
      content: [
        {
          type: 'table',
          headers: ['Choice', 'Suggested product behavior', 'Theme behavior'],
          rows: [
            [
              'Automatic (use chart default)',
              'Save no manual color override',
              'The chart uses the product default from the active theme',
            ],
            [
              'Theme color',
              'Save the product’s stable token choice',
              'The resolved color follows the active theme and mode',
            ],
            [
              'Custom color',
              'Save a validated portable color owned by the product',
              'The exact color stays fixed until the person changes it',
            ],
          ],
        },
        {
          type: 'prose',
          text: 'Reset deletes the manual choice and returns control to the chart default. The product owns its saved shape, validation, migration, automatic assignment, localized labels, and error presentation. Astryx does not guarantee compatibility for that stored product data in this version.',
        },
        {
          type: 'code',
          lang: 'ts',
          code: `// Illustrative product state, not an Astryx public type.
type ProductSeriesColor =
  | {kind: 'theme'; token: string}
  | {kind: 'custom'; color: string};

type StoredSeries = {
  id: string;
  color?: ProductSeriesColor; // absent means Automatic
};

function resetSeriesColor(series: StoredSeries): StoredSeries {
  const {color: _removed, ...automatic} = series;
  return automatic;
}`,
        },
        {
          type: 'prose',
          text: 'Astryx does not define a persisted color format. If your product accepts custom colors, choose and document a JSON-safe format. For example, a product could accept normalized opaque six-digit sRGB hex (`#RRGGBB`). Supporting alpha, named colors, functional syntax, or wider color spaces is a product decision.',
        },
        {
          type: 'prose',
          text: 'Treat saved chart settings as untrusted input. Allow only the product’s curated token IDs, validate custom colors before resolution, version the product-owned envelope, and define how invalid or unknown series recover. Do not pass an invalid stored string to CSS, Canvas, or a renderer.',
        },
      ],
    },
    {
      id: 'build-product-picker',
      title: 'Build a product-owned theme-color picker',
      content: [
        {
          type: 'prose',
          text: 'Curate a small set of chart-safe categorical tokens for the product. Keep the token name as the product’s stable identity and resolve a fresh preview from the active theme. Do not expose every general UI color or raw generated palette stop by default.',
        },
        {
          type: 'code',
          lang: 'tsx',
          code: `'use client';

import {useMemo} from 'react';
import {useTheme} from '@astryxdesign/core/theme';

const productChartColors = [
  '--color-data-categorical-blue',
  '--color-data-categorical-orange',
  '--color-data-categorical-purple',
  '--color-data-categorical-green',
] as const;

export function useProductChartColorOptions() {
  const {token} = useTheme();
  return useMemo(
    () =>
      productChartColors.map(id => ({
        id,
        preview: token(id),
      })),
    [token],
  );
}`,
        },
        {
          type: 'prose',
          text: 'The product supplies visible labels, accessible names, grouping, search terms, custom-color validation, and picker layout. A generated palette remains theme-authoring material: map selected values to stable data tokens when defining the theme instead of inspecting raw palette stops at runtime.',
        },
      ],
    },
    {
      id: 'use-direct-css-paint',
      title: 'Use CSS token references only for direct paint',
      content: [
        {
          type: 'prose',
          text: 'For a verified live DOM or SVG paint property, import `dataVars` and pass the value directly. Importing `dataVars` retains the complete atomic data-variable group once for the compiled app; it does not create a stylesheet for every chart.',
        },
        {
          type: 'code',
          lang: 'tsx',
          code: `import {dataVars} from '@astryxdesign/core/theme/dataTokens.stylex';

export function SeriesMark() {
  return (
    <circle
      cx={12}
      cy={12}
      r={8}
      fill={dataVars['--color-data-categorical-blue']}
    />
  );
}`,
        },
        {
          type: 'prose',
          text: 'Do not construct `var(--color-data-*)` strings by hand. Theme overrides also require Astryx’s layered StyleX build boundary; follow the **Vite Setup** section of the `@astryxdesign/build` README before using these imports in a new app. A bare unlayered transform can outrank layered theme overrides.',
        },
      ],
    },
    {
      id: 'resolve-concrete-values',
      title: 'Resolve concrete values for Canvas and configuration APIs',
      content: [
        {
          type: 'code',
          lang: 'tsx',
          code: `'use client';

import {useEffect, useRef} from 'react';
import {useTheme} from '@astryxdesign/core/theme';

function cssLengthToPixels(value: string): number {
  const probe = document.createElement('div');
  probe.style.blockSize = '0';
  probe.style.inlineSize = value;
  probe.style.position = 'fixed';
  probe.style.visibility = 'hidden';
  if (!probe.style.inlineSize) return 0;
  document.body.appendChild(probe);
  const pixels = probe.getBoundingClientRect().width;
  probe.remove();
  return Number.isFinite(pixels) ? pixels : 0;
}

export function CanvasSeries() {
  const ref = useRef<HTMLCanvasElement>(null);
  const {token} = useTheme();
  const color = token('--color-data-categorical-blue');
  const fontFamily = token('--font-family-body');
  const fontSize = token('--text-supporting-size');
  const radius = token('--radius-element');

  useEffect(() => {
    const context = ref.current?.getContext('2d');
    if (!context) return;
    const radiusPixels = cssLengthToPixels(radius);
    context.clearRect(0, 0, 320, 160);
    context.fillStyle = color;
    context.beginPath();
    context.roundRect(32, 32, 64, 112, [
      radiusPixels,
      radiusPixels,
      0,
      0,
    ]);
    context.fill();
    context.fillStyle = token('--color-text-secondary');
    context.font = \`\${fontSize} \${fontFamily}\`;
    context.fillText('Q1', 48, 152);
  }, [color, fontFamily, fontSize, radius, token]);

  return <canvas ref={ref} width={320} height={160} />;
}`,
        },
        {
          type: 'prose',
          text: 'Token resolvers return concrete CSS values, but a concrete value can still include a unit such as `rem`. Preserve the token string when an API accepts CSS syntax, as `context.font` does. When an API requires numeric pixels, convert supported units deliberately; `Number.parseFloat` alone is not safe for `rem`, `em`, percentages, or calculated lengths. The product owns that conversion for its renderer.',
        },
        {
          type: 'prose',
          text: 'Choose one coherent accessibility path for Canvas. A concise chart may use `role="img"` with an accessible name and description. If a complete adjacent table or text summary is the primary alternative, the Canvas may be `aria-hidden="true"`; label the surrounding figure and keep the alternative in the accessibility tree. Do not attach ARIA descriptions to an `aria-hidden` Canvas.',
        },
      ],
    },
    {
      id: 'resolve-outside-react',
      title: 'Resolve outside React and during export',
      content: [
        {
          type: 'code',
          lang: 'ts',
          code: `import {resolveThemeTokens} from '@astryxdesign/core/theme/tokens';
import {productTheme} from './productTheme';

const tokens = resolveThemeTokens(productTheme, {mode: 'dark'});
const exportConfig = {
  fill: tokens['--color-data-categorical-blue'],
  textColor: tokens['--color-text-primary'],
};

JSON.stringify(exportConfig);`,
        },
        {
          type: 'prose',
          text: 'Server rendering and export require an explicit theme and light or dark mode. Do not infer a client’s system preference. A worker should receive only the concrete values it uses. When the product changes theme or mode, send a fresh payload; do not send hooks, document-dependent CSS references, callbacks, or the full theme object.',
        },
        {
          type: 'prose',
          text: 'Define an export’s logical dimensions, pixel ratio, background transparency, format, filename, locale, and mode explicitly. Paint the background when the file must be opaque, and verify that patterns, labels, borders, and typography survive the exported output.',
        },
      ],
    },
    {
      id: 'apply-to-recharts',
      title: 'Apply the direct-paint path to Recharts',
      content: [
        {
          type: 'prose',
          text: 'Recharts passes the demonstrated bar, grid, axis, tooltip, and legend text values to live SVG or HTML properties. Use Astryx variables for those verified properties. This example does not imply that every Recharts prop or future release accepts CSS references.',
        },
        {
          type: 'code',
          lang: 'tsx',
          code: `import {dataVars} from '@astryxdesign/core/theme/dataTokens.stylex';
import {
  colorVars,
  radiusVars,
  shadowVars,
  typographyVars,
  typeScaleVars,
} from '@astryxdesign/core/theme/tokens.stylex';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

export function RevenueChart({data}) {
  const tick = {
    fill: colorVars['--color-text-secondary'],
    fontFamily: typographyVars['--font-family-body'],
    fontSize: typeScaleVars['--text-supporting-size'],
  };

  return (
    <BarChart
      accessibilityLayer
      data={data}
      desc="Quarterly revenue and costs"
      title="Quarterly performance">
      <CartesianGrid stroke={colorVars['--color-border']} />
      <XAxis dataKey="quarter" tick={tick} />
      <YAxis tick={tick} />
      <Tooltip
        contentStyle={{
          background: colorVars['--color-background-card'],
          borderColor: colorVars['--color-border'],
          borderRadius: radiusVars['--radius-element'],
          boxShadow: shadowVars['--shadow-med'],
          color: colorVars['--color-text-primary'],
        }}
      />
      <Legend
        wrapperStyle={{
          color: colorVars['--color-text-secondary'],
          fontFamily: typographyVars['--font-family-body'],
          fontSize: typeScaleVars['--text-supporting-size'],
        }}
      />
      <Bar
        dataKey="revenue"
        fill={dataVars['--color-data-categorical-blue']}
        isAnimationActive={false}
      />
    </BarChart>
  );
}`,
        },
        {
          type: 'prose',
          text: "`ResponsiveContainer` needs a parent with a definite height. Keep that height and chart margins renderer-owned; use Astryx spacing tokens only for chrome around the plot. Use `radiusVars['--radius-element']` for CSS-valued tooltip radius. If a Recharts geometry prop needs a number, resolve and deliberately convert the CSS length as shown in the Canvas section. This fixed example disables series animation; if motion communicates meaningful change, connect it to the product’s reduced-motion handling.",
        },
        {
          type: 'prose',
          text: 'The default Recharts legend mainly mirrors series color. When a pattern, marker shape, or dash style carries series identity, pass a product-owned renderer through `Legend.content` and draw the same cue in each legend key. Keep SVG pattern IDs unique across the whole document, not only between the plot and legend: `url(#id)` resolves document-wide. Derive IDs per chart instance, for example from React’s `useId`.',
        },
        {
          type: 'prose',
          text: '`accessibilityLayer`, `title`, and `desc` improve the chart’s keyboard and descriptive surface, but they do not automatically expose every data value or interaction. If people need exact values, provide a visible table or concise text summary, or another tested equivalent. Avoid repeating the same long description in both the chart and its alternative.',
        },
      ],
    },
    {
      id: 'apply-to-vega',
      title: 'Apply the concrete-value path to Vega-Lite',
      content: [
        {
          type: 'prose',
          text: '`@astryxdesign/vega` is experimental and currently published only through the `@canary` tag. Pin an exact version and read the package README before adopting it. Pass only specs the product authors or reviews: Vega specs can evaluate expressions and load URLs, so user-, document-, or model-generated specs need the interpreter and restricted-loader boundary described in that README.',
        },
        {
          type: 'prose',
          text: 'Configuration-driven renderers need concrete, serializable values rather than retained CSS references. `buildVegaLiteConfig(token)` resolves Astryx colors and font families and supplies the current axis, legend, mark, range, title, padding, and view defaults. It does not create HTML tooltip chrome, apply product-specific mark radii, or manage renderer interaction state. Pass the result through `compileOptions.config`; do not copy the same object into `spec.config`.',
        },
        {
          type: 'prose',
          text: 'Check the text roles your spec enables. In this version, an enabled axis title needs explicit `config.axis.titleColor` and `config.axis.titleFont`; a chart title also needs `config.title.font` when it should use the theme font. Resolve those values with `token()` and verify the rendered chart in light and dark mode.',
        },
        {
          type: 'code',
          lang: 'tsx',
          code: `'use client';

import {useMemo} from 'react';
import {useTheme} from '@astryxdesign/core/theme';
import {
  buildVegaLiteConfig,
  VegaChart,
  type AnySpec,
} from '@astryxdesign/vega';

export function VegaRevenueChart({spec, values}: {
  spec: AnySpec;
  values: readonly unknown[];
}) {
  const {token} = useTheme();
  const config = useMemo(
    () => JSON.parse(JSON.stringify(buildVegaLiteConfig(token))),
    [token],
  );

  return (
    <VegaChart
      aria-label="Quarterly revenue"
      compileOptions={{config}}
      data={{table: [...values]}}
      spec={spec}
      viewOptions={{renderer: 'canvas'}}
    />
  );
}`,
        },
        {
          type: 'prose',
          text: '`token` follows the nearest Astryx `Theme`. To switch modes on the same page, keep `mode` in product state and update `<Theme theme={productTheme} mode={mode}>`. Keep the chart at the same component position instead of keying it by mode.',
        },
        {
          type: 'prose',
          text: 'A Vega-Lite tooltip encoding defines tooltip data, not themed HTML tooltip chrome. If the product supplies an HTML tooltip through `viewOptions.tooltip`, keep that handler stable and style its surface with Astryx background, border, text, radius, typography, spacing, and shadow tokens.',
        },
        {
          type: 'prose',
          text: '`VegaChart.data` initializes named datasets only when a View is created. Changing `values` alone does not update the live View. For live data, capture the View with `onReady`, call `view.data(name, tuples)`, and then call `view.runAsync()`.',
        },
        {
          type: 'prose',
          text: '`VegaChart` rebuilds its View when the value of `spec`, `compileOptions`, `parseConfig`, `parseOptions`, or `viewOptions` changes. `onReady` receives each new View. Keep product-owned zoom, selection, and signal state outside the View and reapply supported state there; otherwise tell people that the mode switch resets it.',
        },
      ],
    },
    {
      id: 'update-existing-renderers',
      title: 'Update existing renderer instances on theme changes',
      content: [
        {
          type: 'prose',
          text: '`useTheme().mode` reports the effective light or dark mode, while the owning `<Theme mode={mode}>` provider controls it. Keep one source of truth; do not add a second chart-only mode prop that can drift from the provider.',
        },
        {
          type: 'prose',
          text: 'Keep the chart in the same component position and update its existing props, options, Canvas state, signals, uniforms, or buffers. Do not key the chart by theme or mode only to force a remount.',
        },
        {
          type: 'prose',
          text: 'Some wrappers rebuild when a concrete configuration object changes. Rebuilding can reset focus, selection, zoom, hover, tooltip, animation, and renderer resources. Restore supported state or document that limitation instead of describing the switch as seamless.',
        },
      ],
    },
    {
      id: 'understand-the-boundary',
      title: 'Understand what this guide does not guarantee',
      content: [
        {
          type: 'list',
          style: 'unordered',
          items: [
            'Astryx does not maintain adapters for the chart libraries shown here.',
            'Product-owned saved chart choices have no Astryx compatibility guarantee in this version.',
            'A color value does not certify the final chart as accessible.',
            'The product owns automatic assignment, validation, migrations, and document storage.',
            'The product owns number and date formatting, localization, direction, and loading, empty, error, or unavailable-data states.',
            'The renderer integration owns responsive behavior, interaction state, performance, and third-party version compatibility.',
          ],
        },
        {
          type: 'prose',
          text: 'The examples above demonstrate value transport and theme updates. They are not a complete chart editor and do not demonstrate persistence migrations, invalid-input recovery, localized or right-to-left layouts, every empty or error state, or complete non-color identity. Use the checklist below for those product-owned behaviors.',
        },
        {
          type: 'prose',
          text: 'Consider proposing a shared API only after multiple products repeat the same saved-choice model, picker projection, validation, or renderer conversion. Bring those concrete use cases and migration needs with the proposal.',
        },
      ],
    },
    {
      id: 'verify-integration',
      title: 'Verify your chart integration',
      content: [
        {
          type: 'prose',
          text: 'Forced-colors handling differs by renderer. Browsers may replace DOM and SVG paints, but Canvas and GPU pixels are not reliably remapped. Test each renderer separately. Preserve meaning with labels, patterns, line styles, borders, and text alternatives whether paints are remapped or not. If the product redraws Canvas for forced colors, resolve the chosen system-derived colors to concrete values before drawing or export.',
        },
        {
          type: 'list',
          style: 'unordered',
          items: [
            'Render light mode, dark mode, at least one custom theme, and supported high-contrast or forced-colors modes.',
            'Switch theme and mode without remounting the renderer when it supports live updates.',
            'Verify chart defaults, manual theme colors, custom colors, invalid stored input, and Reset separately when your product exposes those choices.',
            'Make the chart understandable without relying on color alone; check marker shapes, line styles, patterns, labels, and borders in grayscale and exported output.',
            'Check text and marks against the background where they actually appear.',
            'Give every icon-only control an accessible name and keep its pointer and touch target usable at supported densities.',
            'Exercise supported viewport sizes and density settings without clipping labels, legends, tooltips, or controls.',
            'Test left-to-right and right-to-left layouts, long labels, and representative localized number and date formats.',
            'Render loading, empty, error, and unavailable-data states outside the plotted data marks.',
            'Keep hover information available to keyboard and touch users.',
            'Provide a readable table or text summary when the visual chart cannot communicate the data by itself.',
            'Respect reduced-motion preferences and do not use animation as the only explanation of change.',
          ],
        },
      ],
    },
  ],
};
