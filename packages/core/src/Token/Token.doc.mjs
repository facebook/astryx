/** @type {import('../docs-types').ComponentDoc} */

export const docs = {
  name: 'Token',
  keywords: ["token","chip","tag","pill","label","removable","dismissible","filter chip","closable"],
  props: [
    {
      name: 'label',
      type: 'string',
      description: 'Text label displayed inside the token.',
      required: true,
    },
    {
      name: 'size',
      type: "'sm' | 'md'",
      description: 'The size of the token.',
      default: "'md'",
    },
    {
      name: 'color',
      type: "'default' | 'red' | 'orange' | 'yellow' | 'green' | 'teal' | 'cyan' | 'blue' | 'purple' | 'pink' | 'gray'",
      description: 'Color variant of the token.',
      default: "'default'",
    },
    {
      name: 'icon',
      type: 'ReactNode',
      description: 'Optional icon rendered before the label.',
    },
    {
      name: 'isDisabled',
      type: 'boolean',
      description:
        'Whether the token is disabled; reduces opacity and blocks interactions.',
      default: 'false',
    },
    {
      name: 'onRemove',
      type: '(e: React.MouseEvent) => void',
      description:
        'Callback fired when the remove button is clicked. When provided, an X button is rendered inside the token.',
    },
    {
      name: 'onClick',
      type: '(e: React.MouseEvent) => void',
      description:
        'Click handler. When provided, the token renders as a <span> container with an invisible <button> inside for accessibility.',
    },
    {
      name: 'href',
      type: 'string',
      description:
        'Link URL. When provided, the token renders as an <a> element.',
    },
    {
      name: 'description',
      type: 'string',
      description:
        'Accessible description applied via aria-description on the root element.',
    },
    {
      name: 'endContent',
      type: 'ReactNode',
      description:
        'Content rendered after the label and before the remove button.',
    },
    {
      name: 'isLabelHidden',
      type: 'boolean',
      description:
        'Visually hides the label using a screen-reader-only clip technique; the label remains accessible.',
      default: 'false',
    },
    {
      name: 'xstyle',
      type: 'StyleXStyles',
      description:
        'StyleX styles for layout customization (margins, positioning, sizing). Must be a stylex.create() value — not an inline style object like style={{}}.',
    },
  ],  theming: {
    targets: [
      {className: 'xds-token', visualProps: ['color', 'size']},
    ],
  },
  usage: {
    description:
      'Token is a compact chip component for displaying entities like tags, names, or status indicators inline within content. Use a Token to represent metadata, categorization, or removable selections. For static status indicators without interaction, use Badge instead.',
    bestPractices: [
      {guidance: true, description: 'Use color variants to distinguish different categories or entity types at a glance.'},
      {guidance: true, description: 'Provide an onRemove callback when users need the ability to dismiss or deselect a token.'},
      {guidance: false, description: 'Avoid using tokens for primary actions or navigation — use Button or Link instead.'},
      {guidance: false, description: 'Avoid hiding the label unless an icon provides sufficient visual meaning on its own.'},
    ],
    anatomy: [
      {name: 'Color', required: false, description: 'Background color indicator.'},
      {name: 'Label', required: true, description: 'Text label for the token.'},
      {name: 'Icon', required: false, description: '16px icon displayed in the token.'},
      {name: 'Remove button', required: false, description: 'Shown when onRemove is provided.'},
      {name: 'Description', required: false, description: 'Additional descriptive text.'},
    ],
  },
};

/** @type {import('../docs-types').ComponentDoc} */
export const docsZh = {
  name: 'Token',
  props: [
    {
      name: 'label',
      type: 'string',
      description: '显示在标记内部的文本标签。',
      required: true,
    },
    {
      name: 'size',
      type: "'sm' | 'md'",
      description: '标记的大小。',
      default: "'md'",
    },
    {
      name: 'color',
      type: "'default' | 'red' | 'orange' | 'yellow' | 'green' | 'teal' | 'cyan' | 'blue' | 'purple' | 'pink' | 'gray'",
      description: '标记的颜色变体。',
      default: "'default'",
    },
    {
      name: 'icon',
      type: 'ReactNode',
      description: '在标签前渲染的可选图标。',
    },
    {
      name: 'isDisabled',
      type: 'boolean',
      description:
        '标记是否被禁用；降低透明度并阻止交互。',
      default: 'false',
    },
    {
      name: 'onRemove',
      type: '(e: React.MouseEvent) => void',
      description:
        '点击移除按钮时触发的回调。提供时，标记内会渲染一个 X 按钮。',
    },
    {
      name: 'onClick',
      type: '(e: React.MouseEvent) => void',
      description:
        '点击处理函数。提供时，标记渲染为 <span> 容器，内部包含不可见的 <button> 以确保可访问性。',
    },
    {
      name: 'href',
      type: 'string',
      description:
        '链接 URL。提供时，标记渲染为 <a> 元素。',
    },
    {
      name: 'description',
      type: 'string',
      description:
        '通过 aria-description 应用于根元素的无障碍描述。',
    },
    {
      name: 'endContent',
      type: 'ReactNode',
      description:
        '在标签之后、移除按钮之前渲染的内容。',
    },
    {
      name: 'isLabelHidden',
      type: 'boolean',
      description:
        '使用仅屏幕阅读器可见的裁剪技术视觉隐藏标签；标签仍然保持可访问性。',
      default: 'false',
    },
    {
      name: 'xstyle',
      type: 'StyleXStyles',
      description:
        '用于布局自定义的 StyleX 样式（外边距、定位、尺寸）。必须是 stylex.create() 的值 — 不能是内联样式对象如 style={{}}。',
    },
  ],
  theming: {
    targets: [
      {className: 'xds-token', visualProps: ['color', 'size']},
    ],
  },
  usage: {
    description:
      'Token is a compact chip component for displaying entities like tags, names, or status indicators inline within content. Use a Token to represent metadata, categorization, or removable selections. For static status indicators without interaction, use Badge instead.',
    bestPractices: [
      {guidance: true, description: 'Use color variants to distinguish different categories or entity types at a glance.'},
      {guidance: true, description: 'Provide an onRemove callback when users need the ability to dismiss or deselect a token.'},
      {guidance: false, description: 'Avoid using tokens for primary actions or navigation — use Button or Link instead.'},
      {guidance: false, description: 'Avoid hiding the label unless an icon provides sufficient visual meaning on its own.'},
    ],
    anatomy: [
      {name: 'Color', required: false, description: 'Background color indicator.'},
      {name: 'Label', required: true, description: 'Text label for the token.'},
      {name: 'Icon', required: false, description: '16px icon displayed in the token.'},
      {name: 'Remove button', required: false, description: 'Shown when onRemove is provided.'},
      {name: 'Description', required: false, description: 'Additional descriptive text.'},
    ],
  },
};

/** @type {import('../docs-types').TranslationDoc} */
export const docsDense = {
  description: 'Chip/tag for displaying entities inline. Renders as <span> default, <a> w/ href, or <span> w/ invisible <button> when onClick provided.',
  usage: {
    description:
      'Token is a compact chip component for displaying entities like tags, names, or status indicators inline within content. Use a Token to represent metadata, categorization, or removable selections. For static status indicators without interaction, use Badge instead.',
    bestPractices: [
      {guidance: true, description: 'Use color variants to distinguish different categories or entity types at a glance.'},
      {guidance: true, description: 'Provide an onRemove callback when users need the ability to dismiss or deselect a token.'},
      {guidance: false, description: 'Avoid using tokens for primary actions or navigation — use Button or Link instead.'},
      {guidance: false, description: 'Avoid hiding the label unless an icon provides sufficient visual meaning on its own.'},
    ],
    anatomy: [
      {name: 'Color', required: false, description: 'Background color indicator.'},
      {name: 'Label', required: true, description: 'Text label for the token.'},
      {name: 'Icon', required: false, description: '16px icon displayed in the token.'},
      {name: 'Remove button', required: false, description: 'Shown when onRemove is provided.'},
      {name: 'Description', required: false, description: 'Additional descriptive text.'},
    ],
  },
  propDescriptions: {
    label: 'Text label inside token.',
    size: "Token size; 'sm' or 'md'.",
    color: 'Color variant of token.',
    icon: 'Optional icon before label.',
    isDisabled: 'Reduces opacity, blocks interactions.',
    onRemove: 'Fired on remove button click. Renders X button when provided.',
    onClick: 'Click handler. Renders <span> w/ invisible <button> inside for a11y.',
    href: 'Link URL. Renders as <a> element.',
    description: 'A11y description via aria-description on root.',
    endContent: 'Content after label, before remove button.',
    isLabelHidden: 'Visually hides label w/ screen-reader-only clip; stays accessible.',
    xstyle: 'StyleX layout styles (margins, positioning). Must be stylex.create() value.',
  },
};
