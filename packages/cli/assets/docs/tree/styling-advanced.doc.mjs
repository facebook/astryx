// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file `astryx docs styling/styling-advanced`: compound component styling,
 * data-attribute selectors, deprecated bare classes, and what not to do.
 */

/** @type {import('@astryxdesign/cli/authoring').ReferenceDoc} */

export const docs = {
  type: 'generic',
  name: 'styling-advanced',
  title: 'Advanced',
  placement: {parent: 'namespace:styling', slot: 'guides', order: 20},
  category: 'guide',
  description:
    'Compound component styling, data-attribute selectors, deprecated bare prop/state classes, and common anti-patterns.',
  keywords: [
    'compound',
    'data attributes',
    'deprecated',
    'selector',
    'astryx-button',
    'data-variant',
  ],

  sections: [
    {
      title: 'Compound Components',
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
      id: 'preferred-selector-surface-data-attributes',
      title: 'Data attribute selectors',
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
          text: 'For systematic theming, use defineTheme component overrides instead of raw CSS selectors. defineTheme keeps the higher-level `prop:value` API (`variant:primary`, `size:sm`) and handles selector generation for you. Run {@link generic:author-a-theme} for component theming.',
        },
      ],
    },
    {
      id: 'deprecated-classes',
      title: 'Deprecated: Bare Prop and State Classes',
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
      title: 'What NOT to Do',
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
