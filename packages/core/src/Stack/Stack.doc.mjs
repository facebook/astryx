/** @type {import('../docs-types').ComponentDoc} */

export const docs = {
  name: 'Stack',
  description:
    'Stack layout primitives for arranging items in horizontal or vertical sequences using flexbox-based layout with themed spacing tokens.',
  features: [
    'Horizontal (XDSHStack) and vertical (XDSVStack) stacking',
    'Themed spacing via gap tokens from the design system spacing scale',
    'Individual item control via XDSStackItem',
    'Polymorphic rendering support via the element prop',
    'Low-level StyleX utilities (stack, stackItem) for advanced use cases',
  ],
  examples: [
    {
      label: 'Header layout',
      code: `<XDSHStack element="header" gap={2}>
  <XDSStackItem size="static">
    <Logo />
  </XDSStackItem>
  <XDSStackItem size="fill">
    <Navigation />
  </XDSStackItem>
  <XDSStackItem size="static">
    <UserMenu />
  </XDSStackItem>
</XDSHStack>`,
    },
    {
      label: 'Sidebar layout',
      code: `<XDSHStack gap={4}>
  <XDSStackItem size="static">
    <Sidebar />
  </XDSStackItem>
  <XDSStackItem size="fill">
    <MainContent />
  </XDSStackItem>
</XDSHStack>`,
    },
    {
      label: 'Page layout',
      code: `<XDSVStack element="main" gap={6}>
  <XDSStackItem size="static">
    <PageHeader />
  </XDSStackItem>
  <XDSStackItem size="fill">
    <PageContent />
  </XDSStackItem>
  <XDSStackItem size="static">
    <PageFooter />
  </XDSStackItem>
</XDSVStack>`,
    },
    {
      label: 'Override alignment per item',
      code: `<XDSHStack vAlign="start">
  <XDSStackItem crossAlignSelf="center">Centered</XDSStackItem>
  <XDSStackItem>Top-aligned</XDSStackItem>
</XDSHStack>`,
    },
    {
      label: 'StyleX utility — advanced use',
      code: `import {stack} from '@xds/core/Layout';
import * as stylex from '@stylexjs/stylex';

<div {...stylex.props(...stack({direction: 'horizontal', gap: 2}))}>
  <Child />
  <Child />
</div>`,
    },
  ],
  theming: {
    targets: [
      {className: 'xds-stack', visualProps: ['direction', 'gap', 'wrap']},
      {className: 'xds-stack-item', visualProps: ['size']},
    ],
  },
  notes: [
    "Import from '@xds/core/Layout': XDSHStack, XDSVStack, XDSStackItem, stack, stackItem.",
    'The gap prop accepts numeric spacing steps: 0, 0.5, 1, 1.5, 2, 3, 4, 5, 6, 8, 10.',
    'stack and stackItem are low-level StyleX utilities for advanced cases where the component API is insufficient.',
  ],
  components: [
    {
      name: 'XDSHStack',
      description:
        'Horizontal stack for arranging items left-to-right. Supports polymorphic rendering.',
      props: [
        {
          name: 'gap',
          type: 'SpacingStep',
          description:
            'Numeric spacing step controlling the gap between items: 0, 0.5, 1, 1.5, 2, 3, 4, 5, 6, 8, 10.',
        },
        {
          name: 'vAlign',
          type: "'start' | 'center' | 'end' | 'stretch'",
          description: 'Vertical (cross-axis) alignment of items.',
          default: "'stretch'",
        },
        {
          name: 'wrap',
          type: "'nowrap' | 'wrap' | 'wrap-reverse'",
          description: 'Flex wrap behavior.',
          default: "'nowrap'",
        },
        {
          name: 'element',
          type: 'ElementType',
          description: 'HTML element to render as the stack container.',
          default: "'div'",
        },
        {
          name: 'children',
          type: 'ReactNode',
          description: 'Stack content.',
        },
        {
          name: 'xstyle',
          type: 'StyleXStyles',
          description:
            'StyleX styles for layout customization (margins, positioning, sizing). Must be a stylex.create() value — not an inline style object like style={{}}.',
        },
      ],
      examples: [
        {
          label: 'Basic horizontal stack',
          code: `<XDSHStack gap={2}>
  <Item />
  <Item />
</XDSHStack>`,
        },
        {
          label: 'With vertical alignment',
          code: `<XDSHStack gap={4} vAlign="center">
  <Item />
  <Item />
</XDSHStack>`,
        },
        {
          label: 'Polymorphic rendering',
          code: `<XDSHStack element="nav" gap={2}>
  <Link />
  <Link />
</XDSHStack>`,
        },
      ],
    },
    {
      name: 'XDSVStack',
      description:
        'Vertical stack for arranging items top-to-bottom. Supports polymorphic rendering.',
      props: [
        {
          name: 'gap',
          type: 'SpacingStep',
          description:
            'Numeric spacing step controlling the gap between items: 0, 0.5, 1, 1.5, 2, 3, 4, 5, 6, 8, 10.',
        },
        {
          name: 'hAlign',
          type: "'start' | 'center' | 'end' | 'stretch'",
          description: 'Horizontal (cross-axis) alignment of items.',
          default: "'stretch'",
        },
        {
          name: 'wrap',
          type: "'nowrap' | 'wrap' | 'wrap-reverse'",
          description: 'Flex wrap behavior.',
          default: "'nowrap'",
        },
        {
          name: 'element',
          type: 'ElementType',
          description: 'HTML element to render as the stack container.',
          default: "'div'",
        },
        {
          name: 'children',
          type: 'ReactNode',
          description: 'Stack content.',
        },
      ],
      examples: [
        {
          label: 'Basic vertical stack',
          code: `<XDSVStack gap={2}>
  <Item />
  <Item />
</XDSVStack>`,
        },
        {
          label: 'With horizontal alignment',
          code: `<XDSVStack gap={4} hAlign="center">
  <Item />
  <Item />
</XDSVStack>`,
        },
        {
          label: 'Polymorphic rendering',
          code: `<XDSVStack element="main" gap={4}>
  <Header />
  <Content />
</XDSVStack>`,
        },
      ],
    },
    {
      name: 'XDSStackItem',
      description:
        'Stack item for controlling individual item behavior within a stack. Supports polymorphic rendering.',
      props: [
        {
          name: 'size',
          type: "'static' | 'fill'",
          description:
            'Flex grow behavior: static keeps natural size, fill expands to consume remaining space.',
          default: "'static'",
        },
        {
          name: 'crossAlignSelf',
          type: "'start' | 'center' | 'end' | 'stretch'",
          description:
            'Override the cross-axis alignment for this individual item, ignoring the parent stack alignment.',
        },
        {
          name: 'element',
          type: 'ElementType',
          description: 'HTML element to render as the item wrapper.',
          default: "'div'",
        },
        {
          name: 'children',
          type: 'ReactNode',
          description: 'Item content.',
        },
      ],
      examples: [
        {
          label: 'Static and fill sizing',
          code: `<XDSHStack gap={2}>
  <XDSStackItem size="static">Logo</XDSStackItem>
  <XDSStackItem size="fill">Content</XDSStackItem>
  <XDSStackItem size="static">Actions</XDSStackItem>
</XDSHStack>`,
        },
        {
          label: 'Override alignment per item',
          code: `<XDSHStack vAlign="start">
  <XDSStackItem crossAlignSelf="center">Centered</XDSStackItem>
  <XDSStackItem>Top-aligned</XDSStackItem>
</XDSHStack>`,
        },
        {
          label: 'Polymorphic rendering',
          code: `<XDSStackItem element="section" size="fill">
  Section content
</XDSStackItem>`,
        },
      ],
    },
    {
      name: 'stack',
      description:
        'Low-level StyleX utility for creating flex containers with stack behavior. Use when the component API is insufficient.',
      props: [
        {
          name: 'direction',
          type: "'horizontal' | 'vertical'",
          description: 'Stack direction.',
          required: true,
        },
        {
          name: 'gap',
          type: 'SpacingStep',
          description:
            'Numeric spacing step controlling the gap between items: 0, 0.5, 1, 1.5, 2, 3, 4, 5, 6, 8, 10.',
        },
        {
          name: 'crossAlign',
          type: "'start' | 'center' | 'end' | 'stretch'",
          description: 'Cross-axis alignment of all items.',
        },
        {
          name: 'wrap',
          type: "'nowrap' | 'wrap' | 'wrap-reverse'",
          description: 'Flex wrap behavior.',
          default: "'nowrap'",
        },
      ],
      examples: [
        {
          label: 'StyleX horizontal container',
          code: `import {stack} from '@xds/core/Layout';
import * as stylex from '@stylexjs/stylex';

<div {...stylex.props(...stack({direction: 'horizontal', gap: 2}))}>
  <Child />
  <Child />
</div>`,
        },
      ],
    },
    {
      name: 'stackItem',
      description:
        'Low-level StyleX utility for controlling flex item behavior. Use when the component API is insufficient.',
      props: [
        {
          name: 'size',
          type: "'static' | 'fill'",
          description:
            'Flex grow behavior: static keeps natural size, fill expands to consume remaining space.',
          default: "'static'",
        },
        {
          name: 'crossAlignSelf',
          type: "'start' | 'center' | 'end' | 'stretch'",
          description:
            'Override the cross-axis alignment for this individual item.',
        },
      ],
      examples: [
        {
          label: 'StyleX fill item',
          code: `import {stackItem} from '@xds/core/Layout';
import * as stylex from '@stylexjs/stylex';

<div {...stylex.props(...stackItem({size: 'fill'}))}>Content</div>`,
        },
      ],
    },
  ],
};

/** @type {import('../docs-types').ComponentDoc} */
export const docsZh = {...docs};
