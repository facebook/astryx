/** @type {import('../docs-types').ComponentDoc} */

export const docs = {
  name: 'Token',
  description:
    'A chip/tag component for displaying entities inline. Renders as a <span> by default, <a> when href is provided, or a <span> with an invisible <button> inside when onClick is provided.',
  showcase: {
    aspectRatio: 1,
    code: '<XDSToken label="Tag" />',
  },
  keywords: ["token","chip","tag","pill","label","removable","dismissible","filter chip","closable"],
  features: [
    'Polymorphic — renders as <span>, <a>, or interactive <span>+<button> based on props',
    'Invisible button pattern for onClick preserves real button semantics while allowing focus-within outline on the full token',
    'Remove button with expanded 14px hit-area tap target via ::after pseudo-element',
    'Eleven color variants including a neutral default',
    'Leading icon and trailing endContent slots',
    'Label can be visually hidden while remaining accessible to screen readers',
    'Disabled state reduces opacity and blocks pointer events',
  ],
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
  accessibility: [
    'When isLabelHidden is true, the label is clipped visually but exposed via aria-label on the root element so screen readers still announce it.',
    'The description prop maps to aria-description on the root element for supplementary context.',
    'When onClick is provided, the clickable content is wrapped in a real <button> so keyboard users can activate it with Enter or Space.',
    'The remove button has an automatic aria-label of "Remove <label>" and an expanded touch target via a ::after pseudo-element.',
    'When href is provided, aria-disabled is set on the <a> element when isDisabled is true.',
  ],
  keyboard:
    'Tab focuses the token (or its inner button when onClick is used). Enter/Space activate a clickable token or the remove button. Remove button is reachable as a separate Tab stop.',
  usage: {
    summary: 'Displays entities inline for tags or names.',
    content: `## When to use

- Concise metadata display.
- Icon with colored background indicator.
- Combined icon, text, and number representation.

## When NOT to use

- Static indicators without interaction \u2014 use Badge instead (Badge is 20px, Token is 28px).`,
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
  description:
    '用于内联显示实体的标签/标记组件。默认渲染为 <span>，提供 href 时渲染为 <a>，提供 onClick 时渲染为包含不可见 <button> 的 <span>。',
  features: [
    '多态渲染 — 根据属性渲染为 <span>、<a> 或交互式 <span>+<button>',
    '不可见按钮模式用于 onClick，保留真实按钮语义，同时允许 focus-within 轮廓显示在整个标记上',
    '移除按钮通过 ::after 伪元素扩展了 14px 的点击目标区域',
    '十一种颜色变体，包括中性默认色',
    '前置图标和尾部 endContent 插槽',
    '标签可以视觉隐藏，同时保持对屏幕阅读器的可访问性',
    '禁用状态降低透明度并阻止指针事件',
  ],
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
  accessibility: [
    '当 isLabelHidden 为 true 时，标签在视觉上被裁剪，但通过根元素上的 aria-label 暴露给屏幕阅读器，使其仍然可以播报。',
    'description 属性映射到根元素上的 aria-description，用于提供补充上下文。',
    '当提供 onClick 时，可点击内容被包裹在真实的 <button> 中，使键盘用户可以通过 Enter 或 Space 激活。',
    '移除按钮自动具有 "Remove <label>" 的 aria-label，并通过 ::after 伪元素扩展触摸目标。',
    '当提供 href 时，如果 isDisabled 为 true，则在 <a> 元素上设置 aria-disabled。',
  ],
  keyboard:
    'Tab 聚焦标记（或使用 onClick 时聚焦其内部按钮）。Enter/Space 激活可点击标记或移除按钮。移除按钮作为单独的 Tab 停靠点可达。',
};

/** @type {import('../docs-types').TranslationDoc} */
export const docsDense = {
  description: 'Chip/tag for displaying entities inline. Renders as <span> default, <a> w/ href, or <span> w/ invisible <button> when onClick provided.',
  features: [
    'Polymorphic; renders as <span>, <a>, or interactive <span>+<button> based on props',
    'Invisible button pattern for onClick preserves real button semantics w/ focus-within outline on full token',
    'Remove button w/ expanded 14px hit-area tap target via ::after pseudo-element',
    'Eleven color variants including neutral default',
    'Leading icon+trailing endContent slots',
    'Label can be visually hidden; remains accessible to screen readers',
    'Disabled state reduces opacity, blocks pointer events',
  ],
  accessibility: [
    'isLabelHidden clips label visually but exposes via aria-label so screen readers announce it.',
    'description maps to aria-description for supplementary context.',
    'onClick wraps content in real <button> so keyboard users activate w/ Enter/Space.',
    'Remove button has auto aria-label "Remove <label>"+expanded touch target via ::after pseudo-element.',
    'href w/ isDisabled sets aria-disabled on <a>.',
  ],
  keyboard: 'Tab focuses token (or inner button w/ onClick). Enter/Space activate clickable token or remove button. Remove button is separate Tab stop.',
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
