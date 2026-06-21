// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @type {import('../../core/src/docs-types').ReferenceDoc} */

export const docs = {
  name: 'styling-libraries',
  title: 'Styling Library Interop',
  category: 'guide',
  description:
    'Integrate Tailwind, StyleX, Panda, Chakra, MUI, CSS-in-JS, CSS Modules, and non-CSS renderers with system tokens.',

  sections: [
    {
      title: 'Core Principle',
      category: 'guide',
      content: [
        {
          type: 'prose',
          text: 'Keep the system as the source of truth for theme values. Components read design tokens from CSS custom properties such as `--color-text-primary`, `--color-background-surface`, `--spacing-4`, and `--radius-container`. Other styling libraries should map their own semantic tokens, utility names, or theme objects to those system CSS variables whenever possible.',
        },
        {
          type: 'prose',
          text: 'Use CSS variables for ordinary DOM styling because they inherit through the tree, follow `data-theme` color mode, respect nested `data-xds-theme` scopes, and update when themes switch. Use token resolver APIs only for non-CSS consumers such as SVG attribute values, canvas, chart configuration, color calculations, or static config generation.',
        },
        {
          type: 'prose',
          text: 'For available token names and values, run `npx astryx docs tokens`. Focused references are also available with `npx astryx docs color`, `npx astryx docs spacing`, `npx astryx docs shape`, `npx astryx docs typography`, `npx astryx docs elevation`, and `npx astryx docs motion`.',
        },
      ],
    },
    {
      title: 'Choose an Integration Path',
      category: 'guide',
      content: [
        {
          type: 'prose',
          text: 'Choose the narrowest integration path that fits the styling library. Most DOM styling should stay on the CSS-variable path; JavaScript token resolution is for APIs that cannot consume CSS custom properties.',
        },
        {
          type: 'table',
          headers: ['Path', 'Use when', 'Value shape'],
          rows: [
            [
              'CSS variable aliases',
              'The library ultimately writes CSS and accepts string values',
              '`var(--color-text-primary)`',
            ],
            [
              'StyleX token imports',
              'You are writing StyleX styles in application code',
              "`colorVars['--color-text-primary']`",
            ],
            [
              'Tailwind bridge',
              'You want utility classes backed by active system tokens',
              '`@xds/core/tailwind-theme.css`',
            ],
            [
              'Token resolver APIs',
              'JavaScript needs token values for charts, canvas, SVG, or config objects',
              "`resolveXDSThemeToken(theme, '--color-data-categorical-blue', {mode})`",
            ],
          ],
        },
      ],
    },
    {
      title: 'Best Practices',
      category: 'guide',
      content: [
        {
          type: 'list',
          style: 'do',
          items: [
            'Map by semantic intent: text, surface, border, accent, status, radius, spacing, typography.',
            'Let the system own color mode. The root Theme syncs `data-theme="light|dark"` and `data-xds-theme` to `<html>` for portals and first-level theme scope.',
            'Prefer CSS variables for runtime theme switching and nested themes.',
          ],
        },
        {
          type: 'list',
          style: 'dont',
          items: [
            'Copy raw hex/px values into a second theme object when a `var(...)` reference would work.',
            'Run a second unsynchronized dark-mode provider that disagrees with Theme.',
            'Make another library\'s CSS variables the source of truth for the system. Some consumers need token values outside the DOM.',
          ],
        },
      ],
    },
    {
      title: 'Plain CSS and CSS Modules',
      category: 'guide',
      content: [
        {
          type: 'prose',
          text: 'The simplest integration is direct CSS variable usage. CSS Modules scope class names, but system token variables are global/inherited values supplied by package CSS and the active theme.',
        },
        {
          type: 'code',
          lang: 'css',
          label: 'Card.module.css',
          code: `.card {
  background: var(--color-background-surface);
  color: var(--color-text-primary);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-container);
  padding: var(--spacing-4);
}`,
        },
        {
          type: 'prose',
          text: 'Sass variables are compile-time only. They are useful for generating static CSS, but they do not update when the system switches theme or color mode. Use native CSS custom properties for themeable values.',
        },
      ],
    },
    {
      title: 'StyleX',
      category: 'guide',
      content: [
        {
          type: 'prose',
          text: 'For StyleX styles, prefer the typed token exports from `@xds/core/theme/tokens.stylex`. They provide autocomplete and catch token-name typos while still resolving through the same system CSS variables at runtime.',
        },
        {
          type: 'code',
          lang: 'tsx',
          label: 'Typed token imports',
          code: `import * as stylex from '@stylexjs/stylex';
import {colorVars, spacingVars, radiusVars} from '@xds/core/theme/tokens.stylex';

const styles = stylex.create({
  panel: {
    backgroundColor: colorVars['--color-background-surface'],
    color: colorVars['--color-text-primary'],
    padding: spacingVars['--spacing-4'],
    borderRadius: radiusVars['--radius-container'],
  },
});`,
        },
        {
          type: 'prose',
          text: 'Use `xstyle` for component overrides and `stylex.props()` for your own DOM nodes. Use `className` when integrating a non-StyleX styling library.',
        },
      ],
    },
    {
      title: 'Tailwind',
      category: 'guide',
      content: [
        {
          type: 'prose',
          text: 'The Tailwind v4 bridge at `@xds/core/tailwind-theme.css` maps Tailwind theme variables to system CSS variables with `@theme inline`, so utility classes like `text-primary`, `bg-surface`, `border-border`, `rounded-lg`, and `shadow-md` stay in sync with the active theme.',
        },
        {
          type: 'code',
          lang: 'css',
          label: 'globals.css',
          code: `@layer reset, theme, base, xds-base, xds-theme, components, utilities;

@import "tailwindcss/theme.css" layer(theme);
@import "tailwindcss/preflight.css" layer(base);
@import "@xds/core/reset.css";
@import "@xds/core/xds.css";
@import "@xds/theme-default/theme.css";
@import "@xds/core/tailwind-theme.css";
@import "tailwindcss/utilities.css" layer(utilities);`,
        },
        {
          type: 'prose',
          text: 'Pre-declare every layer before any imports. This keeps reset lowest, Tailwind preflight above reset, component/theme styles in the middle, and Tailwind utilities last so utility classes on `className` can intentionally override component defaults.',
        },
        {
          type: 'code',
          lang: 'tsx',
          label: 'Tailwind classes backed by system tokens',
          code: `<section className="rounded-lg border border-border bg-surface p-4 text-primary shadow-md">
  <Button label="Save" variant="primary" />
</section>`,
        },
        {
          type: 'prose',
          text: 'The Tailwind bridge is the concrete example of the general interop pattern: expose another library\'s semantic API, but point the values at system token variables.',
        },
      ],
    },
    {
      title: 'Panda, Chakra, and Other Semantic Token Systems',
      category: 'guide',
      content: [
        {
          type: 'prose',
          text: 'Libraries like Panda CSS and Chakra UI have first-class semantic token objects. Put system CSS variables at the leaves of those objects so product code can use the library\'s semantic names while the system still owns the values.',
        },
        {
          type: 'code',
          lang: 'ts',
          label: 'Semantic token aliases',
          code: `semanticTokens: {
  colors: {
    text: {
      primary: {value: 'var(--color-text-primary)'},
      secondary: {value: 'var(--color-text-secondary)'},
    },
    background: {
      surface: {value: 'var(--color-background-surface)'},
      body: {value: 'var(--color-background-body)'},
    },
    border: {
      default: {value: 'var(--color-border)'},
    },
  },
},
tokens: {
  spacing: {
    4: {value: 'var(--spacing-4)'},
  },
  radii: {
    container: {value: 'var(--radius-container)'},
  },
}`,
        },
        {
          type: 'code',
          lang: 'tsx',
          label: 'Panda-style usage',
          code: `<section
  className={css({
    bg: 'background.surface',
    color: 'text.primary',
    borderColor: 'border.default',
    p: '4',
    rounded: 'container',
  })}
/>`,
        },
        {
          type: 'prose',
          text: 'If a semantic-token library needs to generate its own light/dark CSS from raw values, align its mode selector with Theme (`data-theme="light|dark"`) and generate that adapter from system theme data. Otherwise it can drift from nested or runtime themes.',
        },
      ],
    },
    {
      title: 'MUI and Palette-Based Themes',
      category: 'guide',
      content: [
        {
          type: 'prose',
          text: 'MUI expects palette slots such as primary, background, text, and divider. Map those slots to system variables for ordinary component styling. Use raw values only when MUI or your code needs to parse colors for contrast, alpha, lighten, or darken calculations.',
        },
        {
          type: 'code',
          lang: 'ts',
          label: 'MUI palette mapped to system vars',
          code: `const theme = createTheme({
  cssVariables: true,
  colorSchemes: {
    light: {
      palette: {
        primary: {main: 'var(--color-accent)'},
        background: {
          default: 'var(--color-background-body)',
          paper: 'var(--color-background-surface)',
        },
        text: {
          primary: 'var(--color-text-primary)',
          secondary: 'var(--color-text-secondary)',
        },
        divider: 'var(--color-border)',
      },
    },
    dark: {
      palette: {
        primary: {main: 'var(--color-accent)'},
        background: {
          default: 'var(--color-background-body)',
          paper: 'var(--color-background-surface)',
        },
        text: {
          primary: 'var(--color-text-primary)',
          secondary: 'var(--color-text-secondary)',
        },
        divider: 'var(--color-border)',
      },
    },
  },
});`,
        },
        {
          type: 'prose',
          text: 'If MUI owns color mode in an app, generate the light and dark palette values from system theme data and keep Theme mode synchronized. If Theme owns color mode, keep both MUI schemes pointing at the same system CSS variables.',
        },
      ],
    },
    {
      title: 'Emotion, styled-components, Theme UI, and Styled System',
      category: 'guide',
      content: [
        {
          type: 'prose',
          text: 'Runtime CSS-in-JS libraries usually accept arbitrary theme objects. Keep those objects semantic, but store system CSS variable references as the values. This keeps generated classes stable while the system updates values through the CSS cascade.',
        },
        {
          type: 'code',
          lang: 'ts',
          label: 'Generic CSS-in-JS theme object',
          code: `const appTheme = {
  colors: {
    textPrimary: 'var(--color-text-primary)',
    textSecondary: 'var(--color-text-secondary)',
    surface: 'var(--color-background-surface)',
    border: 'var(--color-border)',
    accent: 'var(--color-accent)',
  },
  spacing: {
    4: 'var(--spacing-4)',
  },
  radius: {
    container: 'var(--radius-container)',
  },
};`,
        },
        {
          type: 'prose',
          text: 'Avoid rebuilding CSS-in-JS theme objects with raw color values on every mode switch. CSS variables let the class names stay the same while the browser resolves the active values.',
        },
      ],
    },
    {
      title: 'UnoCSS and Custom Utility Systems',
      category: 'guide',
      content: [
        {
          type: 'prose',
          text: 'Utility generators such as UnoCSS can put system variables in their theme config or shortcuts. Keep classes semantic (`bg-surface`, `text-primary`) and let the values point at system tokens.',
        },
        {
          type: 'code',
          lang: 'ts',
          label: 'UnoCSS-style config',
          code: `export default defineConfig({
  theme: {
    colors: {
      surface: 'var(--color-background-surface)',
      primary: 'var(--color-text-primary)',
      border: 'var(--color-border)',
      accent: 'var(--color-accent)',
    },
    spacing: {
      4: 'var(--spacing-4)',
    },
  },
  shortcuts: {
    'xds-card': 'bg-surface text-primary border border-border rounded-lg p-4',
  },
});`,
        },
        {
          type: 'prose',
          text: 'Static utility extractors cannot see dynamically constructed class names. Prefer explicit class strings or the library\'s safelist/source-registration mechanism.',
        },
      ],
    },
    {
      title: 'Non-CSS Processing',
      category: 'guide',
      content: [
        {
          type: 'prose',
          text: 'Use `resolveXDSThemeTokens()` or `resolveXDSThemeToken()` when code outside React needs token values for a known theme and mode. Use `useTheme()` inside client components when the values should come from the nearest Theme and active mode.',
        },
        {
          type: 'code',
          lang: 'ts',
          label: 'Resolve tokens without React context',
          code: `import {resolveXDSThemeTokens} from '@xds/core/theme/tokens';
import {defaultTheme} from '@xds/theme-default';

const tokens = resolveXDSThemeTokens(defaultTheme, {mode: 'light'});

const chartOptions = {
  textColor: tokens['--color-text-primary'],
  mutedTextColor: tokens['--color-text-secondary'],
  gridColor: tokens['--color-border'],
  seriesColors: [
    tokens['--color-data-categorical-blue'],
    tokens['--color-data-categorical-orange'],
    tokens['--color-data-categorical-purple'],
  ],
};`,
        },
        {
          type: 'code',
          lang: 'tsx',
          label: 'Resolve tokens from the nearest Theme',
          code: `'use client';

import {useMemo} from 'react';
import {useTheme} from '@xds/core/theme';

function RevenueChart({data}: {data: Array<{x: string; y: number}>}) {
  const {mode, tokens} = useTheme();

  const chartOptions = useMemo(
    () => ({
      mode,
      textColor: tokens['--color-text-primary'],
      mutedTextColor: tokens['--color-text-secondary'],
      gridColor: tokens['--color-border'],
      seriesColors: [
        tokens['--color-data-categorical-blue'],
        tokens['--color-data-categorical-orange'],
        tokens['--color-data-categorical-purple'],
      ],
    }),
    [mode, tokens],
  );

  return <ThirdPartyChart data={data} options={chartOptions} />;
}`,
        },
      ],
    },
    {
      title: 'Non-CSS Processing Best Practices',
      category: 'guide',
      content: [
        {
          type: 'list',
          style: 'do',
          items: [
            'Use the returned `tokens` object as a memo dependency; it is stable until the active theme or mode changes.',
            'Use data visualization tokens such as `--color-data-categorical-blue` for chart series instead of reusing arbitrary UI colors.',
            'Prefer CSS variables for SVG elements when possible (`fill="var(--color-accent)"`); use token resolver APIs when an API requires a string value in JavaScript.',
          ],
        },
        {
          type: 'list',
          style: 'dont',
          items: [
            'Use token resolver APIs for ordinary DOM styling. Use CSS variables, StyleX tokens, xstyle, or library aliases instead.',
            'Assume the returned values reflect every CSS cascade override. They resolve tokens for the current theme and mode; local media-surface overrides and arbitrary CSS overrides may not be represented in the returned map.',
          ],
        },
      ],
    },
    {
      title: 'Interop Checklist',
      category: 'guide',
      content: [
        {
          type: 'list',
          style: 'ordered',
          items: [
            'Import the reset/base CSS and a theme CSS file early enough for first paint. For production SSR, prefer built themes from `npx astryx theme build` or published `/built` theme imports plus `theme.css`.',
            'Choose one owner for color mode. Theme uses `data-theme="light|dark"` and `color-scheme` to resolve `light-dark()` tokens.',
            'Map the external library\'s semantic layer to system variables by intent, not by exact naming. For example, MUI `background.paper` maps to `--color-background-surface`.',
            'Use `npx astryx docs tokens` and focused token docs when building mappings. Keep mappings small at first: text, surface/body/card/popover, border, accent, status, spacing, radius, typography, shadow.',
            'Use token resolver APIs only for non-CSS APIs that need resolved values.',
          ],
        },
      ],
    },
  ],
};
