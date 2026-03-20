/** @type {import('../docs-types').ComponentDoc} */

export const docs = {
  name: 'Card',
  description: 'Card container component with shadow and themed styling.',
  features: [
    'Top-level container for elevated content',
    'Provides card-specific appearance: background, shadow, and border-radius',
    'Sets CSS variables for child layout components',
    'Supports `padding={0}` for edge-to-edge content',
    'Composable with XDSLayout, XDSCollapsible, and XDSCollapsibleGroup',
  ],
  props: [
    {
      name: 'width',
      type: 'SizeValue',
      description: 'Width of the card (number = pixels, string = used as-is).',
    },
    {
      name: 'height',
      type: 'SizeValue',
      description: 'Height of the card (number = pixels, string = used as-is).',
    },
    {
      name: 'maxWidth',
      type: 'SizeValue',
      description: 'Maximum width of the card.',
    },
    {
      name: 'minHeight',
      type: 'SizeValue',
      description: 'Minimum height of the card.',
    },
    {
      name: 'children',
      type: 'ReactNode',
      description: 'Content to render inside the card.',
    },
    {
      name: 'padding',
      type: '0 | 0.5 | 1 | 1.5 | 2 | 3 | 4 | 5 | 6 | 8 | 10',
      description: 'Internal padding using the spacing scale.',
      default: '4',
    },
  ],
  examples: [
    {
      label: 'Basic card with layout',
      code: `<XDSCard width={400} height={300}>
  <XDSLayout
    header={<XDSLayoutHeader hasDivider>Title</XDSLayoutHeader>}
    content={<XDSLayoutContent>Content</XDSLayoutContent>}
    footer={<XDSLayoutFooter hasDivider>Actions</XDSLayoutFooter>}
  />
</XDSCard>`,
    },
    {
      label: 'Simple content',
      code: `<XDSCard>
  <p>Card content with default padding</p>
</XDSCard>`,
    },
    {
      label: 'Collapsible card',
      code: `<XDSCard>
  <XDSCollapsible trigger="Details">
    <p>This content can be collapsed</p>
  </XDSCollapsible>
</XDSCard>`,
    },
    {
      label: 'Accordion of cards',
      code: `<XDSCollapsibleGroup type="single" defaultValue="general">
  <XDSVStack gap={2}>
    <XDSCard>
      <XDSCollapsible trigger="General" value="general">
        <GeneralSettings />
      </XDSCollapsible>
    </XDSCard>
    <XDSCard>
      <XDSCollapsible trigger="Advanced" value="advanced">
        <AdvancedSettings />
      </XDSCollapsible>
    </XDSCard>
  </XDSVStack>
</XDSCollapsibleGroup>`,
    },
  ],
  theming: {
    targets: [
      {className: 'xds-card'},
    ],
    vars: [
      {name: '--card-radius', description: 'Border radius of the card', default: 'var(--radius-3)'},
    ],
  },
};

/** @type {import('../docs-types').ComponentDoc} */
export const docsZh = {
  name: 'Card',
  description: '具有阴影和主题样式的卡片容器组件。',
  features: [
    '用于承载内容的顶层容器',
    '提供卡片特有的外观：背景、阴影和圆角',
    '为子布局组件设置 CSS 变量',
    '支持 `padding={0}` 实现边到边内容',
    '可与 XDSLayout、XDSCollapsible 和 XDSCollapsibleGroup 组合使用',
  ],
  props: [
    {
      name: 'width',
      type: 'SizeValue',
      description: '卡片宽度（数字 = 像素，字符串 = 按原样使用）。',
    },
    {
      name: 'height',
      type: 'SizeValue',
      description: '卡片高度（数字 = 像素，字符串 = 按原样使用）。',
    },
    {
      name: 'maxWidth',
      type: 'SizeValue',
      description: '卡片最大宽度。',
    },
    {
      name: 'minHeight',
      type: 'SizeValue',
      description: '卡片最小高度。',
    },
    {
      name: 'children',
      type: 'ReactNode',
      description: '在卡片内部渲染的内容。',
    },
    {
      name: 'padding',
      type: '0 | 0.5 | 1 | 1.5 | 2 | 3 | 4 | 5 | 6 | 8 | 10',
      description: '使用间距比例的内边距。',
      default: '4',
    },
  ],
  examples: [
    {
      label: '带布局的基本卡片',
      code: `<XDSCard width={400} height={300}>
  <XDSLayout
    header={<XDSLayoutHeader hasDivider>Title</XDSLayoutHeader>}
    content={<XDSLayoutContent>Content</XDSLayoutContent>}
    footer={<XDSLayoutFooter hasDivider>Actions</XDSLayoutFooter>}
  />
</XDSCard>`,
    },
    {
      label: '简单内容',
      code: `<XDSCard>
  <p>Card content with default padding</p>
</XDSCard>`,
    },
    {
      label: '可折叠卡片',
      code: `<XDSCard>
  <XDSCollapsible trigger="Details">
    <p>This content can be collapsed</p>
  </XDSCollapsible>
</XDSCard>`,
    },
    {
      label: '手风琴卡片',
      code: `<XDSCollapsibleGroup type="single" defaultValue="general">
  <XDSVStack gap={2}>
    <XDSCard>
      <XDSCollapsible trigger="General" value="general">
        <GeneralSettings />
      </XDSCollapsible>
    </XDSCard>
    <XDSCard>
      <XDSCollapsible trigger="Advanced" value="advanced">
        <AdvancedSettings />
      </XDSCollapsible>
    </XDSCard>
  </XDSVStack>
</XDSCollapsibleGroup>`,
    },
  ],
  theming: {
    targets: [
      {className: 'xds-card'},
    ],
    vars: [
      {name: '--card-radius', description: 'Border radius of the card', default: 'var(--radius-3)'},
    ],
  },
};

/** @type {import('../docs-types').TranslationDoc} */
export const docsDense = {
  description: 'elevated container w/ themed styling',
  features: [
    'top-level container for elevated content',
    'card appearance: background, shadow, border-radius',
    'sets CSS vars for child layout components',
    'optional full-bleed mode removes padding for edge-to-edge content',
    'composable w/ XDSLayout, XDSCollapsible, XDSCollapsibleGroup',
  ],
  propDescriptions: {
    width: 'card width (number=px, string=as-is)',
    height: 'card height (number=px, string=as-is)',
    maxWidth: 'max card width',
    minHeight: 'min card height',
    children: 'content inside card',
    padding: 'internal padding via spacing scale',
  },
};
