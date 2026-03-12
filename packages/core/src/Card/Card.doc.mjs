/** @type {import('../docs-types').ComponentDoc} */

export const docs = {
  name: 'Card',
  description: 'Card container component with elevation and themed styling.',
  features: [
    'Top-level container for elevated content',
    'Provides card-specific appearance: background, shadow, and border-radius',
    'Sets CSS variables for child layout components',
    'Supports optional full-bleed mode to remove internal padding for edge-to-edge content',
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
  },
};

/** @type {import('../docs-types').ComponentDoc} */
export const docsZh = {
  name: 'Card',
  description: '带有阴影层级和主题样式的卡片容器组件。',
  features: [
    '用于提升内容层级的顶层容器',
    '提供卡片特有的外观效果：背景、阴影和圆角',
    '为子布局组件设置 CSS 变量',
    '支持可选的全出血模式，移除内边距以实现边到边的内容展示',
    '可与 XDSLayout、XDSCollapsible 和 XDSCollapsibleGroup 组合使用',
  ],
  props: [
    {
      name: 'width',
      type: 'SizeValue',
      description: '卡片的宽度（数字 = 像素，字符串 = 按原值使用）。',
    },
    {
      name: 'height',
      type: 'SizeValue',
      description: '卡片的高度（数字 = 像素, 字符串 = 按原值使用）。',
    },
    {
      name: 'maxWidth',
      type: 'SizeValue',
      description: '卡片的最大宽度。',
    },
    {
      name: 'minHeight',
      type: 'SizeValue',
      description: '卡片的最小高度。',
    },
    {
      name: 'children',
      type: 'ReactNode',
      description: '在卡片内部渲染的内容。',
    },
    {
      name: 'padding',
      type: '0 | 0.5 | 1 | 1.5 | 2 | 3 | 4 | 5 | 6 | 8 | 10',
      description: '使用间距比例尺的内边距。',
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
      label: '可折叠卦牷'