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
          text: 'Astryx does not provide a shared chart-editor or saved chart-color API in this version. Use the existing token APIs, and keep renderer configuration, end-user choices, validation, and document storage inside the product that owns the chart.',
        },
        {
          type: 'prose',
          text: 'Use the whole guide when people can customize a chart, save their choices, or render the same chart through multiple technologies.',
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
          headers: ['Chart role', 'Astryx source'],
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
            ['Chart container', '`--radius-container` when it owns a surface'],
            [
              'Chart controls and toolbar icons',
              'Astryx `Icon` or `IconButton`, semantic foreground tokens, and established icon sizes',
            ],
            [
              'Chart chrome spacing',
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
          text: 'Use Astryx icons for chart controls such as filtering, downloading, zooming, or changing display options. An icon-only control needs an accessible name, and unfamiliar actions need visible supporting text or a tooltip. Legend symbols remain renderer-owned chart marks so they can match the series shape, line, pattern, and color.',
        },
        {
          type: 'prose',
          text: 'Use spacing tokens for application chrome around the plot. Plot margins, tick gaps, hit geometry, and data-density decisions stay local to the renderer. A compact treatment still needs readable labels and usable pointer and touch targets.',
        },
        {
          type: 'prose',
          text: 'Color cannot be the only way to distinguish a series or state. Combine it with a direct label, marker shape, line style, pattern, border, or another cue that survives the renderer and export path.',
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
          text: 'Do not construct `var(--color-data-*)` strings by hand. The theme-override guarantee also requires Astryx’s supported layered StyleX build boundary; a bare unlayered transform can outrank layered theme overrides.',
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

export function CanvasSeries() {
  const ref = useRef<HTMLCanvasElement>(null);
  const {token} = useTheme();
  const color = token('--color-data-categorical-blue');
  const fontFamily = token('--font-family-body');
  const fontSize = token('--text-supporting-size');
  const radius = Number.parseFloat(token('--radius-element')) || 0;

  useEffect(() => {
    const context = ref.current?.getContext('2d');
    if (!context) return;
    context.clearRect(0, 0, 320, 160);
    context.fillStyle = color;
    context.beginPath();
    context.roundRect(32, 32, 64, 112, [radius, radius, 0, 0]);
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
          text: 'Use concrete values for Canvas, library option objects, serialized configuration, workers, SSR, and export. Resolve typography and radius tokens the same way. The product owns any further parsing or conversion required by its renderer.',
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
      ],
    },
    {
      id: 'apply-to-recharts',
      title: 'Apply the direct-paint path to Recharts',
      content: [
        {
          type: 'prose',
          text: 'Recharts passes the demonstrated bar, grid, axis, tooltip, and legend paint values to live SVG or HTML properties. Use Astryx variables for those verified properties. This example does not imply that every Recharts prop or future release accepts CSS references.',
        },
        {
          type: 'code',
          lang: 'tsx',
          code: `import {dataVars} from '@astryxdesign/core/theme/dataTokens.stylex';
import {
  colorVars,
  radiusVars,
  typographyVars,
  typeScaleVars,
} from '@astryxdesign/core/theme/tokens.stylex';
import {
  Bar,
  BarChart,
  CartesianGrid,
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
          color: colorVars['--color-text-primary'],
        }}
      />
      <Bar
        dataKey="revenue"
        fill={dataVars['--color-data-categorical-blue']}
      />
    </BarChart>
  );
}`,
        },
      ],
    },
    {
      id: 'apply-to-vega',
      title: 'Apply the concrete-value path to Vega-Lite',
      content: [
        {
          type: 'prose',
          text: 'Configuration-driven renderers need concrete, serializable values rather than retained CSS references. The existing Astryx Vega package accepts the active theme resolver and produces a Vega-Lite configuration for the current theme. This example demonstrates the current integration; it is not a compatibility guarantee for future Vega releases.',
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
      data={{table: values}}
      spec={spec}
      viewOptions={{renderer: 'canvas'}}
    />
  );
}`,
        },
        {
          type: 'prose',
          text: 'The current `VegaChart` wrapper rebuilds its View when compile configuration changes. A product that owns zoom, selection, hover, or signal state must restore supported state after that rebuild or document the reset. Do not describe this transition as preserving renderer state.',
        },
      ],
    },
    {
      id: 'update-existing-renderers',
      title: 'Update existing renderer instances on theme changes',
      content: [
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
          text: 'High-contrast and forced-colors modes may replace authored chart paints. Preserve meaning through labels, shapes, patterns, line styles, borders, and system-recognizable controls instead of trying to force exact brand colors through the user’s contrast settings.',
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
