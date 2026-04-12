/** @type {import('../../core/src/docs-types').ReferenceDoc} */

export const docs = {
  name: 'styling',
  title: 'Styling XDS Components',
  description:
    'How to customize component appearance: xstyle prop, className, rest props, compound component patterns, and theming hooks.',

  sections: [
    {
      title: 'xstyle Prop',
      content: [
        {
          type: 'prose',
          text: 'Every XDS component accepts an xstyle prop for style customization. It accepts three formats: inline style objects, StyleX styles from stylex.create(), or CSS class name strings.',
        },
        {
          type: 'code',
          lang: 'tsx',
          label: 'Inline object — quick overrides',
          code: `<XDSCard xstyle={{ maxWidth: 400, marginBlock: 16 }} />
<XDSButton label="Save" xstyle={{ alignSelf: 'flex-end' }} />`,
        },
        {
          type: 'code',
          lang: 'tsx',
          label: 'StyleX — reusable, supports pseudo-classes',
          code: `import * as stylex from '@stylexjs/stylex';

const overrides = stylex.create({
  card: {
    boxShadow: {
      default: 'none',
      ':hover': { '@media (hover: hover)': '0 4px 12px rgba(0,0,0,0.1)' },
    },
  },
});

<XDSCard xstyle={overrides.card}>...</XDSCard>`,
        },
        {
          type: 'code',
          lang: 'tsx',
          label: 'CSS class name — works with CSS Modules or plain CSS',
          code: `<XDSCard xstyle="my-custom-card" />
<XDSCard xstyle={styles.customCard} />  // CSS Module`,
        },
        {
          type: 'list',
          style: 'unordered',
          items: [
            '1-2 simple properties (margin, maxWidth): inline object is fine',
            '3+ properties or reusable: use stylex.create',
            'Pseudo-classes (:hover, :focus-visible): requires stylex.create',
            'All :hover styles MUST use @media (hover: hover) guard',
          ],
        },
      ],
    },
    {
      title: 'className and style Props',
      content: [
        {
          type: 'prose',
          text: 'Every component also accepts standard className and style props. className is appended after the component\'s own classes. style is merged after StyleX inline styles, so consumer values win on conflict.',
        },
        {
          type: 'code',
          lang: 'tsx',
          label: 'className for Tailwind or utility classes',
          code: `<XDSButton label="Save" className="my-app-save-btn" />`,
        },
        {
          type: 'prose',
          text: 'Prefer xstyle over className + style. xstyle integrates with StyleX deduplication and the component\'s internal style pipeline. className and style are escape hatches for integration with external CSS systems.',
        },
      ],
    },
    {
      title: 'Rest Props (Prop Drilling)',
      content: [
        {
          type: 'prose',
          text: 'XDS components extend HTML attributes and spread rest props onto their root DOM element. This means data-* attributes, aria-* attributes, event handlers, and other HTML props pass through automatically.',
        },
        {
          type: 'code',
          lang: 'tsx',
          label: 'Data attributes, event handlers, and ARIA',
          code: `<XDSCard
  data-testid="user-card"
  data-user-id={user.id}
  onMouseEnter={handleHover}
  aria-label="User profile card"
>
  ...
</XDSCard>`,
        },
        {
          type: 'code',
          lang: 'tsx',
          label: 'Ref forwarding',
          code: `const cardRef = useRef<HTMLDivElement>(null);
<XDSCard ref={cardRef}>...</XDSCard>`,
        },
        {
          type: 'prose',
          text: 'A few HTML attributes are intentionally omitted from the base type (contentEditable, dangerouslySetInnerHTML). children is not in the base type either — components that accept children declare it explicitly, so slot-based components don\'t silently drop JSX children.',
        },
      ],
    },
    {
      title: 'Compound Components',
      content: [
        {
          type: 'prose',
          text: 'Complex components are composed from smaller XDS components. Each sub-component accepts its own xstyle, className, and rest props. You style the parts individually — there\'s no single "drill into sub-part" prop.',
        },
        {
          type: 'code',
          lang: 'tsx',
          label: 'Dialog with individually styled parts',
          code: `<XDSDialog isOpen={isOpen} onClose={close} xstyle={{ maxWidth: 500 }}>
  <XDSLayout
    header={
      <XDSLayoutHeader hasDivider>
        <XDSHeading level={2}>Edit Profile</XDSHeading>
      </XDSLayoutHeader>
    }
    content={
      <XDSLayoutContent xstyle={{ gap: 'var(--spacing-4)' }}>
        <XDSTextInput label="Name" value={name} onChange={setName} />
      </XDSLayoutContent>
    }
    footer={
      <XDSLayoutFooter hasDivider>
        <XDSButton label="Cancel" variant="secondary" onClick={close} />
        <XDSButton label="Save" variant="primary" onClick={save} />
      </XDSLayoutFooter>
    }
  />
</XDSDialog>`,
        },
        {
          type: 'prose',
          text: 'The pattern: the parent component (Dialog) controls structure and behavior, child components (Layout, Header, Button) control their own appearance. Style each piece where it lives.',
        },
      ],
    },
    {
      title: 'Theming via xds-* Class Names',
      content: [
        {
          type: 'prose',
          text: 'Every component renders a stable xds-* class name (e.g. xds-button, xds-card) plus variant classes. These are the targeting surface for theme overrides in defineTheme. You rarely need to use them directly, but they\'re useful for debugging and for external CSS that needs to target XDS components.',
        },
        {
          type: 'code',
          lang: 'tsx',
          label: 'Class names rendered by components',
          code: `// <XDSButton variant="primary" size="sm" />
// renders: class="xds-button primary sm ..."

// <XDSCard variant="elevated" />
// renders: class="xds-card elevated ..."

// <XDSHeading level={2} />
// renders: class="xds-heading level-2 ..."`,
        },
        {
          type: 'code',
          lang: 'css',
          label: 'Targeting in external CSS (escape hatch)',
          code: `.my-app .xds-button.primary {
  /* override primary button in this app context */
}`,
        },
        {
          type: 'prose',
          text: 'For systematic theming, use defineTheme component overrides instead of raw CSS selectors. Run `npx xds docs theme` for the full theming guide.',
        },
      ],
    },
    {
      title: 'Design Tokens',
      content: [
        {
          type: 'prose',
          text: 'When writing custom styles, use design tokens instead of hardcoded values. Tokens are CSS custom properties that adapt to the active theme and color mode. XDS provides tokens for spacing, color, radius, shadow, typography, and size.',
        },
        {
          type: 'code',
          lang: 'tsx',
          label: 'Using tokens in xstyle (inline)',
          code: `<XDSCard xstyle={{
  padding: 'var(--spacing-4)',
  borderRadius: 'var(--radius-container)',
  backgroundColor: 'var(--color-background-surface)',
}} />`,
        },
        {
          type: 'code',
          lang: 'tsx',
          label: 'Using tokens in stylex.create (type-safe imports)',
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
          text: 'Both approaches work — var() strings in inline xstyle, or typed imports from tokens.stylex in stylex.create(). The typed imports give autocomplete and catch typos at build time.',
        },
        {
          type: 'prose',
          text: 'See `npx xds docs tokens` for the full token reference (all spacing, color, radius, shadow, and typography tokens with values). See `npx xds docs theme` for how to override tokens via defineTheme.',
        },
      ],
    },
    {
      title: 'What NOT to Do',
      content: [
        {
          type: 'list',
          style: 'dont',
          items: [
            'style={{}} on raw <div> wrappers. Use xstyle on the XDS component directly.',
            'Hardcoded colors (#fff, rgb(...)). Use var(--color-*) tokens.',
            'Hardcoded spacing (16px, 1rem). Use var(--spacing-*) tokens.',
            'Wrapping an XDS component in a <div> just to add margin. Use xstyle={{ margin: ... }} on the component.',
            'Using !important. If styles aren\'t applying, check specificity — xstyle is merged last.',
          ],
        },
      ],
    },
  ],
};
