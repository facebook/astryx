// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @type {import('@astryxdesign/cli/authoring').ReferenceDoc} */

export const docs = {
  name: 'theme',
  title: 'Theme System',
  category: 'guide',
  keywords: ['use', 'apply', 'setup'],
  description:
    'How to use and apply themes in your app: providers, custom themes, light/dark mode, production builds, and component style overrides.',

  sections: [
    {
      id: 'quick-start',
      title: 'Wrap your app in a theme',
      category: 'guide',
      content: [
        {
          type: 'code',
          lang: 'bash',
          label: 'Install and add a theme',
          code: 'npm install @astryxdesign/theme-neutral\nastryx theme add neutral --import',
        },
        {
          type: 'code',
          lang: 'tsx',
          label: 'Wire the generated module once',
          code: `import {Theme} from '@astryxdesign/core';
import {themes, defaultThemeSlug} from './astryx-themes';

function App() {
  return (
    <Theme theme={themes[defaultThemeSlug]}>
      <YourApp />
    </Theme>
  );
}`,
        },
        {
          type: 'code',
          lang: 'tsx',
          label: 'Switch among added themes',
          code: `import {useState} from 'react';
import {themes, type ThemeSlug} from './astryx-themes';

const [slug, setSlug] = useState<ThemeSlug>('neutral');
const app = <Theme theme={themes[slug]}><YourApp /></Theme>;`,
        },
        {
          type: 'prose',
          text: '`theme add --import` records an installed package theme and regenerates `src/astryx-themes.ts` or `.js` with its built module, production CSS, and optional font CSS. In a project without `src`, the module is at the project root. The first imported theme becomes the default. `theme use <slug>` changes that default, and `theme remove <slug>` removes a non-default theme.',
        },
        {
          type: 'prose',
          text: 'Customize a package theme with `defineTheme({extends: importedTheme, ...})`, then build and add that local theme. Use `theme eject` only when you want an independent source fork that no longer receives the package owner’s updates.',
        },
      ],
    },
    {
      title: 'Migrating Earlier Theme Copies',
      category: 'guide',
      content: [
        {
          type: 'prose',
          text: 'A theme copied by the released `theme add` stays app source. The upgrade does not move, delete, or rewrite it. It only writes the missing same-stem descriptor with `maintained: false`, so the copy becomes a local theme.',
        },
        {
          type: 'code',
          lang: 'bash',
          label: 'Add descriptors to earlier copies',
          code: 'astryx upgrade --from 0.6.4 --path . --apply',
        },
        {
          type: 'prose',
          text: 'Before the upgrade runs, theme commands skip a descriptor-less copy in `src/themes`. `theme list` and doctor name it as unmigrated and show the upgrade command. A script that meant to copy source now runs `theme eject` with the same arguments. A script that meant to make the app use a theme runs `theme add --import`.',
        },
        {
          type: 'prose',
          text: '`ASTRYX_THEME` is no longer read. Run `theme add <slug> --import` and `theme use <slug>` to choose the default in a generated app theme module. When that module exists, component metadata reads its recorded default theme. Without the module, the released `package.json#astryx.theme` lookup keeps its meaning.',
        },
      ],
    },
    {
      title: 'Available Themes',
      category: 'guide',
      content: [
        {
          type: 'prose',
          text: 'Install the theme package you want with `npm install @astryxdesign/theme-{name}`, then import its slug with `theme add <slug> --import`. The CLI imports the package’s built outputs for you.',
        },
        {
          type: 'table',
          headers: ['Theme', 'Add command', 'Description'],
          rows: [
            [
              'Neutral',
              'astryx theme add neutral --import',
              'Muted, minimal aesthetic with Figtree typography. A good starting point.',
            ],
            [
              'Butter',
              'astryx theme add butter --import',
              'Golden, buttery surfaces with blue accents; Sarina + Outfit type.',
            ],
            [
              'Chocolate',
              'astryx theme add chocolate --import',
              'Warm brown tones and cozy beige; Fraunces + Albert Sans type.',
            ],
            [
              'Gothic',
              'astryx theme add gothic --import',
              'Dark-only atmospheric theme; deep blue-gray surfaces, distressed display type.',
            ],
            [
              'Matcha',
              'astryx theme add matcha --import',
              'Earthy greens; DM Sans + Playwrite US Trad type.',
            ],
            [
              'Stone',
              'astryx theme add stone --import',
              'Warm stone and slate tones; Montserrat + Figtree type.',
            ],
            [
              'Y2K',
              'astryx theme add y2k --import',
              'Playful Y2K pop; periwinkle body, holographic accents, Poppins + `Crimson Text`.',
            ],
          ],
        },
        {
          type: 'prose',
          text: 'Every first-party package exports its built theme at `@astryxdesign/theme-{name}/built`, production CSS at `/theme.css`, and font loading CSS at `/fonts.css`. `theme add --import` writes those imports into the generated app module.',
        },
      ],
    },
    {
      title: 'Theme Props',
      category: 'guide',
      content: [
        {
          type: 'prose',
          text: "`<Theme>` takes `theme` (required), `mode` (`'system'` by default, or `'light'`/`'dark'`), and `children`. For every prop, run `astryx component Theme`.",
        },
      ],
    },
    {
      id: 'integration-themes',
      title: 'Using a Theme from an Integration',
      category: 'guide',
      content: [
        {
          type: 'prose',
          text: 'Install the integration as a direct dependency. Astryx discovers its themes and guides without an `astryx.config` entry. A theme can be added only when the installed package exports its built module and production stylesheet.',
        },
        {
          type: 'code',
          lang: 'bash',
          label: 'Install, inspect, and add',
          code: 'npm install @astryxdesign/core @acme/brand-integration\nastryx theme list --package @acme/brand-integration\nastryx docs brand-theme\nastryx theme add ocean --import --package @acme/brand-integration',
        },
        {
          type: 'prose',
          text: '`theme add --import` keeps the owner package in the app record and imports its built module, stylesheet, and optional font stylesheet. Package updates continue to reach the app. Run `theme eject ocean --package @acme/brand-integration` only to copy the source and descriptor into `src/themes/ocean` as an independent local fork.',
        },
      ],
    },
    {
      id: 'creating-a-custom-theme',
      title: 'Custom themes',
      category: 'guide',
      content: [
        {
          type: 'prose',
          text: 'Use an installed built theme as the base for ordinary customization. Import it into your source and pass it as `extends` to `defineTheme({extends: importedTheme, ...})`. Build the result, then add the local slug. Only eject when you need to own and maintain a full source fork.',
        },
        {
          type: 'code',
          lang: 'bash',
          label: 'Add to use, eject to fork',
          code: 'astryx theme list\nastryx theme add stone --import\nastryx theme eject stone\nastryx theme build src/themes/stone/stoneTheme.ts\nastryx theme add stone --import',
        },
        {
          type: 'prose',
          text: 'For an annotated map of the whole surface (every defineTheme field, the token families, and the component override syntax, each with the CLI command that prints its reference), run `astryx theme template`. It writes `theme.template.ts` into your project to read and copy from (`astryx init --features theme` writes it as part of project setup).',
        },
      ],
    },
    {
      title: 'defineTheme',
      category: 'guide',
      content: [
        {
          type: 'prose',
          text: 'defineTheme creates a theme from token overrides and optional scale configs. Scale configs generate tokens from parameters. Explicit token overrides always take precedence over scale-generated values, token by token. localTokens accepts any valid CSS custom-property name; prefixes do not establish ownership. One caveat for the accent: overriding --color-accent in tokens re-points the reference tokens (--color-accent-muted, --color-text-accent, --color-icon-accent) but NOT --color-on-accent, which stays baked from the color.accent seed. To give each scheme its own accent with a consistent derived palette, pass a [light, dark] tuple to color.accent instead of overriding the token.',
        },
        {
          type: 'code',
          lang: 'tsx',
          label: 'defineTheme with scale configs',
          code: `import {defineTheme} from '@astryxdesign/core/theme';

const myTheme = defineTheme({
  name: 'my-theme',
  // accent: single hex, or [light, dark] tuple to seed each scheme separately
  color: { accent: ['#7B61FF', '#9B85FF'], neutralStyle: 'cool' },
  typography: {
    scale: { base: 14, ratio: 1.2 },
    body: { family: 'Inter', fallbacks: '-apple-system, sans-serif' },
  },
  radius: { base: 4, multiplier: 1 },
  motion: { fast: 175, medium: 410, ratio: 0.75 },
  tokens: {
    // Explicit overrides take precedence over scale-generated values
    '--color-background-body': ['#FFFFFF', '#0A0A0A'],
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
              'accent? (hex or [light, dark] tuple; omit for neutral-only), neutralStyle? (warm|cool|neutral), contrast? (standard|high)',
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
          label: 'Extending the neutral theme',
          code: `import {defineTheme} from '@astryxdesign/core/theme';
import {neutralTheme} from '@astryxdesign/theme-neutral/built';
import {myIcons} from './icons';

const brandTheme = defineTheme({
  name: 'brand',
  extends: neutralTheme,
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
            [
              'tokens',
              'Base tokens are copied first, then child tokens override on top.',
            ],
            [
              'components',
              'Deep-merged: child component rules override matching keys from the base.',
            ],
            [
              'icons',
              'Shallow-merged: child icons override matching names from the base.',
            ],
            [
              'indicators',
              'Shallow-merged: child indicators override matching names from the base.',
            ],
            [
              'onDark, onLight',
              "Deep-merged per surface: the base's resolved surface first, then the child's overrides.",
            ],
            [
              'typography, motion, radius, color',
              'Child config replaces base entirely (these are scale inputs, not additive).',
            ],
            [
              'adaptations',
              'Width-breakpoint overrides merge by fixed name. Inherited ordered rules keep their relative order; child rules append and re-resolve against the child root axes.',
            ],
          ],
        },
        {
          type: 'prose',
          text: "Inheritance is resolved when the theme is defined, so an extended theme is flat: `astryx theme build` emits one self-contained stylesheet holding everything the child inherited, and the base theme's CSS does not need to be loaded next to it. A base that is not a theme (most often an import that missed) is a build error rather than a theme that silently inherits nothing.",
        },
      ],
    },
    {
      title: 'Theme Adaptations',
      category: 'guide',
      content: [
        {
          type: 'prose',
          text: 'Use `adaptations` for opt-in token, theme-local token, and component changes under viewport width, primary-pointer precision, contrast preference, or motion preference. Conditions in one `when` are ANDed. Rules are ordinary ordered objects, and later matching writes win.',
        },
        {
          type: 'code',
          lang: 'tsx',
          label: 'Width and pointer adaptations',
          code: `const acmeTheme = defineTheme({
  name: 'acme',
  adaptations: {
    widthBreakpoints: {
      sm: 640,
      md: 768,
      lg: 1024,
      xl: 1280,
      '2xl': 1536,
    },
    rules: [
      {
        when: {width: {below: 'md'}},
        value: {tokens: {'--spacing-4': '12px'}},
      },
      {
        when: {pointer: 'coarse'},
        value: {
          tokens: {
            '--size-element-sm': '36px',
            '--size-element-md': '40px',
            '--size-element-lg': '44px',
          },
        },
      },
      {
        when: {
          width: {from: 'lg', below: 'xl'},
          pointer: 'coarse',
          contrast: 'more',
        },
        value: {components: {card: {base: {borderWidth: '2px'}}}},
      },
    ],
  },
});`,
        },
        {
          type: 'table',
          headers: ['Condition', 'Values'],
          rows: [
            ['width.from / width.below', 'sm | md | lg | xl | 2xl'],
            ['pointer', 'coarse | fine'],
            ['contrast', 'more | less | no-preference'],
            ['motion', 'reduce | no-preference'],
          ],
        },
        {
          type: 'prose',
          text: '`widthBreakpoints` are fixed named start points. Defaults are 640 / 768 / 1024 / 1280 / 1536 CSS pixels. `from` includes its point; `below` excludes it. Breakpoint configuration alone emits no CSS. For how matching rules combine and what a rule may write, see Adaptation order and validation.',
        },
      ],
    },
    {
      id: 'adaptation-rules',
      title: 'Adaptation order and validation',
      category: 'guide',
      content: [
        {
          type: 'prose',
          text: 'Precedence follows rule order. Root theme values apply first, then every matching rule in declaration order. A later rule may deliberately restore a root value. `onDark` and `onLight` media-surface overrides apply after adaptations and win on the same leaf.',
        },
        {
          type: 'prose',
          text: "`extends` preserves the base rule order and appends child rules. Inherited conditions use the child's effective breakpoint map, and partial generative axes complete from the child root metadata. An empty child rule is a no-op, not a removal operator.",
        },
        {
          type: 'prose',
          text: 'A rule may replace a theme-local token only when the exact name is already enrolled by root `localTokens` or an enrolled base. Component writes in a rule are validated exactly like root `components` — same targets, axes, and value domains. The one addition is that a rule may not be the only place a custom value is enrolled: a value that is valid only because a theme enrolls it generates unconditional type augmentation, so declare it on the root theme first and let rules restyle it. Built-in values need no root declaration. When rules can match together, their ordered portable and local token writes are validated as one effective graph; any reachable cycle fails before CSS is emitted.',
        },
        {
          type: 'prose',
          text: 'Adaptations compile to CSS media queries with no resize listener or styling rerender. Runtime and `astryx theme build` use the same compiler, but only a built theme is present at first paint in an SSR app.',
        },
      ],
    },
    {
      title: 'Component Style Overrides',
      category: 'guide',
      content: [
        {
          type: 'prose',
          text: 'The `components` field in defineTheme uses semantic component keys and style keys, not raw CSS selectors. Use `base` for all instances, `variant:value` or `stateName` for specific props/states, and let the theme pipeline choose the underlying selector. For raw external CSS escape hatches, prefer the data-attribute selector surface documented in {@link generic:styling}.',
        },
        {
          type: 'code',
          lang: 'tsx',
          label: 'Component overrides with standard CSS',
          code: `components: {
  // Standard CSS properties are expanded automatically.
  // borderRadius also sets the internal radius var for concentric math.
  // padding on container components (card, section, dialog, bottom-sheet) expands to layout tokens.
  card: {
    base: { borderRadius: '20px', padding: '24px' },
  },
  button: {
    base: {
      borderRadius: '9999px',
      textTransform: 'uppercase',
      // Some components have public CSS vars for properties that don't map
      // to standard CSS. Set these directly. Take the name from
      // \`astryx component <Name>\` — a var the component does not define
      // compiles to CSS that never applies.
      '--button-focus-offset': '3px',
    },
    'variant:ghost': { borderWidth: '2px', borderStyle: 'solid' },
  },
}`,
        },
        {
          type: 'prose',
          text: "Run `astryx theme targets` for every themeable key in the system (`astryx theme targets <Name>` to scope it, `--json` to lint a theme against it), and `astryx component <Name>` for one component's theming targets, public CSS variables, and which standard CSS properties are supported.",
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
          text: "Themes can add new prop values to any component. Any `prop:value` key where the value isn't a built-in gets treated as a new variant. Use `astryx theme build` to generate TypeScript augmentations for type safety.",
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
      backgroundColor: 'var(--color-background-muted)',
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
          text: "Custom variants only work when the theme that defines them is active. The component's variant map is extended via module augmentation, with no changes to the component source needed.",
        },
      ],
    },
    {
      id: 'building-themes-for-production',
      title: 'Build a theme',
      category: 'guide',
      content: [
        {
          type: 'prose',
          text: '`astryx theme build` compiles a defineTheme file into production-ready artifacts. Recommended for SSR apps (Next.js, Remix) where styles must be present on first paint.',
        },
        {
          type: 'code',
          lang: 'bash',
          label: 'Build a theme',
          code: 'astryx theme build ./src/themes/ocean.ts',
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
              'ES module exporting the theme object with `__built: true` and pre-resolved token values. Also imports and re-exports an icon registry when the build detects its named import in the source theme (see Built themes with an icon registry).',
            ],
            [
              'ocean.d.ts',
              'TypeScript declarations for the theme and icon registry exports',
            ],
            [
              'ocean.variants.d.ts',
              "(Optional) Module augmentations for custom component prop values found in the theme's component overrides",
            ],
          ],
        },
        {
          type: 'prose',
          text: 'The `__built: true` flag tells Theme to skip runtime `<style>` injection; the CSS file handles it.',
        },
        {
          type: 'prose',
          text: 'After upgrading Astryx across a selector-contract change, rerun `astryx theme build <theme-file>` for every custom prebuilt theme. Deploy the regenerated `.css`, `.js`, `.d.ts`, and optional `.variants.d.ts` together. The runtime intentionally trusts `__built: true` and will not repair stale CSS from an older build.',
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
        {
          type: 'prose',
          text: "The build also warns when the theme names font families it does not load (webfonts like Fraunces) and prints the `<link>`/`@font-face` to add. The built CSS only sets font-family, so loading the font files stays the app's job. See {@link generic:typography} for the full recipe.",
        },
      ],
    },
    {
      id: 'icon-registry',
      title: 'Built themes with an icon registry',
      category: 'guide',
      content: [
        {
          type: 'prose',
          text: "The current `theme build` implementation emits an icon import when it detects a named import used by the theme’s `icons:` field, such as `import {oceanIcons} from './icons'` with `icons: oceanIcons`. It does not compile that registry module. Inline registries, including local constants, are currently omitted from the generated theme even though `defineTheme` accepts them at runtime. Move the registry to a separate module and use a named import for this build flow. For a registry that uses React and lucide-react, the following example compiles it alongside the generated theme:",
        },
        {
          type: 'code',
          lang: 'bash',
          label: 'Compiling the icon registry sidecar',
          code: `# Emit the built theme; point its icon import at the file the next step produces
astryx theme build ./src/themes/ocean.ts -o dist/theme.css --icons-specifier ./icons.mjs

# Compile the icon registry to a real ES module next to the generated JS
esbuild src/themes/icons.tsx --bundle --format=esm --outfile=dist/icons.mjs \\
  --external:react --external:lucide-react --jsx=automatic`,
        },
        {
          type: 'prose',
          text: 'In the example above, the generated theme imports `./icons.mjs` from `dist`. If the second command is skipped, `theme build` can still succeed, but loading or bundling the generated module fails because `dist/icons.mjs` is missing. `--icons-specifier` changes the emitted import; it does not create or verify the target file. Match the specifier to a module that resolves from the generated JS file. Keep `react` and the icon library external so the registry does not bundle its own copies of those dependencies.',
        },
        {
          type: 'prose',
          text: 'Without `--icons-specifier`, the detected source import specifier is emitted unchanged. In the default no-`--out` flow, a bundler can resolve an extensionless `./icons` to the neighboring `icons.tsx` source. Node ESM does not perform that lookup and reports `ERR_MODULE_NOT_FOUND`. Moving the output with `--out` also changes where relative imports resolve; the generated module cannot find the original source merely because a bundler is used.',
        },
      ],
    },
    {
      title: 'Building a Theme Family',
      category: 'guide',
      content: [
        {
          type: 'prose',
          text: 'Use family mode when an app switches among one base theme and its selected descendants. The build writes one keyed CSS file containing every member, plus one keyed JavaScript module and one declaration file beside the root source.',
        },
        {
          type: 'code',
          lang: 'bash',
          label: 'Build one family',
          code: `astryx theme build --family \\
  ./src/themes/ocean.mjs \\
  ./src/themes/ocean-calm.mjs \\
  ./src/themes/ocean-calm-deep.mjs \\
  --family-key ocean-family`,
        },
        {
          type: 'code',
          lang: 'html',
          label: 'Load native CSS and ESM independently',
          code: `<link rel="stylesheet" href="./src/themes/ocean-family.css" />
<script type="module">
  import {oceanCalmTheme} from './src/themes/ocean-family.js';
</script>`,
        },
        {
          type: 'prose',
          text: 'The family stylesheet eagerly downloads every selected member so first paint is complete. Switching members changes only the theme identity; it does not add, remove, or reorder stylesheets. A bundler such as Vite consumes the same CSS and ESM files.',
        },
        {
          type: 'prose',
          text: 'The family key is only the filename stem (`ocean-family.css`, `.js`, and `.d.ts`) and must differ from every selected member name. Use the ordinary standalone build when an app needs only one complete theme. Add `--check` to compare the exact keyed trio without writing.',
        },
      ],
    },
    {
      title: 'Runtime vs Built Themes',
      category: 'guide',
      content: [
        {
          type: 'prose',
          text: 'Apps use built themes. The generated app module imports each theme object with its production CSS and optional font CSS, so every added theme is ready on first paint. Source-theme imports remain an authoring input for `theme build`, not the app wiring model.',
        },
        {
          type: 'table',
          headers: ['App concern', 'Package theme', 'Local theme'],
          rows: [
            [
              'Add',
              '`astryx theme add <slug> --import [--package <package>]`',
              '`astryx theme build <source>` then `astryx theme add <slug> --import`',
            ],
            [
              'Module import',
              'Package `./built` or `./themes/<slug>` export',
              'Built `<slug>.js` beside the source',
            ],
            [
              'Styles',
              '`./theme.css` or `./themes/<slug>.css`, plus optional font CSS',
              'Built `<slug>.css`, plus optional `<slug>.fonts.css`',
            ],
            [
              'Updates',
              'Stay owned by the installed package',
              'Stay owned and rebuilt by the app',
            ],
          ],
        },
        {
          type: 'list',
          style: 'do',
          items: [
            'Import `themes` and `defaultThemeSlug` from the generated module once.',
            'Extend an imported built theme for ordinary customization.',
            'Use `theme eject` only when you want an independent source fork.',
          ],
        },
        {
          type: 'list',
          style: 'dont',
          items: [
            'Import package theme source into app runtime code.',
            "Import a built theme without its stylesheet; component overrides won't apply.",
            'Hand-edit the generated theme module; add, remove, and use regenerate it.',
          ],
        },
      ],
    },
    {
      id: 'light-dark-mode',
      title: 'Dark mode',
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
      id: 'nesting-themes',
      title: 'Nested themes',
      category: 'guide',
      content: [
        {
          type: 'prose',
          text: 'Wrap different sections in separate `<Theme>` providers.',
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
          text: 'Use `tokenVar()` when a non-StyleX styling library wants a CSS variable reference, and `resolveThemeTokens()` when JavaScript needs token values for a specific theme and mode without React context. Themes are also registered by name when created with `defineTheme()`; call `registerTheme(theme)` for prebuilt or object-literal themes that need name-based SSR lookup.',
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
import {neutralTheme} from '@astryxdesign/theme-neutral/built';

const lightTokens = resolveThemeTokens(neutralTheme, {mode: 'light'});
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
          text: 'Prefer CSS variables, StyleX token imports, xstyle, or className for ordinary styling. To change the theme or mode, manage state at the app level and pass it to `<Theme>`.',
        },
        {
          type: 'prose',
          text: 'See {@link generic:styling-libraries} for styling-library interop and {@link generic:tokens} for the full token reference.',
        },
      ],
    },
  ],
};
