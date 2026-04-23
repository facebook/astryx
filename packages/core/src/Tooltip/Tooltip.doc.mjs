/** @type {import('../docs-types').ComponentDoc} */

export const docs = {
  name: 'Tooltip',
  keywords: ["tooltip","hint","infotip","title","hover","flyout","balloon","helpertext"],
  components: [
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
        {
          name: 'isDefaultOpen',
          type: 'boolean',
          description: 'Whether the tooltip should be shown on mount. Still dismissible.',
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
          name: 'isDefaultOpen',
          type: 'boolean',
          description: 'Whether the tooltip should be shown on mount. Still dismissible.',
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
    description:
      'A short text hint that appears on hover or focus, anchored to a trigger element. Use it to describe icon-only buttons, show the full text of truncated labels, or provide supplementary context without cluttering the UI.',
    bestPractices: [
      {guidance: true, description: 'Keep tooltip content concise — aim for under 140 characters of plain text.'},
      {guidance: true, description: 'Add a tooltip to icon-only buttons and controls that lack a visible label.'},
      {guidance: false, description: 'Place interactive elements like links or buttons inside a tooltip — use HoverCard or Popover instead.'},
      {guidance: false, description: 'Use tooltips for essential information that users must see to complete a task.'},
    ],
  },
};

/** @type {import('../docs-types').ComponentDoc} */
export const docsZh = {
  name: 'Tooltip',
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
        {
          name: 'isDefaultOpen',
          type: 'boolean',
          description: '是否在挂载时显示工具提示。仍然可以关闭。',
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
          name: 'isDefaultOpen',
          type: 'boolean',
          description: '是否在挂载时显示工具提示。仍然可以关闭。',
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
  usage: {
    description:
      'A short text hint that appears on hover or focus, anchored to a trigger element. Use it to describe icon-only buttons, show the full text of truncated labels, or provide supplementary context without cluttering the UI.',
    bestPractices: [
      {guidance: true, description: 'Keep tooltip content concise — aim for under 140 characters of plain text.'},
      {guidance: true, description: 'Add a tooltip to icon-only buttons and controls that lack a visible label.'},
      {guidance: false, description: 'Place interactive elements like links or buttons inside a tooltip — use HoverCard or Popover instead.'},
      {guidance: false, description: 'Use tooltips for essential information that users must see to complete a task.'},
    ],
  },
};

/** @type {import('../docs-types').TranslationDoc} */
export const docsDense = {
  description: 'Hover/focus triggered tooltip for displaying short, non-interactive text anchored to trigger element.',
  usage: {
    description:
      'A short text hint that appears on hover or focus, anchored to a trigger element. Use it to describe icon-only buttons, show the full text of truncated labels, or provide supplementary context without cluttering the UI.',
    bestPractices: [
      {guidance: true, description: 'Keep tooltip content concise — aim for under 140 characters of plain text.'},
      {guidance: true, description: 'Add a tooltip to icon-only buttons and controls that lack a visible label.'},
      {guidance: false, description: 'Place interactive elements like links or buttons inside a tooltip — use HoverCard or Popover instead.'},
      {guidance: false, description: 'Use tooltips for essential information that users must see to complete a task.'},
    ],
  },
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
        isDefaultOpen: 'Show tooltip on mount. Still dismissible.',
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
        isDefaultOpen: 'Show tooltip on mount. Still dismissible.',
        onShow: 'Fired when tooltip becomes visible.',
        onHide: 'Fired when tooltip hidden.',
      },
    },
  ],
};
