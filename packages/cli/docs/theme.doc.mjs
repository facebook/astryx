// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @type {import('../../core/src/docs-types').ReferenceDoc} */

export const docs = {
  name: 'theme',
  title: 'Theme System',
  category: 'guide',
  description:
    'Theme provider, custom themes, theme build for production/SSR, light/dark mode, and component style overrides.',

  sections: [
    {
      title: 'Quick Start',
  category: 'guide',
      content: [
        {
          type: 'code',
          lang: 'tsx',
          label: 'Basic theme setup (runtime injection)',
          code: `import {Theme} from '@astryxdesign/core';
import {defaultTheme} from '@astryxdesign/theme-default';

function App() {
  return (
    <Theme theme={defaultTheme}>
      <YourApp />
    </Theme>
  );
}`,
        },
        {
          type: 'code',
          lang: 'tsx',
          label: 'Optimized setup (pre-built CSS)',
          code: `import {Theme} from '@astryxdesign/core';
import {defaultTheme} from '@astryxdesign/theme-default/built';
import '@astryxdesign/theme-default/theme.css';

function App() {
  return (
    <Theme theme={defaultTheme}>
      <YourApp />
    </Theme>
  );
}`,
        },
        {
          type: 'prose',
          text: 'The default import uses runtime style injection, which works everywhere with no build step. The `/built` import skips injection and relies on the pre-compiled CSS file for better performance and SSR support.',
        },
      ],
    },
    {
      title: 'Available Themes',
  category: 'guide',
      content: [
        {
          type: 'table',
          headers: ['Theme', 'Import', 'Description'],
          rows: [
            [
              'Default',
              "import {defaultTheme} from '@astryxdesign/theme-default'",
              'Blue accent, system fonts, light/dark',
            ],
            [
              'Neutral',
              "import {neutralTheme} from '@astryxdesign/theme-neutral'",
              'Grayscale, shadcn-inspired',
            ],
            [
              'Brutalist',
              "import {brutalistTheme} from '@astryxdesign/theme-brutalist'",
              'Zero radius, monospace, heavy borders',
            ],
          ],
        },
        {
          type: 'prose',
          text: 'All theme packages export from two subpaths:\n- `@astryxdesign/theme-{name}`: source theme (runtime injection)\n- `@astryxdesign/theme-{name}/built`: pre-built theme (pair with `theme.css`)',
        },
      ],
    },
    {
      title: 'Theme Props',
  category: 'guide',
      content: [
        {
          type: 'table',
          headers: ['Prop', 'Type', 'Default', 'Description'],
          rows: [
            ['theme', 'DefinedTheme', '—', 'Theme object (required)'],
            [
              'mode',
              "'system' | 'light' | 'dark'",
              "'system'",
              'Color mode. system follows OS preference.',
            ],
            ['children', 'ReactNode', '—', 'App content'],
          ],
        },
      ],
    },
    {
      title: 'Creating a Custom Theme',
  category: 'guide',
      content: [
        {
          type: 'prose',
          text: 'Use the CLI wizard (recommended) or create manually with defineTheme. Only override tokens that differ from defaults; omitted tokens use the design system defaults.',
        },
        {
          type: 'code',
          lang: 'bash',
          label: 'Scaffold with CLI',
          code: 'npx astryx theme',
        },
      ],
    },
    {
      title: 'defineTheme',
  category: 'guide',
      content: [
        {
          type: 'prose',
          text: 'defineTheme creates a theme from token overrides and optional scale configs. Scale configs generate tokens from parameters. Explicit token overrides always take precedence over scale-generated values.',
        },
        {
          type: 'code',
          lang: 'tsx',
          label: 'defineTheme with scale configs',
          code: `import {defineTheme} from '@astryxdesign/core/theme';

const myTheme = defineTheme({
  name: 'my-theme',
  color: { accent: '#7B61FF', neutralStyle: 'cool' },
  typography: {
    scale: { base: 14, ratio: 1.2 },
    body: { family: 'Inter', fallbacks: '-apple-system, sans-serif' },
  },
  radius: { base: 4, multiplier: 1 },
  motion: { fast: 175, medium: 410, ratio: 0.75 },
  tokens: {
    // Explicit overrides take precedence over scale-generated values
    '--color-accent': ['#7B61FF', '#9B85FF'],
  },
  components: {
    button: { 'variant:primary': { color: 'white' } },
  },
});`,
        },
        {
          type: 'table',
          headers: ['Config', 'Generates', 'Parameters'],
          rows: [
            [
              'color',
              '--color-accent, --color-background-*, --color-text-*, --color-border, etc.',
              'accent (hex), neutralStyle? (warm|cool|neutral), contrast? (standard|high)',
            ],
            [
              'typography.scale',
              '--text-heading-*-size/weight/leading, --text-body-size/weight/leading',
              'base (px), ratio',
            ],
            [
              'typography.body/heading/code',
              '--font-family-body, --font-family-heading, --font-family-code',
              'family, fallbacks?, url?, weight?',
            ],
            [
              'radius',
              '--radius-inner, --radius-element, --radius-container, --radius-page, --radius-chat',
              'base (px), multiplier (0–2)',
            ],
            [
              'motion',
              '--duration-fast-min/fast/fast-max, --duration-medium-min/medium/medium-max',
              'fast (ms), medium (ms), ratio, easing?',
            ],
          ],
        },
      ],
    },
    {
      title: 'Extending a Theme',
  category: 'guide',
      content: [
        {
          type: 'prose',
          text: '`extends` lets you derive a new theme from an existing one, inheriting its tokens, component overrides, icons, and fonts. Only specify what you want to change; everything else carries over from the base theme.',
        },
        {
          type: 'code',
          lang: 'tsx',
          label: 'Extending the default theme',
          code: `import {defineTheme} from '@astryxdesign/core/theme';
import {defaultTheme} from '@astryxdesign/theme-default';
import {myIcons} from './icons';

const brandTheme = defineTheme({
  name: 'brand',
  extends: defaultTheme,
  icons: myIcons,
  tokens: {
    '--color-accent': ['#7B61FF', '#9B85FF'],
  },
});`,
        },
        {
          type: 'table',
          headers: ['Field', 'Merge behavior'],
          rows: [
            ['tokens', 'Base tokens are copied first, then child tokens override on top.'],
            ['components', 'Deep-merged: child component rules override matching keys from the base.'],
            ['icons', 'Shallow-merged: child icons override matching names from the base.'],
            ['fonts', 'Base fonts included first, then child fonts appended.'],
            ['typography, motion, radius, color', 'Child config replaces base entirely (these are scale inputs, not additive).'],
          ],
        },
      ],
    },
    {
      title: 'Component Style Overrides',
  category: 'guide',
      content: [
        {
          type: 'prose',
          text: 'The `components` field in defineTheme uses semantic component keys and style keys — not raw CSS selectors. Use `base` for all instances, `variant:value` or `stateName` for specific props/states, and let the theme pipeline choose the underlying selector. For raw external CSS escape hatches, prefer the data-attribute selector surface documented in `astryx docs styling`.',
        },
        {
          type: 'code',
          lang: 'tsx',
          label: 'Component overrides with standard CSS',
          code: `components: {
  // Standard CSS properties are expanded automatically.
  // borderRadius also sets the internal radius var for concentric math.
  // padding on container components (card, section, dialog) expands to layout tokens.
  card: {
    base: { borderRadius: '20px', padding: '24px' },
  },
  button: {
    base: { borderRadius: '9999px', textTransform: 'uppercase' },
    'variant:ghost': { borderWidth: '2px', borderStyle: 'solid' },
  },
  // Some components have public CSS vars for properties that don't map
  // to standard CSS. Set these directly.
  button: {
    base: { '--button-press-scale': 'scale(0.95)' },
  },
}`,
        },
        {
          type: 'prose',
          text: 'Run `npx astryx component <Name>` to see a component\'s theming targets, public CSS variables, and which standard CSS properties are supported.',
        },
        {
          type: 'list',
          style: 'do',
          items: [
            'Write standard CSS properties (borderRadius, padding); the pipeline expands them into internal vars.',
            'Set public CSS vars directly when no standard property equivalent exists.',
          ],
        },
        {
          type: 'list',
          style: 'dont',
          items: [
            'Set private CSS vars (prefixed --_) directly. Use standard CSS properties instead. `astryx theme build` will error.',
          ],
        },
      ],
    },
    {
      title: 'Custom Variants',
  category: 'guide',
      content: [
        {
          type: 'prose',
          text: 'Themes can add new prop values to any component. Any `prop:value` key where the value isn\'t a built-in gets treated as a new variant. Use `astryx theme build` to generate TypeScript augmentations for type safety.',
        },
        {
          type: 'code',
          lang: 'tsx',
          label: 'Adding custom variants',
          code: `components: {
  button: {
    // Override an existing variant
    'variant:secondary': { backgroundColor: 'rgba(0,0,0,0.06)' },
    // Add a new variant — generates type augmentation on build
    'variant:primary-muted': {
      backgroundColor: 'light-dark(#F2F4F6, #28292C)',
      color: 'var(--color-text-primary)',
    },
  },
  banner: {
    // Any extensible prop axis works — not just variant
    'status:neutral': {
      backgroundColor: 'var(--color-muted)',
      color: 'var(--color-text-secondary)',
    },
  },
}`,
        },
        {
          type: 'prose',
          text: 'After building, the new values are type-safe in JSX:',
        },
        {
          type: 'code',
          lang: 'tsx',
          label: 'Using custom variants',
          code: `// TypeScript knows about 'primary-muted' after astryx theme build
<Button variant="primary-muted" label="Save draft" />
<Banner status="neutral" title="Note" />`,
        },
        {
          type: 'prose',
          text: 'Custom variants only work when the theme that defines them is active. The component\'s variant map is extended via module augmentation, with no changes to the component source needed.',
        },
      ],
    },
    {
      title: 'Building Themes for Production',
  category: 'guide',
      content: [
        {
          type: 'prose',
          text: '`npx astryx theme build` compiles a defineTheme file into production-ready artifacts. Recommended for SSR apps (Next.js, Remix) where styles must be present on first paint.',
        },
        {
          type: 'code',
          lang: 'bash',
          label: 'Build a theme',
          code: 'npx astryx theme build ./src/themes/ocean.ts',
        },
        {
          type: 'prose',
          text: 'This generates the following files alongside the source:',
        },
        {
          type: 'table',
          headers: ['File', 'Description'],
          rows: [
            [
              'ocean.css',
              'Pre-compiled CSS with token overrides, component overrides, and prose element styles in @scope rules',
            ],
            [
              'ocean.js',
              'ES module exporting the theme object with `__built: true` and pre-resolved token values. Also re-exports the icon registry if the source theme declares one.',
            ],
            [
              'ocean.d.ts',
              'TypeScript declarations for the theme and icon registry exports',
            ],
            [
              'ocean.variants.d.ts',
              '(Optional) Module augmentations for custom component prop values found in the theme\'s component overrides',
            ],
          ],
        },
        {
          type: 'prose',
          text: 'The `__built: true` flag tells Theme to skip runtime `<style>` injection; the CSS file handles it.',
        },
        {
          type: 'code',
          lang: 'tsx',
          label: 'Using a custom built theme',
          code: `import {oceanTheme} from './themes/ocean';
import './themes/ocean.css';

<Theme theme={oceanTheme}>
  <App />
</Theme>`,
        },
      ],
    },
    {
      title: 'Runtime vs Built Themes',
  category: 'guide',
      content: [
        {
          type: 'prose',
          text: 'Themes work in two modes:',
        },
        {
          type: 'table',
          headers: ['', 'Runtime (source)', 'Built'],
          rows: [
            [
              'Import (published theme)',
              "@astryxdesign/theme-{name}",
              "@astryxdesign/theme-{name}/built + theme.css",
            ],
            [
              'Import (custom theme)',
              'defineTheme() directly',
              "Built .js + .css from `npx astryx theme build`",
            ],
            [
              'How it works',
              'useInsertionEffect injects <style> at hydration',
              'Pre-compiled .css file loaded with the page',
            ],
            [
              'Component overrides',
              'Injected client-only',
              'In static CSS: present during SSR',
            ],
            [
              'SSR safe',
              'Tokens yes, component overrides flash on hydration',
              'Fully SSR safe: no flash',
            ],
            [
              'Best for',
              'Dev, prototyping, client-only SPAs',
              'Production, SSR apps (Next.js, Remix)',
            ],
          ],
        },
        {
          type: 'list',
          style: 'do',
          items: [
            'Use the /built subpath + theme.css for production SSR apps.',
            'Use runtime themes during development for fast iteration.',
            'Run `npx astryx theme build` for custom themes to get the built artifacts.',
          ],
        },
        {
          type: 'list',
          style: 'dont',
          items: [
            'Use runtime themes in production SSR apps; component overrides will flash on hydration.',
            'Import /built without the CSS file; component overrides won\'t apply.',
          ],
        },
      ],
    },
    {
      title: 'Light/Dark Mode',
  category: 'guide',
      content: [
        {
          type: 'prose',
          text: "Use [light, dark] tuples in token values for automatic mode switching. Use mode='system' (default) on Theme to follow OS preference.",
        },
        {
          type: 'code',
          lang: 'tsx',
          label: 'Light/dark tuple',
          code: "'--color-accent': ['#0064E0', '#2694FE'],\n//                   ^light     ^dark",
        },
        {
          type: 'code',
          lang: 'tsx',
          label: 'Toggle with a button',
          code: `const [mode, setMode] = useState<'light' | 'dark'>('light');

<Theme theme={myTheme} mode={mode}>
  <Button
    label={mode === 'light' ? 'Switch to Dark' : 'Switch to Light'}
    onClick={() => setMode(m => (m === 'light' ? 'dark' : 'light'))}
  />
</Theme>;`,
        },
      ],
    },
    {
      title: 'Nesting Themes',
  category: 'guide',
      content: [
        {
          type: 'prose',
          text: 'Wrap different sections in separate <Theme> providers.',
        },
        {
          type: 'code',
          lang: 'tsx',
          label: 'Dark sidebar with light content',
          code: `<Theme theme={lightTheme} mode="light">
  <Layout
    header={<LayoutHeader>...</LayoutHeader>}
    start={
      <Theme theme={darkTheme} mode="dark">
        <LayoutPanel>{/* Dark sidebar */}</LayoutPanel>
      </Theme>
    }
    content={<LayoutContent>{/* Light content */}</LayoutContent>}
  />
</Theme>`,
        },
      ],
    },
    {
      title: 'Token Utilities',
  category: 'guide',
      content: [
        {
          type: 'prose',
          text: 'Use `tokenVar()` when a non-StyleX styling library wants a CSS variable reference, and `resolveThemeTokens()` when JavaScript needs token values for a specific theme and mode without React context.',
        },
        {
          type: 'code',
          lang: 'ts',
          label: 'CSS var references for styling-library configs',
          code: `import {tokenVar, tokenVars} from '@astryxdesign/core/theme/tokens';

const pandaOrEmotionTheme = {
  colors: {
    text: tokenVar('--color-text-primary'),
    surface: tokenVars['--color-background-surface'],
  },
  spacing: {
    4: tokenVars['--spacing-4'],
  },
};`,
        },
        {
          type: 'code',
          lang: 'ts',
          label: 'Resolve token values without a hook',
          code: `import {resolveThemeTokens} from '@astryxdesign/core/theme/tokens';
import {defaultTheme} from '@astryxdesign/theme-default';

const lightTokens = resolveThemeTokens(defaultTheme, {mode: 'light'});
const chartTheme = {
  textColor: lightTokens['--color-text-primary'],
  seriesColor: lightTokens['--color-data-categorical-blue'],
};`,
        },
        {
          type: 'prose',
          text: 'The `@astryxdesign/core/theme/tokens` subpath is server-safe and does not require React. The main `@astryxdesign/core/theme` barrel also re-exports these helpers for client code that already imports theme APIs.',
        },
      ],
    },
    {
      title: 'useTheme Hook',
  category: 'guide',
      content: [
        {
          type: 'prose',
          text: '`useTheme()` uses the same token resolution as `resolveThemeTokens()`, but reads the nearest Theme and effective color mode from React context and media query state. Use it inside client components for SVG, canvas, charts, maps, and third-party configuration objects that need token values in JavaScript instead of `var(...)` references.',
        },
        {
          type: 'code',
          lang: 'tsx',
          label: 'Access resolved token values in React',
          code: `import {useMemo} from 'react';
import {useTheme} from '@astryxdesign/core/theme';

function ChartConfig() {
  const {mode, tokens} = useTheme();

  const options = useMemo(
    () => ({
      mode,
      textColor: tokens['--color-text-primary'],
      gridColor: tokens['--color-border'],
      seriesColor: tokens['--color-data-categorical-blue'],
    }),
    [mode, tokens],
  );

  return <Chart options={options} />;
}`,
        },
        {
          type: 'prose',
          text: 'Prefer CSS variables, StyleX token imports, xstyle, or className for ordinary styling. To change the theme or mode, manage state at the app level and pass it to <Theme>.',
        },
        {
          type: 'prose',
          text: 'See `npx astryx docs styling-libraries` for styling-library interop and `npx astryx docs tokens` for the full token reference.',
        },
      ],
    },
  ],
};
