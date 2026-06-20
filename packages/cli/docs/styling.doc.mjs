// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @type {import('../../core/src/docs-types').ReferenceDoc} */

export const docs = {
  name: 'styling',
  title: 'Styling Components',
  category: 'guide',
  description:
    'How to customize component appearance: xstyle prop, Tailwind, StyleX, className, rest props, compound component patterns, theming hooks, and styling-library interop.',

  sections: [
    {
      title: 'Overview',
  category: 'guide',
      content: [
        {
          type: 'prose',
          text: 'There are several ways to style things. Here is when to use each:',
        },
        {
          type: 'table',
          headers: ['Approach', 'Use for', 'Example'],
          rows: [
            ['xstyle prop', 'Overriding a specific component', 'xstyle={styles.override}'],
            ['Tailwind utilities', 'Layout, wrappers, and utility styling', 'className="flex gap-3 p-4"'],
            ['stylex.create', 'Reusable styles, pseudo-classes, typed tokens', 'stylex.create({ card: { ... } })'],
            ['className', 'Integrating with external CSS or Tailwind on components', 'className="my-card shadow-lg"'],
            ['Styling-library token aliases', 'Keeping Panda, Chakra, MUI, Emotion, styled-components, UnoCSS, CSS Modules, or Sass in sync with the system', "colors.surface = 'var(--color-background-surface)'"],
          ],
        },
        {
          type: 'prose',
          text: 'All approaches resolve to the same design tokens, so theming and dark mode work regardless of which you choose. For external styling libraries, run `npx astryx docs styling-libraries`; it covers Tailwind, StyleX, Panda, Chakra, MUI, CSS-in-JS, CSS Modules, Sass, and `useTheme()` for non-CSS processing.',
        },
      ],
    },
    {
      title: 'xstyle Prop',
  category: 'guide',
      content: [
        {
          type: 'prose',
          text: 'Every component accepts an xstyle prop for style customization. It accepts StyleX styles created via stylex.create(), not inline objects or class name strings. StyleX styles are compiled at build time for optimal deduplication and dead-code elimination.',
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
          type: 'code',
          lang: 'css',
          label: 'globals.css: import the bridge',
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
          type: 'code',
          lang: 'tsx',
          label: 'Tailwind utilities alongside components',
          code: `<div className="text-primary bg-surface rounded-container p-4 flex gap-3">
  <Button label="Save" variant="primary" />
  <Button label="Cancel" variant="secondary" />
</div>`,
        },
        {
          type: 'prose',
          text: 'The bridge is pure CSS with zero JS. Theme changes (dark mode, custom themes) apply automatically because the utilities reference the same CSS custom properties that components use. This is the paved Tailwind path; for other styling libraries that follow the same aliasing pattern, run `npx astryx docs styling-libraries`.',
        },
      ],
    },
    {
      title: 'className and style Props',
  category: 'guide',
      content: [
        {
          type: 'prose',
          text: 'Every component also accepts standard className and style props. className is appended after the component\'s own classes. style is merged after StyleX inline styles, so consumer values win on conflict.',
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

<Dialog isOpen={isOpen} onClose={close} xstyle={overrides.dialog}>
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
      title: 'Preferred Selector Surface: Data Attributes',
  category: 'guide',
      content: [
        {
          type: 'prose',
          text: 'When external CSS needs to target an XDS component by prop or state, combine the stable component class with reflected data attributes. The component class identifies the component (`.xds-button`, `.xds-card`); data attributes identify the axis and value (`data-variant`, `data-size`, `data-level`, etc.). This is the preferred selector surface for new CSS because it is explicit and collision-resistant.',
        },
        {
          type: 'code',
          lang: 'css',
          code: `.my-app .xds-button[data-variant="primary"] {
  /* primary buttons in this app context */
}

.my-app .xds-button[data-variant="primary"][data-size="sm"] {
  /* small primary buttons */
}

.my-app .xds-heading[data-level="2"] {
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
          text: 'For systematic theming, use defineTheme component overrides instead of raw CSS selectors. defineTheme keeps the higher-level `prop:value` API (`variant:primary`, `size:sm`) and handles selector generation for you. Run `npx astryx docs theme` for the full theming guide.',
        },
      ],
    },
    {
      title: 'Deprecated: Bare Prop and State Classes',
  category: 'guide',
      content: [
        {
          type: 'prose',
          text: 'XDS still emits legacy bare prop/state classes such as `.primary`, `.sm`, `.level-2`, and `.checked` for compatibility with existing apps and built themes. Do not write new CSS against these bare classes. The stable base component classes (`.xds-button`, `.xds-card`, etc.) are not deprecated; only the unprefixed prop/state classes are the legacy surface.',
        },
        {
          type: 'code',
          lang: 'css',
          code: `/* Deprecated compatibility selector — avoid in new CSS */
.my-app .xds-button.primary {
  /* use .xds-button[data-variant="primary"] instead */
}

/* Deprecated compatibility selector — avoid in new CSS */
.my-app .xds-heading.level-2 {
  /* use .xds-heading[data-level="2"] instead */
}`,
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
          code: `import {colorVars, spacingVars, radiusVars} from '@xds/core/theme/tokens.stylex';

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
          text: 'See `npx astryx docs tokens` for the full token reference (all spacing, color, radius, shadow, and typography tokens with values). See `npx astryx docs theme` for how to override tokens via defineTheme.',
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
