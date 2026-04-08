/** @type {import('../../core/src/docs-types').ReferenceDoc} */

export const docs = {
  name: 'theme',
  title: 'XDS Theme System',
  description: 'XDSTheme provider, custom themes, build-theme for production/SSR, light/dark mode, and component style overrides.',

  sections: [
    {
      title: 'Quick Start',
      content: [
        {
          type: 'code',
          lang: 'tsx',
          label: 'Basic theme setup',
          code: `import {XDSTheme} from '@xds/core';
import {defaultTheme} from '@xds/theme/default';

function App() {
  return (
    <XDSTheme theme={defaultTheme}>
      <YourApp />
    </XDSTheme>
  );
}`,
        },
      ],
    },
    {
      title: 'Available Themes',
      content: [
        {
          type: 'table',
          headers: ['Theme', 'Import', 'Description'],
          rows: [
            ['Default', "import {defaultTheme} from '@xds/theme/default'", 'Blue accent, system fonts, light/dark'],
            ['Neutral', "import {neutralTheme} from '@xds/theme/neutral'", 'Grayscale, shadcn-inspired'],
          ],
        },
        {
          type: 'prose',
          text: "Run `npx xds theme --list` to see themes in your project.",
        },
      ],
    },
    {
      title: 'XDSTheme Props',
      content: [
        {
          type: 'table',
          headers: ['Prop', 'Type', 'Default', 'Description'],
          rows: [
            ['theme', 'Theme', '—', 'Theme object (required)'],
            ['mode', "'system' | 'light' | 'dark'", "'system'", 'Color mode. system follows OS preference.'],
            ['children', 'ReactNode', '—', 'App content'],
          ],
        },
      ],
    },
    {
      title: 'Creating a Custom Theme',
      content: [
        {
          type: 'prose',
          text: "Use the CLI wizard (recommended) or create manually. Only override token groups that differ from defaults — omitted groups use defineVars defaults from @xds/core.",
        },
        {
          type: 'code',
          lang: 'bash',
          label: 'Scaffold with CLI',
          code: 'npx xds theme',
        },
        {
          type: 'code',
          lang: 'tsx',
          label: 'Manual creation',
          code: `import * as stylex from '@stylexjs/stylex';
import type {ThemeType as Theme} from '@xds/core/theme';
import {colorVars, colorDefaults} from '@xds/core/theme/tokens.stylex';

const colorOverrides = {
  '--color-accent': 'light-dark(#7B61FF, #9B85FF)',
  '--color-background-surface': 'light-dark(#FFFFFF, #1A1A2E)',
  // ... all ~60 color tokens (see npx xds docs tokens)
} as const;

const colorTheme = stylex.createTheme(
  colorVars,
  colorOverrides as unknown as typeof colorDefaults,
);

export const myTheme: Theme = {
  name: 'my-theme',
  styles: {
    colors: colorTheme,
    // spacing, radius, etc. omitted — uses defaults
  },
  raw: {
    colors: colorOverrides,
  },
};`,
        },
        {
          type: 'prose',
          text: "Token groups (all optional in styles): colors, spacing, size, radius, shadow, transition, typography, textSize, lineHeight, fontWeight. Omitted groups use defineVars defaults.",
        },
        {
          type: 'list',
          style: 'dont',
          items: [
            "Variable references in stylex.createTheme(). StyleX requires inline object literals for static analysis.",
            "Spread expressions in createTheme(). Same static analysis constraint.",
          ],
        },
      ],
    },
    {
      title: 'defineTheme (recommended)',
      content: [
        {
          type: 'prose',
          text: "defineTheme is a higher-level API that wraps the raw stylex.createTheme pattern. It supports scale configs that generate tokens from parameters. Explicit token overrides always take precedence over scale-generated values.",
        },
        {
          type: 'code',
          lang: 'tsx',
          label: 'defineTheme with scale configs',
          code: `import {defineTheme} from '@xds/core/theme';

const myTheme = defineTheme({
  name: 'my-theme',
  typography: {
    scale: { base: 14, ratio: 1.2 },         // generates heading + text tokens
    body: { family: 'Inter', fallbacks: '-apple-system, sans-serif' },
  },
  radius: { base: 4, multiplier: 1 },         // generates radius tokens
  motion: { fast: 175, medium: 410, ratio: 0.75 },
  tokens: {
    '--color-accent': ['#7B61FF', '#9B85FF'], // explicit overrides win
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
            ['typography.scale', '--heading-*-size/weight/leading, --text-*-size/weight/leading', 'base (px), ratio'],
            ['typography.body/heading/code', '--font-family-body, --font-family-heading, --font-family-code', 'family, fallbacks?, url?, weight?'],
            ['radius', '--radius-none through --radius-page, --radius-full', 'base (px), multiplier (0–2)'],
            ['motion', '--duration-fast-*, --duration-medium-*, --ease-*', 'fast (ms), medium (ms), ratio, easing?'],
          ],
        },
      ],
    },
    {
      title: 'Building Themes for Production',
      content: [
        {
          type: 'prose',
          text: "`npx xds build-theme` compiles a defineTheme file into a static CSS file. This is the recommended path for production apps — especially those using server-side rendering (Next.js, Remix, etc.).",
        },
        {
          type: 'code',
          lang: 'bash',
          label: 'Build a theme to CSS',
          code: `npx xds build-theme ./src/themes/ocean.ts -o ./dist/ocean.css`,
        },
        {
          type: 'prose',
          text: "This generates three files:",
        },
        {
          type: 'list',
          style: 'unordered',
          items: [
            "ocean.css — all token overrides + component overrides as static CSS in @layer xds.theme",
            "ocean.js — a JS module with __built: true (tells XDSTheme to skip runtime injection)",
            "ocean.d.ts — TypeScript declarations",
          ],
        },
        {
          type: 'code',
          lang: 'tsx',
          label: 'Using a built theme',
          code: `import { oceanTheme } from './themes/ocean';
import './themes/ocean.css'; // static CSS — present on first paint

<XDSTheme theme={oceanTheme}>
  <App />
</XDSTheme>`,
        },
        {
          type: 'prose',
          text: "Options: --no-prose skips HTML element mappings (h1, p, code, etc.). --tailwind generates a Tailwind CSS preset mapping XDS tokens to var() references.",
        },
      ],
    },
    {
      title: 'Runtime vs Built Themes',
      content: [
        {
          type: 'prose',
          text: "XDS themes work in two modes. Choose based on your environment:",
        },
        {
          type: 'table',
          headers: ['', 'Runtime (unbuilt)', 'Built'],
          rows: [
            ['How it works', 'defineTheme() + useInsertionEffect injects <style> at hydration', 'npx xds build-theme pre-compiles to a .css file'],
            ['Token overrides', 'Inline CSS custom properties on wrapper div — present during SSR ✅', 'Same — inline styles ✅'],
            ['Component overrides', 'Injected via useInsertionEffect — client-only ❌', 'In static .css file — present during SSR ✅'],
            ['SSR safe', 'Tokens only — component styles flash on hydration', 'Fully SSR safe — no flash'],
            ['Best for', 'Dev, prototyping, client-only SPAs', 'Production, SSR apps (Next.js, Remix)'],
          ],
        },
        {
          type: 'prose',
          text: "The __built flag on the theme object tells XDSTheme to skip useInsertionEffect entirely — the CSS is already loaded as a static file.",
        },
        {
          type: 'list',
          style: 'do',
          items: [
            "Use build-theme for production SSR apps. Component overrides (heading scale, text styles) require a <style> tag that useInsertionEffect can only inject client-side.",
            "Import the built .css file alongside the theme JS module. The CSS must be in the initial HTML for SSR to work.",
            "Use runtime themes during development for fast iteration — no build step needed.",
          ],
        },
        {
          type: 'list',
          style: 'dont',
          items: [
            "Use runtime (unbuilt) themes in production SSR apps. Component overrides will flash on hydration.",
            "Forget the CSS import when using a built theme. Without it, component overrides won't apply.",
          ],
        },
      ],
    },
    {
      title: 'Light/Dark Mode',
      content: [
        {
          type: 'prose',
          text: "Use light-dark() in token values for automatic mode switching. Use mode='system' (default) on XDSTheme to follow OS preference.",
        },
        {
          type: 'code',
          lang: 'tsx',
          label: 'Automatic with light-dark()',
          code: "'--color-accent': 'light-dark(#0064E0, #2694FE)',\n//                            ^light     ^dark",
        },
        {
          type: 'code',
          lang: 'tsx',
          label: 'Toggle with a button',
          code: `const [mode, setMode] = useState<'light' | 'dark'>('light');

<XDSTheme theme={myTheme} mode={mode}>
  <XDSButton
    label={mode === 'light' ? 'Switch to Dark' : 'Switch to Light'}
    onClick={() => setMode(m => (m === 'light' ? 'dark' : 'light'))}
  />
</XDSTheme>;`,
        },
      ],
    },
    {
      title: 'Nesting Themes',
      content: [
        {
          type: 'prose',
          text: "Wrap different sections in separate <XDSTheme> providers.",
        },
        {
          type: 'code',
          lang: 'tsx',
          label: 'Dark sidebar with light content',
          code: `<XDSTheme theme={lightTheme} mode="light">
  <XDSLayout
    header={<XDSLayoutHeader>...</XDSLayoutHeader>}
    start={
      <XDSTheme theme={darkTheme} mode="dark">
        <XDSLayoutPanel>{/* Dark sidebar */}</XDSLayoutPanel>
      </XDSTheme>
    }
    content={<XDSLayoutContent>{/* Light content */}</XDSLayoutContent>}
  />
</XDSTheme>`,
        },
      ],
    },
    {
      title: 'Page Background',
      content: [
        {
          type: 'prose',
          text: "XDSTheme uses display: contents — it doesn't create a visual box. Apply the theme's background color to a wrapper element via StyleX.",
        },
        {
          type: 'code',
          lang: 'tsx',
          label: 'Applying background color',
          code: `const styles = stylex.create({
  page: {
    backgroundColor: 'var(--color-background-body)',
    minHeight: '100vh',
  },
});

<XDSTheme theme={myTheme}>
  <div {...stylex.props(styles.page)}>
    <XDSLayout>...</XDSLayout>
  </div>
</XDSTheme>;`,
        },
      ],
    },
    {
      title: 'Component Style Overrides',
      content: [
        {
          type: 'prose',
          text: "Themes can override individual component styles via the components field. Components register themeable properties via module augmentation, and your theme provides StyleX overrides.",
        },
        {
          type: 'code',
          lang: 'tsx',
          label: 'Card with gradient border',
          code: `const cardOverrides = stylex.create({
  container: {
    borderRadius: '20px',
    background: 'linear-gradient(135deg, var(--color-accent), var(--color-success))',
    padding: '2px',
  },
  content: {
    backgroundColor: 'var(--color-background-card)',
    borderRadius: '18px',
  },
});

export const myTheme: Theme = {
  name: 'my-theme',
  styles: { colors: colorTheme },
  components: {
    card: {
      container: cardOverrides.container,
      content: cardOverrides.content,
    },
  } as Theme['components'],
};`,
        },
        {
          type: 'table',
          headers: ['Component', 'Key', 'Slots', 'What to customize'],
          rows: [
            ['Button', 'button', 'variants (by variant name)', 'Background, border, shadow per variant'],
            ['Card', 'card', 'container, content', 'Border, radius, shadow, background'],
            ['Heading', 'heading', 'styles (h1-h6), editorialStyles (h1-h6)', 'Font, size, weight, color per level'],
            ['Text', 'text', 'styles (body, large, label, supporting, code)', 'Font, size, weight, color per type'],
            ['Prose', 'prose', 'base, styles (p, ul, ol, li, blockquote, code, pre, hr, strong, em, a)', 'Prose element styling'],
          ],
        },
        {
          type: 'prose',
          text: "Run `npx xds --detail compact component <Name>` to see a component's themeable slots.",
        },
      ],
    },
    {
      title: 'useXDSTheme Hook',
      content: [
        {
          type: 'code',
          lang: 'tsx',
          label: 'Access current theme',
          code: `import {useXDSTheme} from '@xds/core';

function MyComponent() {
  const ctx = useXDSTheme();
  // ctx.theme — the Theme object
  // ctx.mode — 'system' | 'light' | 'dark'
  return null;
}`,
        },
        {
          type: 'prose',
          text: "This is read-only. To change the theme/mode, manage state at the app level and pass it to <XDSTheme>.",
        },
      ],
    },
  ],
};
