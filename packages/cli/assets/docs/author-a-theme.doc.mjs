// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @type {import('@astryxdesign/cli/authoring').ReferenceDoc} */

export const docs = {
  name: 'author-a-theme',
  title: 'Author a theme',
  category: 'guide',
  keywords: ['defineTheme', 'create theme', 'custom theme', 'extends', 'component overrides', 'custom variants', 'adaptations', 'breakpoints', 'theme build', 'theme family', 'tokenVar', 'resolveThemeTokens', 'useTheme', 'palette', 'generate palette', 'seed colors', 'color ramp', 'icon registry'],
  description: 'Create, customize, and build a theme: defineTheme, palette generation, token overrides, component style overrides, custom variants, responsive adaptations, and production builds.',

  sections: [
    {
      id: 'creating-a-custom-theme',
      title: 'Custom themes',
      content: [
        {type: 'prose', text: "Use an installed built theme as the base for ordinary customization. Import it into your source and pass it as `extends` to `defineTheme({extends: importedTheme, ...})`. Build the result, then add the local slug. Only eject when you need to own and maintain a full source fork."},
        {type: 'code', lang: 'bash', label: 'Add to use, eject to fork', code: 'astryx theme list\nastryx theme add stone --import\nastryx theme eject stone\nastryx theme build src/themes/stone/stoneTheme.ts\nastryx theme add stone --import'},
        {type: 'prose', text: "For an annotated map of the whole surface (every defineTheme field, the token families, and the component override syntax, each with the CLI command that prints its reference), run `astryx theme template`. It writes `theme.template.ts` into your project to read and copy from (`astryx init --features theme` writes it as part of project setup)."},
        {type: 'prose', text: 'To apply a theme you created, see {@link generic:use-a-theme}. To generate colors from seed values, see the Palette section below. Use `theme eject` only when you want an independent source fork that no longer receives the package owner\u2019s updates.'},
      ],
    },
    {
      id: 'palette',
      title: 'Generate a palette',
      content: [
        {type: 'prose', text: 'A theme needs dozens of related colors for backgrounds, borders, text, and states, in both light and dark mode. Rather than pick each by hand, name a few seed colors and generate the rest.'},
        {type: 'code', lang: 'json', label: 'Minimal palette config (palette.config.json)', code: '{"families": [{"id": "ocean", "seed": "#0074e2"}]}'},
        {type: 'code', lang: 'bash', label: 'Generate and preview', code: '# Print the palette without writing files\nastryx theme palette generate palette.config.json\n\n# Write palette + receipt, and open a visual preview\nastryx theme palette generate palette.config.json \\\n  --out src/themes/ocean/tokens/ocean.palette.ts \\\n  --preview preview.html'},
        {type: 'prose', text: "The command writes a `.ts` file exporting 21 shades (stops 0–100) for both light and dark, plus a `.receipt.json` to regenerate later. Point your theme's tokens at the palette, then run defineTheme (see below)."},
        {type: 'prose', text: 'For the full palette config fields and CLI flags, run `astryx docs cli/commands/theme-palette-generate`. For the integration-authoring walkthrough of connecting a palette to theme tokens, run `astryx docs cli/integrations/building-blocks/themes/generate-a-palette`.'},
      ],
    },
    {
      title: 'defineTheme',
      content: [
        {type: 'prose', text: "defineTheme creates a theme from token overrides and optional scale configs. Scale configs generate tokens from parameters. Explicit token overrides always take precedence over scale-generated values, token by token. localTokens accepts any valid CSS custom-property name; prefixes do not establish ownership. One caveat for the accent: overriding --color-accent in tokens re-points the reference tokens (--color-accent-muted, --color-text-accent, --color-icon-accent) but NOT --color-on-accent, which stays baked from the color.accent seed. To give each scheme its own accent with a consistent derived palette, pass a [light, dark] tuple to color.accent instead of overriding the token."},
        {type: 'code', lang: 'tsx', label: 'defineTheme with scale configs', code: "import {defineTheme} from '@astryxdesign/core/theme';\n\nconst myTheme = defineTheme({\n  name: 'my-theme',\n  // accent: single hex, or [light, dark] tuple to seed each scheme separately\n  color: { accent: ['#7B61FF', '#9B85FF'], neutralStyle: 'cool' },\n  typography: {\n    scale: { base: 14, ratio: 1.2 },\n    body: { family: 'Inter', fallbacks: '-apple-system, sans-serif' },\n  },\n  radius: { base: 4, multiplier: 1 },\n  motion: { fast: 175, medium: 410, ratio: 0.75 },\n  tokens: {\n    // Explicit overrides take precedence over scale-generated values\n    '--color-background-body': ['#FFFFFF', '#0A0A0A'],\n  },\n});"},
        {type: 'table', headers: ['Config', 'Generates', 'Parameters'], rows: [
          ['color', '--color-accent, --color-background-*, --color-text-*, --color-border, etc.', 'accent? (hex or [light, dark] tuple; omit for neutral-only), neutralStyle? (warm|cool|neutral), contrast? (standard|high)'],
          ['typography.scale', '--text-heading-*-size/weight/leading, --text-body-size/weight/leading', 'base (px), ratio'],
          ['typography.body/heading/code', '--font-family-body, --font-family-heading, --font-family-code', 'family, fallbacks?, url?, weight?'],
          ['radius', '--radius-inner, --radius-element, --radius-container, --radius-page, --radius-chat', 'base (px), multiplier (0–2)'],
          ['motion', '--duration-fast-min/fast/fast-max, --duration-medium-min/medium/medium-max', 'fast (ms), medium (ms), ratio, easing?'],
        ]},
        {type: 'prose', text: 'For dark mode tuples in token values, see the Dark mode section of {@link generic:use-a-theme}.'},
      ],
    },
    {
      title: 'Extending a Theme',
      content: [
        {type: 'prose', text: "`extends` lets you derive a new theme from an existing one, inheriting its tokens, component overrides, icons, and fonts. Only specify what you want to change; everything else carries over from the base theme."},
        {type: 'code', lang: 'tsx', label: 'Extending the neutral theme', code: "import {defineTheme} from '@astryxdesign/core/theme';\nimport {neutralTheme} from '@astryxdesign/theme-neutral';\nimport {myIcons} from './icons';\n\nconst brandTheme = defineTheme({\n  name: 'brand',\n  extends: neutralTheme,\n  icons: myIcons,\n  tokens: {\n    '--color-accent': ['#7B61FF', '#9B85FF'],\n  },\n});"},
        {type: 'table', headers: ['Field', 'Merge behavior'], rows: [
          ['tokens', 'Base tokens are copied first, then child tokens override on top.'],
          ['components', 'Deep-merged: child component rules override matching keys from the base.'],
          ['icons', 'Shallow-merged: child icons override matching names from the base.'],
          ['indicators', 'Shallow-merged: child indicators override matching names from the base.'],
          ['onDark, onLight', "Deep-merged per surface: the base's resolved surface first, then the child's overrides."],
          ['typography, motion, radius, color', 'Child config replaces base entirely (these are scale inputs, not additive).'],
          ['adaptations', 'Width-breakpoint overrides merge by fixed name. Inherited ordered rules keep their relative order; child rules append and re-resolve against the child root axes.'],
        ]},
        {type: 'prose', text: "Inheritance is resolved when the theme is defined, so an extended theme is flat: `astryx theme build` emits one self-contained stylesheet holding everything the child inherited, and the base theme's CSS does not need to be loaded next to it."},
        {type: 'prose', text: 'For the integration-specific guidance on mapping a palette to tokens when extending, see `astryx docs cli/integrations/building-blocks/themes/define-the-theme`.'},
      ],
    },
    {
      title: 'Component Style Overrides',
      content: [
        {type: 'prose', text: 'The `components` field in defineTheme uses semantic component keys and style keys, not raw CSS selectors. Use `base` for all instances, `variant:value` or `stateName` for specific props/states, and let the theme pipeline choose the underlying selector. For raw external CSS escape hatches, prefer the data-attribute selector surface documented in {@link generic:styling}.'},
        {type: 'code', lang: 'tsx', label: 'Component overrides with standard CSS', code: "components: {\n  card: {\n    base: { borderRadius: '20px', padding: '24px' },\n  },\n  button: {\n    base: {\n      borderRadius: '9999px',\n      textTransform: 'uppercase',\n      '--button-focus-offset': '3px',\n    },\n    'variant:ghost': { borderWidth: '2px', borderStyle: 'solid' },\n  },\n}"},
        {type: 'prose', text: "Run `astryx theme targets` for every themeable key in the system (`astryx theme targets <Name>` to scope it, `--json` to lint a theme against it), and `astryx component <Name>` for one component's theming targets, public CSS variables, and which standard CSS properties are supported."},
        {type: 'list', style: 'do', items: ['Write standard CSS properties (borderRadius, padding); the pipeline expands them into internal vars.', 'Set public CSS vars directly when no standard property equivalent exists.']},
        {type: 'list', style: 'dont', items: ['Set private CSS vars (prefixed --_) directly. Use standard CSS properties instead. `astryx theme build` will error.']},
      ],
    },
    {
      title: 'Custom Variants',
      content: [
        {type: 'prose', text: "Themes can add new prop values to any component. Any `prop:value` key where the value isn't a built-in gets treated as a new variant. Use `astryx theme build` to generate TypeScript augmentations for type safety."},
        {type: 'code', lang: 'tsx', label: 'Adding custom variants', code: "components: {\n  button: {\n    'variant:secondary': { backgroundColor: 'rgba(0,0,0,0.06)' },\n    'variant:primary-muted': {\n      backgroundColor: 'light-dark(#F2F4F6, #28292C)',\n      color: 'var(--color-text-primary)',\n    },\n  },\n  banner: {\n    'status:neutral': {\n      backgroundColor: 'var(--color-background-muted)',\n      color: 'var(--color-text-secondary)',\n    },\n  },\n}"},
        {type: 'code', lang: 'tsx', label: 'Using custom variants', code: "// TypeScript knows about 'primary-muted' after astryx theme build\n<Button variant=\"primary-muted\" label=\"Save draft\" />\n<Banner status=\"neutral\" title=\"Note\" />"},
        {type: 'prose', text: "Custom variants only work when the theme that defines them is active. The component's variant map is extended via module augmentation, with no changes to the component source needed."},
      ],
    },
    {
      title: 'Theme Adaptations',
      content: [
        {type: 'prose', text: "Use `adaptations` for opt-in token, theme-local token, and component changes under viewport width, primary-pointer precision, contrast preference, or motion preference. Conditions in one `when` are ANDed. Rules are ordinary ordered objects, and later matching writes win."},
        {type: 'code', lang: 'tsx', label: 'Width and pointer adaptations', code: "const acmeTheme = defineTheme({\n  name: 'acme',\n  adaptations: {\n    widthBreakpoints: {\n      sm: 640, md: 768, lg: 1024, xl: 1280, '2xl': 1536,\n    },\n    rules: [\n      {\n        when: {width: {below: 'md'}},\n        value: {tokens: {'--spacing-4': '12px'}},\n      },\n      {\n        when: {pointer: 'coarse'},\n        value: {tokens: {'--size-element-sm': '36px', '--size-element-md': '40px', '--size-element-lg': '44px'}},\n      },\n    ],\n  },\n});"},
        {type: 'table', headers: ['Condition', 'Values'], rows: [
          ['width.from / width.below', 'sm | md | lg | xl | 2xl'],
          ['pointer', 'coarse | fine'],
          ['contrast', 'more | less | no-preference'],
          ['motion', 'reduce | no-preference'],
        ]},
        {type: 'prose', text: "`widthBreakpoints` are fixed named start points. Defaults are 640 / 768 / 1024 / 1280 / 1536 CSS pixels. `from` includes its point; `below` excludes it."},
      ],
    },
    {
      id: 'adaptation-rules',
      title: 'Adaptation order and validation',
      content: [
        {type: 'prose', text: "Precedence follows rule order. Root theme values apply first, then every matching rule in declaration order. A later rule may deliberately restore a root value. `onDark` and `onLight` media-surface overrides apply after adaptations and win on the same leaf."},
        {type: 'prose', text: "`extends` preserves the base rule order and appends child rules. Inherited conditions use the child's effective breakpoint map. An empty child rule is a no-op, not a removal operator."},
        {type: 'prose', text: 'Adaptations compile to CSS media queries with no resize listener or styling rerender. Runtime and `astryx theme build` use the same compiler, but only a built theme is present at first paint in an SSR app.'},
      ],
    },
    {
      id: 'building-themes-for-production',
      title: 'Build a theme',
      content: [
        {type: 'prose', text: '`astryx theme build` compiles a defineTheme file into production-ready artifacts. Recommended for SSR apps (Next.js, Remix) where styles must be present on first paint.'},
        {type: 'code', lang: 'bash', label: 'Build a theme', code: 'astryx theme build ./src/themes/ocean.ts'},
        {type: 'table', headers: ['File', 'Description'], rows: [
          ['ocean.css', 'Pre-compiled CSS with token overrides, component overrides, and prose element styles in @scope rules'],
          ['ocean.js', 'ES module exporting the theme object with `__built: true` and pre-resolved token values.'],
          ['ocean.d.ts', 'TypeScript declarations for the theme and icon registry exports'],
          ['ocean.variants.d.ts', "(Optional) Module augmentations for custom component prop values"],
        ]},
        {type: 'code', lang: 'tsx', label: 'Using a custom built theme', code: "import {oceanTheme} from './themes/ocean';\nimport './themes/ocean.css';\n\n<Theme theme={oceanTheme}>\n  <App />\n</Theme>"},
        {type: 'prose', text: "After upgrading Astryx, rerun `astryx theme build` for every custom prebuilt theme. Deploy the regenerated files together. The build also warns when the theme names font families it does not load. See {@link generic:typography} for the full recipe."},
        {type: 'prose', text: 'For the runtime vs built tradeoff, see the Runtime vs Built section of {@link generic:use-a-theme}.'},
      ],
    },
    {
      id: 'icon-registry',
      title: 'Built themes with an icon registry',
      content: [
        {type: 'prose', text: "`theme build` emits an icon import when it detects a named import used by the theme's `icons:` field. It does not compile that registry module. Move the registry to a separate module and use a named import."},
        {type: 'code', lang: 'bash', label: 'Compiling the icon registry sidecar', code: "# Emit the built theme\nastryx theme build ./src/themes/ocean.ts -o dist/theme.css --icons-specifier ./icons.mjs\n\n# Compile the icon registry alongside it\nesbuild src/themes/icons.tsx --bundle --format=esm --outfile=dist/icons.mjs \\\n  --external:react --external:lucide-react --jsx=automatic"},
        {type: 'prose', text: 'Keep `react` and the icon library external so the registry does not bundle its own copies of those dependencies.'},
      ],
    },
    {
      title: 'Building a Theme Family',
      content: [
        {type: 'prose', text: 'Use family mode when an app switches among one base theme and its selected descendants. The build writes one keyed CSS file containing every member, plus one keyed JavaScript module and one declaration file.'},
        {type: 'code', lang: 'bash', label: 'Build one family', code: "astryx theme build --family \\\n  ./src/themes/ocean.mjs \\\n  ./src/themes/ocean-calm.mjs \\\n  ./src/themes/ocean-calm-deep.mjs \\\n  --family-key ocean-family"},
        {type: 'prose', text: 'The family stylesheet eagerly downloads every selected member so first paint is complete. Switching members changes only the theme identity; it does not add, remove, or reorder stylesheets.'},
      ],
    },
    {
      title: 'Token Utilities',
      content: [
        {type: 'prose', text: 'Use `tokenVar()` when a non-StyleX styling library wants a CSS variable reference, and `resolveThemeTokens()` when JavaScript needs token values for a specific theme and mode without React context.'},
        {type: 'code', lang: 'ts', label: 'CSS var references for styling-library configs', code: "import {tokenVar, tokenVars} from '@astryxdesign/core/theme/tokens';\n\nconst pandaOrEmotionTheme = {\n  colors: {\n    text: tokenVar('--color-text-primary'),\n    surface: tokenVars['--color-background-surface'],\n  },\n};"},
        {type: 'code', lang: 'ts', label: 'Resolve token values without a hook', code: "import {resolveThemeTokens} from '@astryxdesign/core/theme/tokens';\nimport {neutralTheme} from '@astryxdesign/theme-neutral';\n\nconst lightTokens = resolveThemeTokens(neutralTheme, {mode: 'light'});\nconst chartTheme = {\n  textColor: lightTokens['--color-text-primary'],\n  seriesColor: lightTokens['--color-data-categorical-blue'],\n};"},
        {type: 'prose', text: 'For styling library interop patterns, see {@link generic:styling-libraries}.'},
      ],
    },
    {
      title: 'useTheme Hook',
      content: [
        {type: 'prose', text: '`useTheme()` reads the nearest Theme and effective color mode from React context. Use it inside client components for SVG, canvas, charts, maps, and third-party configuration objects that need token values in JavaScript.'},
        {type: 'code', lang: 'tsx', label: 'Access resolved token values in React', code: "import {useMemo} from 'react';\nimport {useTheme} from '@astryxdesign/core/theme';\n\nfunction ChartConfig() {\n  const {mode, tokens} = useTheme();\n  const options = useMemo(() => ({\n    mode,\n    textColor: tokens['--color-text-primary'],\n    gridColor: tokens['--color-border'],\n    seriesColor: tokens['--color-data-categorical-blue'],\n  }), [mode, tokens]);\n  return <Chart options={options} />;\n}"},
        {type: 'prose', text: 'Prefer CSS variables for ordinary styling. See {@link generic:use-a-theme} for the provider setup, and {@link generic:tokens} for the full token reference.'},
      ],
    },
  ],
};
