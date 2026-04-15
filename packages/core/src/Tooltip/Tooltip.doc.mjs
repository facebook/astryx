/** @type {import('../docs-types').ComponentDoc} */

export const docs = {
  name: 'Tooltip',
  description:
    'A hover/focus triggered tooltip for displaying short, non-interactive text anchored to a trigger element.',
  showcase: {
    aspectRatio: 1,
    code: '<XDSTooltip content="Help text"><button>Hover</button></XDSTooltip>',
  },
  keywords: ["tooltip","hint","infotip","title","hover","flyout","balloon","helpertext"],
  features: [
    'CSS Anchor Positioning for automatic placement relative to trigger elements',
    'Popover API for top-layer rendering — no React portals needed',
    'Hover triggers with configurable show and hide delays',
    'Focus triggers with auto-detection for focusable elements',
    'Inverted color palette (dark background, light text) for high contrast',
    'display:contents wrapper preserves children refs',
    'Hover indication (dashed underline) for text-only triggers',
    'Sibling mode via anchorRef for external trigger elements',
  ],
  notes: [
    'Unlike HoverCard, tooltips don\'t stay open when hovering the tooltip content.',
    'Tooltips have shorter delays and use inverted colors for high contrast.',
    'Tooltips are for short, non-interactive text. For interactive content, use XDSHoverCard or XDSPopover.',
    'In sibling mode (anchorRef prop), XDSTooltip attaches to an external ref rather than wrapping children.',
    'LayerPlacement values: above | below | start | end. LayerAlignment values: start | center | end.',
  ],
  accessibility: [
    'Links the tooltip content to the trigger via aria-describedby.',
    'When composing multiple aria-describedby sources, merge them with a utility.',
  ],
  keyboard:
    'Focus on the trigger shows the tooltip. Blur hides it.',  components: [
    {
      name: 'XDSTooltip',
      description:
        'Component wrapper for tooltip display triggered on hover or focus.',      props: [
        {
          name: 'children',
          type: 'ReactNode',
          description: 'Trigger element(s) that activate the tooltip.',
        },
        {
          name: 'anchorRef',
          type: 'RefObject<HTMLElement>',
          description: 'External anchor ref for sibling mode.',
        },
        {
          name: 'content',
          type: 'ReactNode',
          description: 'Tooltip content, typically short text.',
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
          default: '200',
        },
        {
          name: 'hideDelay',
          type: 'number',
          description: 'Hide delay in milliseconds.',
          default: '0',
        },
        {
          name: 'focusTrigger',
          type: "'auto' | 'always' | 'never'",
          description: 'Controls when focus events trigger the tooltip.',
          default: "'auto'",
        },
        {
          name: 'isEnabled',
          type: 'boolean',
          description: 'Enables or disables the tooltip triggers.',
          default: 'true',
        },
        {
          name: 'onOpenChange',
          type: '(isOpen: boolean) => void',
          description:
            'Callback fired when tooltip visibility changes. Called with true when shown and false when hidden.',
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
      name: 'useXDSTooltip',
      description:
        'Hook for tooltip behavior with hover/focus triggers. Builds on useXDSLayer.',
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
          default: '200',
        },
        {
          name: 'hideDelay',
          type: 'number',
          description: 'Hide delay in milliseconds.',
          default: '0',
        },
        {
          name: 'focusTrigger',
          type: "'auto' | 'always' | 'never'",
          description: 'Controls when focus events trigger the tooltip.',
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
          description: 'Callback fired when the tooltip becomes visible.',
        },
        {
          name: 'onHide',
          type: '() => void',
          description: 'Callback fired when the tooltip is hidden.',
        },
      ],
    },
  ],
  theming: {
    targets: [
      {className: 'xds-tooltip'},
    ],
  },
  usage: {
    summary: 'Non-interactive hints that provide additional information in the context of a specific UI element.',
    content: `## When to use

- Progressive disclosure of non-interactive content.
- Non-interruptive education.
- Show full text for truncated labels.

## When NOT to use

- For interactive content, use HoverCard instead.

## Best practices

- Limit tooltip content to approximately 140 characters.
- Place tooltip 8px from the context element.
- Supported placements: above, below, left, right.`,
  },
};

/** @type {import('../docs-types').ComponentDoc} */
export const docsZh = {
  name: 'Tooltip',
  description:
    '悬停/聚焦触发的工具提示，用于显示锚定在触发元素上的简短、非交互式文本。',
  features: [
    'CSS 锚点定位，自动相对于触发元素放置',
    'Popover API 实现顶层渲染 — 无需 React 传送门',
    '悬停触发，支持可配置的显示和隐藏延迟',
    '聚焦触发，自动检测可聚焦元素',
    '反转色调（深色背景、浅色文字）以实现高对比度',
    'display:contents 包装器保留子元素引用',
    '悬停指示（虚线下划线）用于纯文本触发器',
    '通过 anchorRef 的兄弟模式用于外部触发元素',
  ],
  notes: [
    '与 HoverCard 不同，悬停工具提示内容时工具提示不会保持打开状态。',
    '工具提示具有更短的延迟，并使用反转颜色以实现高对比度。',
    '工具提示用于简短的非交互式文本。对于交互式内容，请使用 XDSHoverCard 或 XDSPopover。',
    '在兄弟模式下（anchorRef 属性），XDSTooltip 附加到外部引用而不是包裹子元素。',
    'LayerPlacement 值：above | below | start | end。LayerAlignment 值：start | center | end。',
  ],
  accessibility: [
    '通过 aria-describedby 将工具提示内容链接到触发器。',
    '当组合多个 aria-describedby 来源时，使用工具函数合并它们。',
  ],
  keyboard:
    '聚焦触发器显示工具提示。失焦隐藏工具提示。',
  components: [
    {
      name: 'XDSTooltip',
      description:
        '工具提示显示的组件包装器，通过悬停或聚焦触发。',
      props: [
        {
          name: 'children',
          type: 'ReactNode',
          description: '激活工具提示的触发元素。',
        },
        {
          name: 'anchorRef',
          type: 'RefObject<HTMLElement>',
          description: '兄弟模式的外部锚点引用。',
        },
        {
          name: 'content',
          type: 'ReactNode',
          description: '工具提示内容，通常是简短文本。',
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
          default: '200',
        },
        {
          name: 'hideDelay',
          type: 'number',
          description: '隐藏延迟（毫秒）。',
          default: '0',
        },
        {
          name: 'focusTrigger',
          type: "'auto' | 'always' | 'never'",
          description: '控制聚焦事件何时触发工具提示。',
          default: "'auto'",
        },
        {
          name: 'isEnabled',
          type: 'boolean',
          description: '启用或禁用工具提示触发器。',
          default: 'true',
        },
        {
          name: 'onOpenChange',
          type: '(isOpen: boolean) => void',
          description:
            '工具提示可见性变化时触发的回调。显示时传入 true，隐藏时传入 false。',
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
      name: 'useXDSTooltip',
      description:
        '用于悬停/聚焦触发的工具提示行为的钩子。基于 useXDSLayer 构建。',
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
          default: '200',
        },
        {
          name: 'hideDelay',
          type: 'number',
          description: '隐藏延迟（毫秒）。',
          default: '0',
        },
        {
          name: 'focusTrigger',
          type: "'auto' | 'always' | 'never'",
          description: '控制聚焦事件何时触发工具提示。',
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
          description: '工具提示变为可见时触发的回调。',
        },
        {
          name: 'onHide',
          type: '() => void',
          description: '工具提示隐藏时触发的回调。',
        },
      ],
    },
  ],
  theming: {
    targets: [
      {className: 'xds-tooltip'},
    ],
  },
};

/** @type {import('../docs-types').TranslationDoc} */
export const docsDense = {
  description: 'Hover/focus triggered tooltip for displaying short, non-interactive text anchored to trigger element.',
  features: [
    'CSS Anchor Positioning for automatic placement relative to trigger',
    'Popover API for top-layer rendering; no React portals needed',
    'Hover triggers w/ configurable show+hide delays',
    'Focus triggers w/ auto-detection for focusable elements',
    'Inverted color palette (dark bg, light text) for high contrast',
    'display:contents wrapper preserves children refs',
    'Hover indication (dashed underline) for text-only triggers',
    'Sibling mode via anchorRef for external trigger elements',
  ],
  notes: [
    "Unlike HoverCard, tooltips don't stay open when hovering tooltip content.",
    'Shorter delays+inverted colors for high contrast.',
    'For interactive content use XDSHoverCard or XDSPopover.',
    'Sibling mode (anchorRef) attaches to external ref instead of wrapping children.',
    'LayerPlacement: above|below|start|end. LayerAlignment: start|center|end.',
  ],
  accessibility: [
    'Links tooltip content to trigger via aria-describedby.',
    'When composing multiple aria-describedby sources, merge w/ utility.',
  ],
  keyboard: 'Focus on trigger shows tooltip. Blur hides it.',
  components: [
    {
      name: 'XDSTooltip',
      description: 'Component wrapper for tooltip display on hover/focus.',
      propDescriptions: {
        children: 'Trigger element(s) that activate tooltip.',
        anchorRef: 'External anchor ref for sibling mode.',
        content: 'Tooltip content, typically short text.',
        placement: 'Position relative to anchor.',
        alignment: 'Alignment along placement axis.',
        delay: 'Show delay in ms.',
        hideDelay: 'Hide delay in ms.',
        focusTrigger: 'Controls when focus events trigger tooltip.',
        isEnabled: 'Enables/disables tooltip triggers.',
        onOpenChange: 'Callback when visibility changes; true=shown, false=hidden.',
        hasHoverIndication: 'Dashed underline on trigger element.',
      },
    },
    {
      name: 'useXDSTooltip',
      description: 'Hook for tooltip w/ hover/focus triggers. Builds on useXDSLayer.',
      propDescriptions: {
        placement: 'Position relative to anchor.',
        alignment: 'Alignment along placement axis.',
        delay: 'Show delay in ms.',
        hideDelay: 'Hide delay in ms.',
        focusTrigger: 'Controls when focus events trigger tooltip.',
        isEnabled: 'Enables/disables all hover+focus triggers.',
        onShow: 'Fired when tooltip becomes visible.',
        onHide: 'Fired when tooltip hidden.',
      },
    },
  ],
};
