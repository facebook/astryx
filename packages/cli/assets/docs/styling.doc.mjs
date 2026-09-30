// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @type {import('@astryxdesign/cli/authoring').ReferenceDoc} */

export const docs = {
  name: 'styling',
  title: 'Styling Components',
  category: 'guide',
  description:
    'How to customize component appearance: xstyle prop, Tailwind, StyleX, className, rest props, compound component patterns, theming hooks, and styling-library interop.',
  keywords: ['override', 'customize', 'css'],

  sections: [
    {
      title: 'Overview',
  category: 'guide',
      content: [
        {
          type: 'prose',
          text: 'Style components with `xstyle` (StyleX), `className` (Tailwind or your own CSS), or a styling library aliased to Astryx tokens. All of them resolve to the same tokens.',
        },
        {
          type: 'table',
          headers: ['Approach', 'Use for', 'Example'],
          rows: [
            ['StyleX', 'Component-specific overrides, reusable styles, pseudo-classes, and typed tokens', '`const styles = stylex.create(...); <Button xstyle={styles.save} />`'],
            ['Tailwind utilities', 'Page layout, wrappers, and utility styling', '`className="flex gap-3 p-4"`'],
            ['className', 'Integrating with external CSS or Tailwind on components', '`className="my-card shadow-lg"`'],
            ['Styling-library token aliases', 'Keeping Panda, Chakra, MUI, Emotion, styled-components, UnoCSS, CSS Modules, or Sass in sync with the system', "`colors.surface = 'var(--color-background-surface)'`"],
          ],
        },
        {
          type: 'prose',
          text: 'Theming and dark mode work whichever you choose. For external styling libraries, run {@link generic:styling-libraries}; it covers Tailwind, StyleX, Panda, Chakra, MUI, CSS-in-JS, CSS Modules, Sass, and `useTheme()` for non-CSS processing.',
        },
      ],
    },
    {
      title: 'xstyle Prop',
  category: 'guide',
      content: [
        {
          type: 'prose',
          text: 'Every component accepts an `xstyle` prop for style customization. It accepts StyleX styles created via `stylex.create()`, not inline objects or class name strings. StyleX styles are compiled at build time for optimal deduplication and dead-code elimination.',
        },
        {
          type: 'code',
          lang: 'tsx',
          label: 'Simple overrides',
          code: `import * as stylex from '@stylexjs/stylex';

const overrides = stylex.create({
  card: { maxWidth: 400, marginBlock: 16 },
  saveButton: { alignSelf: 'flex-end' },
});

<Card xstyle={overrides.card} />
<Button label="Save" xstyle={overrides.saveButton} />`,
        },
        {
          type: 'code',
          lang: 'tsx',
          label: 'Pseudo-classes and conditional styles',
          code: `import * as stylex from '@stylexjs/stylex';

const overrides = stylex.create({
  card: {
    boxShadow: {
      default: 'none',
      ':hover': { '@media (hover: hover)': '0 4px 12px rgba(0,0,0,0.1)' },
    },
  },
});

<Card xstyle={overrides.card}>...</Card>`,
        },
        {
          type: 'list',
          style: 'unordered',
          items: [
            'All xstyle values must come from stylex.create()',
            'Pseudo-classes (:hover, :focus-visible) are supported inside stylex.create',
            'All :hover styles MUST use @media (hover: hover) guard',
            'For non-StyleX styling (Tailwind, external CSS), use className instead',
          ],
        },
      ],
    },
    {
      title: 'Tailwind Integration',
  category: 'guide',
      content: [
        {
          type: 'prose',
          text: 'The package ships a Tailwind v4 theme bridge that maps all design tokens to Tailwind utility classes. Import it once and use Tailwind classes backed by design tokens: colors, spacing, radius, shadows, and typography all resolve to the active theme.',
        },
        {
          type: 'prose',
          text: 'For the imports and the cascade-layer order to put in your global CSS, see the Tailwind section of {@link generic:styling-libraries}.',
        },
        {
          type: 'code',
          lang: 'tsx',
          label: 'Tailwind utilities alongside components',
          code: `<div className="text-primary bg-surface rounded-lg p-4 flex gap-3">
  <Button label="Save" variant="primary" />
  <Button label="Cancel" variant="secondary" />
</div>`,
        },
        {
          type: 'prose',
          text: 'The bridge is pure CSS with zero JS. Theme changes (dark mode, custom themes) apply automatically because the utilities reference the same CSS custom properties that components use. This is the paved Tailwind path; for other styling libraries that follow the same aliasing pattern, run {@link generic:styling-libraries}.',
        },
      ],
    },
    {
      title: 'className and style Props',
  category: 'guide',
      content: [
        {
          type: 'prose',
          text: 'Every component also accepts standard `className` and `style` props. `className` is appended after the component\'s own classes. `style` is merged after StyleX inline styles, so consumer values win on conflict.',
        },
        {
          type: 'code',
          lang: 'tsx',
          label: 'className with Tailwind utilities',
          code: `<Card className="shadow-lg hover:shadow-xl transition-shadow">
  ...
</Card>
<Button label="Save" className="my-app-save-btn" />`,
        },
        {
          type: 'prose',
          text: 'For layout and wrapper styling, Tailwind utilities on className work well. For component-specific overrides (padding, colors, borders), prefer xstyle; it integrates with StyleX deduplication and the component\'s internal style pipeline.',
        },
      ],
    },
    {
      title: 'Rest Props (Prop Drilling)',
  category: 'guide',
      content: [
        {
          type: 'prose',
          text: 'Components extend HTML attributes and spread rest props onto their root DOM element. This means data-* attributes, aria-* attributes, event handlers, and other HTML props pass through automatically.',
        },
        {
          type: 'code',
          lang: 'tsx',
          label: 'Data attributes, event handlers, and ARIA',
          code: `<Card
  data-testid="user-card"
  data-user-id={user.id}
  onMouseEnter={handleHover}
  aria-label="User profile card"
>
  ...
</Card>`,
        },
        {
          type: 'code',
          lang: 'tsx',
          label: 'Ref forwarding',
          code: `const cardRef = useRef<HTMLDivElement>(null);
<Card ref={cardRef}>...</Card>`,
        },
        {
          type: 'prose',
          text: 'A few HTML attributes are intentionally omitted from the base type (contentEditable, dangerouslySetInnerHTML). children is not in the base type either; components that accept children declare it explicitly, so slot-based components don\'t silently drop JSX children.',
        },
      ],
    },
    {
      title: 'Compound Components',
  category: 'guide',
      content: [
        {
          type: 'prose',
          text: 'Complex components are composed from smaller components. Each sub-component accepts its own xstyle, className, and rest props. You style the parts individually; there\'s no single "drill into sub-part" prop.',
        },
        {
          type: 'code',
          lang: 'tsx',
          label: 'Dialog with individually styled parts',
          code: `import * as stylex from '@stylexjs/stylex';

const overrides = stylex.create({
  dialog: { maxWidth: 500 },
  content: { gap: 'var(--spacing-4)' },
});

<Dialog isOpen={isOpen} onOpenChange={close} xstyle={overrides.dialog}>
  <Layout
    header={
      <LayoutHeader hasDivider>
        <Heading level={2}>Edit Profile</Heading>
      </LayoutHeader>
    }
    content={
      <LayoutContent xstyle={overrides.content}>
        <TextInput label="Name" value={name} onChange={setName} />
      </LayoutContent>
    }
    footer={
      <LayoutFooter hasDivider>
        <Button label="Cancel" variant="secondary" onClick={close} />
        <Button label="Save" variant="primary" onClick={save} />
      </LayoutFooter>
    }
  />
</Dialog>`,
        },
        {
          type: 'prose',
          text: 'The pattern: the parent component (Dialog) controls structure and behavior, child components (Layout, Header, Button) control their own appearance. Style each piece where it lives.',
        },
      ],
    },
    {
      // The key it had in 0.6, so `astryx docs styling
      // preferred-selector-surface-data-attributes` keeps working.
      id: 'preferred-selector-surface-data-attributes',
      title: 'Data attribute selectors',
  category: 'guide',
      content: [
        {
          type: 'prose',
          text: 'When external CSS needs to target an Astryx component by prop or state, combine the stable component class with reflected data attributes. The component class identifies the component (`.astryx-button`, `.astryx-card`); data attributes identify the axis and value (`data-variant`, `data-size`, `data-level`, etc.). This is the preferred selector surface for new CSS because it is explicit and collision-resistant.',
        },
        {
          type: 'code',
          lang: 'css',
          code: `.my-app .astryx-button[data-variant="primary"] {
  /* primary buttons in this app context */
}

.my-app .astryx-button[data-variant="primary"][data-size="sm"] {
  /* small primary buttons */
}

.my-app .astryx-heading[data-level="2"] {
  /* level 2 headings; numeric values stay literal in data attrs */
}`,
        },
        {
          type: 'code',
          lang: 'tsx',
          label: 'What components reflect',
          code: `// <Button variant="primary" size="sm" />
// preferred selector attrs: data-variant="primary" data-size="sm"

// <Card variant="elevated" />
// preferred selector attrs: data-variant="elevated"

// <Heading level={2} />
// preferred selector attrs: data-level="2"`,
        },
        {
          type: 'prose',
          text: 'For systematic theming, use defineTheme component overrides instead of raw CSS selectors. defineTheme keeps the higher-level `prop:value` API (`variant:primary`, `size:sm`) and handles selector generation for you. Run {@link generic:theme} for the full theming guide.',
        },
      ],
    },
    {
      id: 'deprecated-classes',
      title: 'Deprecated: Bare Prop and State Classes',
  category: 'guide',
      content: [
        {
          type: 'prose',
          text: 'Astryx still emits the deprecated bare classes (`.primary`, `.sm`, `.level-2`, `.checked`) and will remove them in a later release. Use data attributes for new CSS; `astryx upgrade --from <old version> --apply` rewrites qualified selectors in `.css` files.',
        },
        {
          type: 'code',
          lang: 'css',
          code: `/* The upgrade preserves old consumer classes and adds the v0.6 prop match */
.my-app .astryx-button:is(.primary, [data-variant="primary"]) {
  /* primary buttons or a consumer-supplied .primary class */
}

/* Numeric values stay literal in data attributes */
.my-app .astryx-heading:is(.level-2, [data-level="2"]) {
  /* level 2 headings or a consumer-supplied .level-2 class */
}`,
        },
        {
          type: 'prose',
          text: 'The upgrade rewrites a selector only when an `.astryx-*` component class qualifies it, turning the old class into an `:is(...)` union of that class and the data attributes it stood for. The union keeps the selector\'s specificity and your own `className` matches, and keeps matching once the bare classes are gone; the `.astryx-*` classes themselves stay. It leaves unqualified classes (a bare `.primary`), unknown classes, and selectors in JavaScript or TypeScript alone: migrate those by hand, and only where they target Astryx.',
        },
      ],
    },
    {
      title: 'Design Tokens',
  category: 'guide',
      content: [
        {
          type: 'prose',
          text: 'When writing custom styles, use design tokens instead of hardcoded values. Tokens are CSS custom properties that adapt to the active theme and color mode. The system provides tokens for spacing, color, radius, shadow, typography, and size.',
        },
        {
          type: 'code',
          lang: 'tsx',
          label: 'Using tokens in stylex.create',
          code: `import * as stylex from '@stylexjs/stylex';

const styles = stylex.create({
  surface: {
    padding: 'var(--spacing-4)',
    borderRadius: 'var(--radius-container)',
    backgroundColor: 'var(--color-background-surface)',
  },
});

<Card xstyle={styles.surface} />`,
        },
        {
          type: 'code',
          lang: 'tsx',
          label: 'Using typed token imports in stylex.create',
          code: `import {colorVars, spacingVars, radiusVars} from '@astryxdesign/core/theme/tokens.stylex';

const styles = stylex.create({
  highlight: {
    backgroundColor: colorVars['--color-accent-muted'],
    padding: spacingVars['--spacing-3'],
    borderRadius: radiusVars['--radius-element'],
  },
});`,
        },
        {
          type: 'prose',
          text: 'Both approaches work: var() strings or typed imports from tokens.stylex. The typed imports give autocomplete and catch typos at build time.',
        },
        {
          type: 'prose',
          text: 'See {@link generic:tokens} for the full token reference (all spacing, color, radius, shadow, and typography tokens with values). See {@link generic:theme} for how to override tokens via defineTheme.',
        },
      ],
    },
    {
      id: 'stylex-setup',
      title: 'StyleX Build Setup (required for swizzled components)',
  category: 'guide',
      content: [
        {
          type: 'prose',
          text: 'Astryx components ship pre-compiled, so consuming the published package needs no StyleX setup. But `astryx swizzle <Component>` copies the raw StyleX *source* into your app, and StyleX source requires a build-time StyleX compiler to produce atomic CSS. Without one the component compiles but renders completely unstyled: no error, no warning. If a swizzled component looks unstyled, a missing StyleX compiler is almost always why. The same applies if you author your own StyleX with `stylex.create()`.',
        },
        {
          type: 'table',
          headers: ['Bundler', 'StyleX plugin'],
          rows: [
            ['Webpack', '@stylexjs/webpack-plugin'],
            ['Vite / Rollup', '@stylexjs/rollup-plugin (or a community Vite plugin)'],
            ['Babel (any bundler)', '@stylexjs/babel-plugin + @stylexjs/postcss-plugin'],
            ['Next.js (App Router, SWC)', 'An SWC-based transform; see the Next.js note below'],
          ],
        },
        {
          type: 'prose',
          text: 'Next.js (App Router) is the sharp edge. StyleX\'s canonical compiler is a Babel plugin, but introducing a Babel config in Next.js disables the SWC compiler, and with it SWC-dependent features like `next/font`.',
        },
        {
          type: 'prose',
          text: 'The repo\'s `apps/example-nextjs-stylex` takes the Babel path (`next/babel`, `@stylexjs/babel-plugin`, `@stylexjs/postcss-plugin`). Babel turns off SWC, so that app does not use `next/font`. To keep `next/font`, use an SWC transform such as `@stylexswc/nextjs-plugin`.',
        },
        {
          type: 'code',
          lang: 'js',
          label: 'next.config.mjs: SWC-based StyleX transform (keeps next/font working)',
          code: `import stylexPlugin from '@stylexswc/nextjs-plugin';

export default stylexPlugin({
  rsOptions: {
    // Resolve @astryxdesign/core's StyleX so swizzled component source compiles.
    aliases: {'@/*': ['./src/*']},
    unstable_moduleResolution: {type: 'commonJS'},
  },
})({
  // your existing Next.js config
});`,
        },
        {
          type: 'list',
          style: 'unordered',
          items: [
            'Symptom of a missing compiler: swizzled component renders with no styles, but no build or runtime error.',
            'A Babel config turns off SWC in Next.js; skip it if you need `next/font`.',
            'Pure theming (defineTheme + astryx theme build) needs NO StyleX compiler; only swizzled/authored StyleX source does.',
          ],
        },
      ],
    },
    {
      title: 'What NOT to Do',
  category: 'guide',
      content: [
        {
          type: 'list',
          style: 'dont',
          items: [
            'style={{}} on raw <div> wrappers. Use xstyle on the component directly.',
            'Hardcoded colors (#fff, rgb(...)). Use var(--color-*) tokens or Tailwind semantic classes (text-primary, bg-surface).',
            'Hardcoded spacing (16px, 1rem). Use var(--spacing-*) tokens or Tailwind spacing utilities (p-4, gap-3).',
            'Wrapping a component in a <div> just to add margin. Use xstyle with stylex.create on the component.',
            'Using !important. If styles aren\'t applying, check specificity; xstyle is merged last.',
          ],
        },
      ],
    },
  ],
};
