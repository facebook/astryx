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
    'Map chart presentation to Astryx tokens, preserve end-user color intent, and send each renderer the color format it actually supports.',
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
      id: 'start-with-capabilities',
      title: 'Choose the transport by renderer capability',
      content: [
        {
          type: 'prose',
          text: 'Share Astryx meaning across charts, not one universal renderer configuration. The correct color transport depends on where the value is consumed.',
        },
        {
          type: 'table',
          headers: ['Consumption boundary', 'Use', 'Theme update'],
          rows: [
            [
              'Live DOM or SVG paint with no library parsing',
              'A retained Astryx CSS token reference',
              'Let the CSS cascade repaint the existing node',
            ],
            [
              'Options, color math, Canvas, serialized config, workers, SSR, or export',
              'Concrete opaque sRGB',
              'Update the existing options or drawing state and redraw',
            ],
            [
              'GPU uniform or buffer',
              'Explicit normalized RGBA channels',
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
          text: 'Do not assume that an SVG renderer accepts CSS variables. Some libraries parse colors in JavaScript before they create SVG. Verify the exact property and renderer path you use.',
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
            ['Focus', 'Focus outline tokens'],
            [
              'Hover or active series',
              'The same series color mixed with `--color-tint-hover`, plus a non-color cue',
            ],
            [
              'Selection or brush',
              'Accent tokens that fit the rendered surface',
            ],
          ],
        },
        {
          type: 'prose',
          text: 'Do not create renderer-named tokens such as `--recharts-grid-color`. Keep data, scales, interactions, events, and renderer compatibility in the chart component that owns them.',
        },
      ],
    },
    {
      id: 'store-user-intent',
      title: 'Store end-user color intent',
      content: [
        {
          type: 'prose',
          text: 'Use these choices when your product lets people override colors in an editable chart. Automatic is the way to remove a manual choice and return that series to the chart default.',
        },
        {
          type: 'list',
          style: 'unordered',
          items: [
            'Dashboard and report builders with editable series colors.',
            'Spreadsheet-style chart editors with a color picker and Reset action.',
            'Reusable chart templates where people can override and restore defaults.',
            'Saved charts that may be rendered through SVG, Canvas, serialized configuration, or GPU paths.',
          ],
        },
        {
          type: 'prose',
          text: 'A static chart with no end-user color control does not need Automatic or the saved-choice API.',
        },
        {
          type: 'table',
          headers: ['Choice', 'Persist', 'Theme behavior'],
          rows: [
            [
              'Automatic (use chart default)',
              'Nothing',
              'The chart picks again from the active theme’s colors',
            ],
            [
              'Theme color',
              'An Astryx theme color',
              'The selected color follows the new theme',
            ],
            [
              'Custom color',
              'The exact custom color',
              'The selected color does not change',
            ],
          ],
        },
        {
          type: 'prose',
          text: 'For example, a chart may give Revenue the first palette color and Costs the second. In Automatic mode, neither choice is saved. When the theme changes, the chart uses the first and second colors from the new theme. If someone manually changes Revenue to purple, purple is saved. Reset deletes purple and returns Revenue to the chart default. The product owns that default rule. If Automatic colors must stay on the same series after reordering or filtering, keep that mapping separately from the person’s color choice.',
        },
        {
          type: 'code',
          lang: 'ts',
          code: `import {
  normalizeChartCustomColor,
  validateChartColorChoice,
  type ChartColorChoice,
} from '@astryxdesign/core/theme/chartColors';

type StoredSeries = {
  id: string;
  color?: ChartColorChoice;
};

function resetSeriesColor(series: StoredSeries): StoredSeries {
  const {color: _removed, ...automatic} = series;
  return automatic;
}

function storeCustomColor(
  series: StoredSeries,
  input: string,
): StoredSeries {
  const normalized = normalizeChartCustomColor(input);
  if (!normalized.ok) {
    return series;
  }
  return {
    ...series,
    color: {kind: 'custom', color: normalized.value},
  };
}

function readStoredColor(input: unknown): ChartColorChoice | undefined {
  const validated = validateChartColorChoice(input);
  return validated.ok ? validated.value : undefined;
}`,
        },
        {
          type: 'prose',
          text: 'Invalid stored input falls back to Automatic in the host product. Report the diagnostic through the product’s existing error path; do not freeze the last resolved hex value.',
        },
      ],
    },
    {
      id: 'project-picker-options',
      title: 'Project theme-aware picker options',
      content: [
        {
          type: 'prose',
          text: 'The default projection is a stable ordered set of chart-safe categorical tokens. The API returns machine IDs and current previews. Your product owns localized labels, grouping, search terms, accessible names, and picker layout.',
        },
        {
          type: 'code',
          lang: 'tsx',
          code: `'use client';

import {useMemo} from 'react';
import {useTheme} from '@astryxdesign/core/theme';
import {
  projectChartColorOptions,
  type ChartColorOption,
} from '@astryxdesign/core/theme/chartColors';

export function useSeriesColorOptions(): readonly ChartColorOption[] {
  const {token} = useTheme();
  return useMemo(() => {
    const projected = projectChartColorOptions(token);
    return projected.ok ? projected.value : [];
  }, [token]);
}`,
        },
        {
          type: 'prose',
          text: 'Removing a token from the picker does not invalidate an already persisted supported identity. Projection and persisted-input validation are separate operations.',
        },
      ],
    },
    {
      id: 'map-generated-palettes',
      title: 'Map generated palettes into stable chart slots',
      content: [
        {
          type: 'prose',
          text: 'A generated palette is authoring material. Select appropriate palette stops when defining the theme and map them into stable chart data tokens. The runtime picker shows those active values; it does not enumerate every raw palette stop or generate a new palette from the theme accent.',
        },
        {
          type: 'code',
          lang: 'ts',
          code: `import {defineTheme} from '@astryxdesign/core/theme';
import {palette} from './palette.generated';

export const productTheme = defineTheme({
  name: 'product',
  tokens: {
    '--color-data-categorical-blue': [
      palette.ocean.light[50],
      palette.ocean.dark[60],
    ],
    '--color-data-categorical-orange': [
      palette.sunset.light[50],
      palette.sunset.dark[60],
    ],
  },
});`,
        },
      ],
    },
    {
      id: 'use-css-for-direct-paint',
      title: 'Use CSS references only for direct paint',
      content: [
        {
          type: 'prose',
          text: 'For a verified live DOM or SVG paint property, import `dataVars` and pass the value directly. Importing `dataVars` retains the complete atomic data-variable group once for the compiled app; it does not create a stylesheet for each chart.',
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
      id: 'resolve-concrete-colors',
      title: 'Resolve concrete colors for Canvas and configuration APIs',
      content: [
        {
          type: 'code',
          lang: 'tsx',
          code: `'use client';

import {useEffect, useRef} from 'react';
import {useTheme} from '@astryxdesign/core/theme';
import {
  resolveChartColorChoice,
  type ChartColorChoice,
} from '@astryxdesign/core/theme/chartColors';

export function CanvasSeries({choice}: {choice: ChartColorChoice}) {
  const ref = useRef<HTMLCanvasElement>(null);
  const {token} = useTheme();
  const resolved = resolveChartColorChoice(choice, token);
  const color = resolved.ok ? resolved.value.srgb : undefined;
  const fontFamily = token('--font-family-body');
  const fontSize = token('--text-supporting-size');
  const radius = Number.parseFloat(token('--radius-element')) || 0;

  useEffect(() => {
    if (!color) {
      return;
    }
    const context = ref.current?.getContext('2d');
    if (!context) {
      return;
    }
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
          text: 'Use `srgb` for Canvas, option objects, serialized configuration, and export. Use `rgba01` for a GPU API that expects normalized channels. Resolve typography and radius tokens the same way when a renderer requires concrete font or geometry values. If resolution fails, let the host report the diagnostic and apply its Automatic assignment; do not substitute an unrelated fallback color inside the renderer.',
        },
        {
          type: 'prose',
          text: '`useTheme().token` follows the nearest supported Theme and effective mode. It does not read arbitrary descendant CSS overrides, `MediaTheme`, or every scoped surface adaptation. A renderer that must match one of those surfaces needs an explicit resolved mapping for that surface.',
        },
      ],
    },
    {
      id: 'resolve-outside-react',
      title: 'Resolve outside React, in workers, and during export',
      content: [
        {
          type: 'code',
          lang: 'ts',
          code: `import {resolveThemeTokens} from '@astryxdesign/core/theme/tokens';
import {resolveChartColorChoice} from '@astryxdesign/core/theme/chartColors';
import {productTheme} from './productTheme';

const tokens = resolveThemeTokens(productTheme, {mode: 'dark'});
const resolved = resolveChartColorChoice(
  {kind: 'theme', token: '--color-data-categorical-blue'},
  token => tokens[token] ?? '',
);

if (resolved.ok) {
  const exportConfig = {fill: resolved.value.srgb};
  JSON.stringify(exportConfig);
}`,
        },
        {
          type: 'prose',
          text: 'Server rendering and export require an explicit theme and light or dark mode. Do not infer a client’s system preference. A worker should receive only the resolved token subset it uses plus a theme revision; do not send React hooks, CSS references that depend on a document, callbacks, or the full theme object.',
        },
      ],
    },
    {
      id: 'apply-to-recharts',
      title: 'Apply the direct-paint path to Recharts',
      content: [
        {
          type: 'prose',
          text: 'Recharts passes the demonstrated bar, grid, axis, tooltip, and legend paint values to live SVG or HTML properties. Use Astryx variables for those verified properties. This example does not imply that every Recharts prop or renderer accepts CSS references.',
        },
        {
          type: 'code',
          lang: 'tsx',
          code: `import * as stylex from '@stylexjs/stylex';
import {useTheme} from '@astryxdesign/core/theme';
import {dataVars} from '@astryxdesign/core/theme/dataTokens.stylex';
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
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

const styles = stylex.create({
  chart: {height: 320, width: '100%'},
});

export function RevenueChart({data}) {
  const {token} = useTheme();
  const barRadius = Number.parseFloat(token('--radius-element')) || 0;
  const hoverFill = \`color-mix(in srgb, \${dataVars['--color-data-categorical-blue']} 88%, \${colorVars['--color-tint-hover']})\`;
  const tick = {
    fill: colorVars['--color-text-secondary'],
    fontFamily: typographyVars['--font-family-body'],
    fontSize: typeScaleVars['--text-supporting-size'],
  };

  return (
    <div {...stylex.props(styles.chart)}>
      <ResponsiveContainer>
        <BarChart
          accessibilityLayer
          data={data}
          desc="Quarterly revenue and costs"
          title="Quarterly performance">
          <CartesianGrid stroke={colorVars['--color-border']} />
          <XAxis
            dataKey="quarter"
            stroke={colorVars['--color-border-emphasized']}
            tick={tick}
          />
          <YAxis
            stroke={colorVars['--color-border-emphasized']}
            tick={tick}
          />
          <Tooltip
            contentStyle={{
              background: colorVars['--color-background-card'],
              borderColor: colorVars['--color-border'],
              borderRadius: radiusVars['--radius-element'],
              color: colorVars['--color-text-primary'],
              fontFamily: typographyVars['--font-family-body'],
            }}
          />
          <Bar
            activeBar={{
              fill: hoverFill,
              stroke: colorVars['--color-border-emphasized'],
              strokeWidth: 2,
            }}
            dataKey="revenue"
            fill={dataVars['--color-data-categorical-blue']}
            isAnimationActive={false}
            name="Revenue"
            radius={[barRadius, barRadius, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}`,
        },
        {
          type: 'prose',
          text: 'Theme radius is the default for chart geometry, not a requirement. A chart that intentionally needs square bars can use `0` locally without changing the theme; if end users control that choice, persist it as a separate chart geometry setting such as `cornerStyle: "theme" | "square"`. Tooltip and chart surfaces continue to use their theme radius unless the product explicitly opts those surfaces out too.',
        },
      ],
    },
    {
      id: 'preserve-renderer-state',
      title: 'Update the existing renderer',
      content: [
        {
          type: 'prose',
          text: 'Do not key a chart by theme or mode. Recreating a renderer can discard focus, selection, zoom, hover, tooltip, animation, streaming buffers, and GPU resources.',
        },
        {
          type: 'table',
          headers: ['Renderer path', 'Theme update'],
          rows: [
            ['React SVG or DOM', 'Update props or let retained CSS repaint'],
            ['Canvas', 'Update concrete drawing state and redraw'],
            [
              'Vega',
              'Prefer live signals; rebuilding a View can reset interaction state',
            ],
            [
              'WebGL',
              'Update uniforms or buffers without replacing the context',
            ],
          ],
        },
        {
          type: 'prose',
          text: 'When live update is impossible, snapshot and restore supported state or document the reset as a product limitation.',
        },
      ],
    },
    {
      id: 'assign-automatic-colors',
      title: 'Keep Automatic assignment stable',
      content: [
        {
          type: 'prose',
          text: 'Assign categorical slots by a stable series identifier, not current sort, filtering, pagination, streaming arrival, or render order. Preserve that identifier-to-slot mapping for the chart document.',
        },
        {
          type: 'prose',
          text: 'The default projection contains ten categorical choices. The canary `@astryxdesign/charts` palette helper currently wraps after ten; treat that as a rendering convenience, not a persisted identity contract. When repeated colors would make visible series indistinguishable, group or reduce categories or add another encoding such as shape, pattern, or line style.',
        },
      ],
    },
    {
      id: 'verify-the-final-chart',
      title: 'Verify the final chart',
      content: [
        {
          type: 'list',
          style: 'unordered',
          items: [
            'Render light mode, dark mode, and at least one custom theme.',
            'Switch theme and mode without remounting the renderer or losing interaction state.',
            'Verify Automatic, theme-token, exact custom, invalid stored input, and Reset separately.',
            'Keep the same final series color in marks, legends, tooltips, annotations, and data alternatives.',
            'Check contrast against the actual surface in every mode; no isolated color is universally accessible.',
            'Keep hover information available to keyboard and touch users and provide non-color distinctions.',
            'Provide a readable table or equivalent when visual marks cannot expose the information meaningfully.',
            'Respect reduced-motion preferences and do not use animation as the only explanation of change.',
          ],
        },
        {
          type: 'prose',
          text: 'Astryx color transport does not certify a chart library, its accessibility, responsive layout, rendering performance, bundle size, or future compatibility. The chart component still owns those outcomes.',
        },
      ],
    },
  ],
};
