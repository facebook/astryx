/** @type {import('../../core/src/docs-types').ReferenceDoc} */

export const docs = {
  name: 'theme',
  title: 'XDS Theme System',
  description: 'XDSTheme provider, custom themes, light/dark mode, and component style overrides.',

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
  '--color-surface': 'light-dark(#FFFFFF, #1A1A2E)',
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
          text: "Token groups (all optional in styles): colors, spacing, size, radius, elevation, transition, typography, textSize, lineHeight, fontWeight. Omitted groups use defineVars defaults.",
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
  typeScale: { base: 14, ratio: 1.2 },       // generates heading + text tokens
  radiusScale: { base: 4, multiplier: 1 },    // generates radius tokens
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
            ['typeScale', '--heading-*-size/weight/leading, --text-*-size/weight/leading', 'base (px), ratio, weights?'],
            ['radiusScale', '--radius-0 through --radius-4, --radius-rounded', 'base (px), multiplier (0–2)'],
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
    backgroundColor: 'var(--color-wash)',
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
    background: 'linear-gradient(135deg, var(--color-accent), var(--color-positive))',
    padding: '2px',
  },
  content: {
    backgroundColor: 'var(--color-card)',
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
