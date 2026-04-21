/** @type {import('../docs-types').ComponentDoc} */

export const docs = {
  name: 'HoverCard',
  keywords: ["hovercard","hover card","popover","tooltip","preview card","flyout","overlay","hover popup"],
  theming: {
    targets: [
      {className: 'xds-hovercard'},
    ],
    vars: [
      {name: '--_hovercard-radius', description: 'Border radius of the hover card', default: 'var(--radius-container)', private: true},
    ],
    derived: [
      {property: 'borderRadius', vars: ['--_hovercard-radius']},
    ],
  },
  components: [
    {
      name: 'XDSHoverCard',
      description:
        'Component wrapper for hover card display — a richer, larger overlay triggered on hover or focus.',      props: [
        {
          name: 'children',
          type: 'ReactNode',
          description: 'Trigger element that must accept a ref.',
        },
        {
          name: 'content',
          type: 'ReactNode',
          description: 'Hover card content.',
          required: true,
        },
        {
          name: 'placement',
          type: 'LayerPlacement',
          description: 'Position relative to the anchor element.',
          default: "'above'",
        },
        {
          name: 'alignment',
          type: 'LayerAlignment',
          description: 'Alignment along the placement axis.',
          default: "'center'",
        },
        {
          name: 'delay',
          type: 'number',
          description: 'Show delay in milliseconds.',
          default: '300',
        },
        {
          name: 'hideDelay',
          type: 'number',
          description: 'Hide delay in milliseconds.',
          default: '200',
        },
        {
          name: 'focusTrigger',
          type: "'auto' | 'always' | 'never'",
          description: 'Controls when focus events trigger the hover card.',
          default: "'auto'",
        },
        {
          name: 'isEnabled',
          type: 'boolean',
          description: 'Enables or disables the hover and focus triggers.',
          default: 'true',
        },
        {
          name: 'onOpenChange',
          type: '(isOpen: boolean) => void',
          description:
            'Callback fired when hover card visibility changes. Called with true when shown and false when hidden.',
        },
        {
          name: 'hasHoverIndication',
          type: "'auto' | boolean",
          description: 'Shows a dashed underline on the trigger element.',
          default: "'auto'",
        },
      ],
    },
    {
      name: 'useXDSHoverCard',
      description:
        'Hook for hover card behavior with hover/focus triggers. Builds on useXDSLayer.',
      props: [
        {
          name: 'placement',
          type: 'LayerPlacement',
          description: 'Position relative to the anchor element.',
          default: "'above'",
        },
        {
          name: 'alignment',
          type: 'LayerAlignment',
          description: 'Alignment along the placement axis.',
          default: "'center'",
        },
        {
          name: 'delay',
          type: 'number',
          description: 'Show delay in milliseconds.',
          default: '300',
        },
        {
          name: 'hideDelay',
          type: 'number',
          description: 'Hide delay in milliseconds.',
          default: '200',
        },
        {
          name: 'focusTrigger',
          type: "'auto' | 'always' | 'never'",
          description: 'Controls when focus events trigger the layer.',
          default: "'auto'",
        },
        {
          name: 'isEnabled',
          type: 'boolean',
          description: 'Enables or disables all hover and focus triggers.',
          default: 'true',
        },
        {
          name: 'onShow',
          type: '() => void',
          description: 'Callback fired when the hover card becomes visible.',
        },
        {
          name: 'onHide',
          type: '() => void',
          description: 'Callback fired when the hover card is hidden.',
        },
      ],
    },
  ],
  usage: {
    description: 'HoverCard shows additional information when the user hovers or focuses a trigger element. Use it for profile cards, link summaries, or inline definitions where the user needs more context without navigating away.',
    bestPractices: [
      { guidance: true, description: 'Keep content supplementary — hover cards should enhance understanding without blocking the primary workflow.' },
      { guidance: true, description: 'Provide a dashed underline on text triggers so users know the element is hoverable.' },
      { guidance: true, description: 'Use the hook API (useXDSHoverCard) when you need more control over timing or placement.' },
      { guidance: false, description: 'Place critical actions or required information inside a hover card — users may miss content that only appears on hover.' },
      { guidance: false, description: 'Use a hover card when a simple Tooltip or Popover would suffice.' },
      { guidance: false, description: 'Use a HoverCard for content the user must interact with — it disappears when the cursor leaves.' },
    ],
    anatomy: [
      {name: 'Trigger', required: true, description: 'The element that opens the hover card on hover or focus — a button, link, or inline text.'},
      {name: 'Card', required: true, description: 'The floating overlay with the preview content, anchored to the trigger.'},
      {name: 'Body', required: true, description: 'The main content area — profile info, link summary, or any rich content.'},
      {name: 'Actions', required: false, description: 'Optional buttons inside the card for follow-up actions like Follow or Message.'},
    ],
  },
};

/** @type {import('../docs-types').ComponentDoc} */
export const docsZh = {
  name: 'HoverCard',
  theming: {
    targets: [
      {className: 'xds-hovercard'},
    ],
    vars: [
      {name: '--_hovercard-radius', description: 'Border radius of the hover card', default: 'var(--radius-container)', private: true},
    ],
    derived: [
      {property: 'borderRadius', vars: ['--_hovercard-radius']},
    ],
  },
  components: [
    {
      name: 'XDSHoverCard',
      description:
        '悬浮卡片显示的组件包装器，在悬停或聚焦时触发更丰富、更大的浮层。',
      props: [
        {
          name: 'children',
          type: 'ReactNode',
          description: '必须接受 ref 的触发元素。',
        },
        {
          name: 'content',
          type: 'ReactNode',
          description: '悬浮卡片内容。',
          required: true,
        },
        {
          name: 'placement',
          type: 'LayerPlacement',
          description: '相对于锚点元素的位置。',
          default: "'above'",
        },
        {
          name: 'alignment',
          type: 'LayerAlignment',
          description: '沿放置轴的对齐方式。',
          default: "'center'",
        },
        {
          name: 'delay',
          type: 'number',
          description: '显示延迟（毫秒）。',
          default: '300',
        },
        {
          name: 'hideDelay',
          type: 'number',
          description: '隐藏延迟（毫秒）。',
          default: '200',
        },
        {
          name: 'focusTrigger',
          type: "'auto' | 'always' | 'never'",
          description: '控制焦点事件何时触发悬浮卡片。',
          default: "'auto'",
        },
        {
          name: 'isEnabled',
          type: 'boolean',
          description: '启用或禁用悬停和聚焦触发器。',
          default: 'true',
        },
        {
          name: 'onOpenChange',
          type: '(isOpen: boolean) => void',
          description:
            '悬浮卡片可见性变化时触发的回调。显示时传入 true，隐藏时传入 false。',
        },
        {
          name: 'hasHoverIndication',
          type: "'auto' | boolean",
          description: '在触发元素上显示虚线下划线。',
          default: "'auto'",
        },
      ],
    },
    {
      name: 'useXDSHoverCard',
      description:
        '具有悬停/聚焦触发行为的悬浮卡片 Hook，基于 useXDSLayer 构建。',
      props: [
        {
          name: 'placement',
          type: 'LayerPlacement',
          description: '相对于锚点元素的位置。',
          default: "'above'",
        },
        {
          name: 'alignment',
          type: 'LayerAlignment',
          description: '沿放置轴的对齐方式。',
          default: "'center'",
        },
        {
          name: 'delay',
          type: 'number',
          description: '显示延迟（毫秒）。',
          default: '300',
        },
        {
          name: 'hideDelay',
          type: 'number',
          description: '隐藏延迟（毫秒）。',
          default: '200',
        },
        {
          name: 'focusTrigger',
          type: "'auto' | 'always' | 'never'",
          description: '控制焦点事件何时触发浮层。',
          default: "'auto'",
        },
        {
          name: 'isEnabled',
          type: 'boolean',
          description: '启用或禁用所有悬停和聚焦触发器。',
          default: 'true',
        },
        {
          name: 'onShow',
          type: '() => void',
          description: '悬浮卡片显示时触发的回调。',
        },
        {
          name: 'onHide',
          type: '() => void',
          description: '悬浮卡片隐藏时触发的回调。',
        },
      ],
    },
  ],
  usage: {
    description: 'HoverCard shows additional information when the user hovers or focuses a trigger element. Use it for profile cards, link summaries, or inline definitions where the user needs more context without navigating away.',
    bestPractices: [
      { guidance: true, description: 'Keep content supplementary — hover cards should enhance understanding without blocking the primary workflow.' },
      { guidance: true, description: 'Provide a dashed underline on text triggers so users know the element is hoverable.' },
      { guidance: true, description: 'Use the hook API (useXDSHoverCard) when you need more control over timing or placement.' },
      { guidance: false, description: 'Place critical actions or required information inside a hover card — users may miss content that only appears on hover.' },
      { guidance: false, description: 'Use a hover card when a simple Tooltip or Popover would suffice.' },
      { guidance: false, description: 'Use a HoverCard for content the user must interact with — it disappears when the cursor leaves.' },
    ],
  },
};

/** @type {import('../docs-types').TranslationDoc} */
export const docsDense = {
  description:
    'Hover/focus triggered overlay for displaying rich, interactive content anchored to trigger element.',
  usage: {
    description: 'HoverCard shows additional info on hover/focus. Use for profile cards, link summaries, inline definitions.',
    bestPractices: [
      { guidance: true, description: 'Supplementary content only. Dashed underline on text triggers. Hook API for custom control.' },
      { guidance: false, description: 'No critical actions — content disappears on cursor leave. Use Tooltip/Popover when simpler.' },
    ],
  },
  components: [
    {
      name: 'XDSHoverCard',
      description: 'Component wrapper for hover card overlay; richer overlay triggered on hover/focus.',
      propDescriptions: {
        children: 'Trigger element; must accept ref.',
        content: 'Hover card content.',
        placement: 'Position relative to anchor element.',
        alignment: 'Alignment along placement axis.',
        delay: 'Show delay in ms.',
        hideDelay: 'Hide delay in ms.',
        focusTrigger: 'Controls when focus events trigger hover card.',
        isEnabled: 'Enable/disable hover + focus triggers.',
        onOpenChange: 'Callback when visibility changes; true=shown, false=hidden.',
        hasHoverIndication: 'Dashed underline on trigger element.',
      },
    },
    {
      name: 'useXDSHoverCard',
      description: 'Hook for hover card w/ hover/focus triggers. Builds on useXDSLayer.',
      propDescriptions: {
        placement: 'Position relative to anchor element.',
        alignment: 'Alignment along placement axis.',
        delay: 'Show delay in ms.',
        hideDelay: 'Hide delay in ms.',
        focusTrigger: 'Controls when focus events trigger layer.',
        isEnabled: 'Enable/disable all hover + focus triggers.',
        onShow: 'Callback when hover card becomes visible.',
        onHide: 'Callback when hover card hidden.',
      },
    },
  ],
};
