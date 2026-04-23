/** @type {import('../docs-types').ComponentDoc} */

export const docs = {
  name: 'Layer',
  group: 'Utility',
  keywords: ["layer","overlay","popover","positioning","anchor","floating","dropdown","popper","popup","portal"],
  components: [
    {
      name: 'useXDSLayer',
      description:
        'Core layer hook with type-safe modes for different positioning strategies (context mode for anchor positioning, fixed mode for manual coordinates).',
      props: [
        {
          name: 'mode',
          type: "'context' | 'fixed'",
          description:
            'Positioning strategy: context uses CSS anchor positioning relative to a trigger ref; fixed uses explicit x/y coordinates.',
          required: true,
        },
        {
          name: 'onShow',
          type: '() => void',
          description: 'Callback fired when the layer becomes visible.',
        },
        {
          name: 'onHide',
          type: '() => void',
          description: 'Callback fired when the layer is hidden.',
        },
        {
          name: 'xstyle',
          type: 'StyleXStyles',
          description:
            'StyleX styles for layout customization.',
        },
      ],    },
  ],
  usage: {
    description:
      'Layer is a core positioning hook for rendering overlay content using CSS Anchor Positioning and the Popover API. Use it as the foundation for building popovers, hover cards, and tooltips without React portals.',
    bestPractices: [
      { guidance: true, description: 'Use context mode for anchor-positioned overlays relative to a trigger element, and fixed mode for manually positioned overlays at specific coordinates.' },
      { guidance: true, description: 'Build on higher-level components like Popover, HoverCard, and Tooltip instead of using Layer directly for common overlay patterns.' },
      { guidance: false, description: 'Implement ARIA patterns directly in a Layer — leave accessibility semantics to the higher-level components that build on it.' },
    ],
  },
};

/** @type {import('../docs-types').ComponentDoc} */
export const docsZh = {
  name: 'Layer',
  components: [
    {
      name: 'useXDSLayer',
      description:
        '核心层 Hook，提供类型安全的模式以支持不同定位策略（上下文模式用于锚点定位，固定模式用于手动坐标）。',
      props: [
        {
          name: 'mode',
          type: "'context' | 'fixed'",
          description:
            '定位策略：context 使用 CSS 锚点定位相对于触发 ref 定位；fixed 使用显式 x/y 坐标。',
          required: true,
        },
        {
          name: 'onShow',
          type: '() => void',
          description: '当层变为可见时触发的回调。',
        },
        {
          name: 'onHide',
          type: '() => void',
          description: '当层被隐藏时触发的回调。',
        },
        {
          name: 'xstyle',
          type: 'StyleXStyles',
          description:
            '用于布局自定义的 StyleX 样式。',
        },
      ],
    },
  ],
  usage: {
    description:
      'Layer is a core positioning hook for rendering overlay content using CSS Anchor Positioning and the Popover API. Use it as the foundation for building popovers, hover cards, and tooltips without React portals.',
    bestPractices: [
      { guidance: true, description: 'Use context mode for anchor-positioned overlays relative to a trigger element, and fixed mode for manually positioned overlays at specific coordinates.' },
      { guidance: true, description: 'Build on higher-level components like Popover, HoverCard, and Tooltip instead of using Layer directly for common overlay patterns.' },
      { guidance: false, description: 'Implement ARIA patterns directly in a Layer — leave accessibility semantics to the higher-level components that build on it.' },
    ],
  },
};

/** @type {import('../docs-types').TranslationDoc} */
export const docsDense = {
  description:
    'Core hook for overlay positioning using CSS Anchor Positioning + Popover API; no React portals needed. Popover, HoverCard, Tooltip build on this.',
  usage: {
    description:
      'Layer is a core positioning hook for rendering overlay content using CSS Anchor Positioning and the Popover API. Use it as the foundation for building popovers, hover cards, and tooltips without React portals.',
    bestPractices: [
      { guidance: true, description: 'Use context mode for anchor-positioned overlays relative to a trigger element, and fixed mode for manually positioned overlays at specific coordinates.' },
      { guidance: true, description: 'Build on higher-level components like Popover, HoverCard, and Tooltip instead of using Layer directly for common overlay patterns.' },
      { guidance: false, description: 'Implement ARIA patterns directly in a Layer — leave accessibility semantics to the higher-level components that build on it.' },
    ],
  },
  components: [
    {
      name: 'useXDSLayer',
      description: 'Core layer hook w/ type-safe modes for positioning (context=anchor, fixed=coordinates).',
      propDescriptions: {
        mode: 'Positioning strategy: context uses CSS anchor positioning relative to trigger ref; fixed uses explicit x/y coordinates.',
        onShow: 'Callback when layer becomes visible.',
        onHide: 'Callback when layer hidden.',
        xstyle: 'StyleX styles for layout customization.',
      },
    },
  ],
};
