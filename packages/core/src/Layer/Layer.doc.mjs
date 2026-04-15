/** @type {import('../docs-types').ComponentDoc} */

export const docs = {
  name: 'Layer',
  description:
    'Core hook for overlay positioning using CSS Anchor Positioning and the Popover API — no React portals needed. Popover, HoverCard, and Tooltip build on this foundation and live in their own directories.',
  showcase: {
    aspectRatio: 1,
    code: '<XDSLayer>Layer content</XDSLayer>',
  },
  keywords: ["layer","overlay","popover","positioning","anchor","floating","dropdown","popper","popup","portal"],
  features: [
    'CSS Anchor Positioning for automatic placement relative to trigger elements',
    'Popover API for top-layer rendering — no React portals needed',
    'Type-safe mode system: context mode (anchor positioning) and fixed mode (manual coordinates)',
    'TypeScript enforces correct render props per mode at compile time',
    'Graceful degradation in Firefox: Popover API works, anchor positioning degrades acceptably',
    'Full support in Chrome and Safari',
  ],
  notes: [
    'CSS Anchor Positioning is fully supported in Chrome and Safari. Firefox supports the Popover API but not anchor positioning — this is an acceptable degradation.',
    'useXDSLayer context mode: pass a ref to the trigger element, then call render(children, { placement?, alignment? }). Fixed mode: call show() to display, then render(children, { x, y }) with required coordinates.',
    'LayerPlacement values: above | below | start | end. LayerAlignment values: start | center | end.',
    'For click-triggered popovers, use XDSPopover (in @xds/core/Popover). For hover overlays, use XDSHoverCard (in @xds/core/HoverCard). For tooltips, use XDSTooltip (in @xds/core/Tooltip).',
  ],
  accessibility: [
    'The Layer hook provides the positioning and visibility foundation. ARIA patterns are implemented by the higher-level components (XDSPopover, XDSHoverCard, XDSTooltip).',
  ],
  keyboard:
    'Escape closes any open layer.',
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
    summary: 'Core hook for overlay positioning using CSS Anchor Positioning and the Popover API.',
  },
};

/** @type {import('../docs-types').ComponentDoc} */
export const docsZh = {
  name: 'Layer',
  description:
    '使用 CSS 锚点定位和 Popover API 实现覆盖层定位的核心 Hook，无需 React Portal。Popover、HoverCard 和 Tooltip 基于此构建，各自位于独立目录中。',
  features: [
    'CSS 锚点定位：自动相对于触发元素进行放置',
    'Popover API 实现顶层渲染，无需 React Portal',
    '类型安全的模式系统：上下文模式（锚点定位）和固定模式（手动坐标）',
    'TypeScript 在编译时为每种模式强制执行正确的渲染属性',
    'Firefox 中优雅降级：Popover API 可用，锚点定位可接受地降级',
    '完全支持 Chrome 和 Safari',
  ],
  notes: [
    'CSS 锚点定位在 Chrome 和 Safari 中完全支持。Firefox 支持 Popover API 但不支持锚点定位，这是一种可接受的降级。',
    'useXDSLayer 上下文模式：将 ref 传递给触发元素，然后调用 render(children, { placement?, alignment? })。固定模式：调用 show() 显示，然后使用必需的坐标调用 render(children, { x, y })。',
    'LayerPlacement 值：above | below | start | end。LayerAlignment 值：start | center | end。',
    '对于点击触发的弹出层，使用 XDSPopover（位于 @xds/core/Popover）。对于悬停覆盖层，使用 XDSHoverCard（位于 @xds/core/HoverCard）。对于工具提示，使用 XDSTooltip（位于 @xds/core/Tooltip）。',
  ],
  accessibility: [
    'Layer Hook 提供定位和可见性基础。ARIA 模式由更高级别的组件（XDSPopover、XDSHoverCard、XDSTooltip）实现。',
  ],
  keyboard:
    'Escape 键关闭任何打开的层。',
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
};

/** @type {import('../docs-types').TranslationDoc} */
export const docsDense = {
  description:
    'Core hook for overlay positioning using CSS Anchor Positioning + Popover API; no React portals needed. Popover, HoverCard, Tooltip build on this.',
  features: [
    'CSS Anchor Positioning for auto-placement relative to triggers',
    'Popover API for top-layer rendering; no React portals needed',
    'Type-safe mode system: context (anchor positioning) + fixed (manual coordinates)',
    'TypeScript enforces correct render props per mode at compile time',
    'Graceful degradation in Firefox: Popover API works, anchor positioning degrades acceptably',
    'Full support in Chrome + Safari',
  ],
  notes: [
    'CSS Anchor Positioning fully supported in Chrome + Safari. Firefox supports Popover API but not anchor positioning; acceptable degradation.',
    'Context mode: pass ref to trigger, call render(children, { placement?, alignment? }). Fixed mode: call show() then render(children, { x, y }).',
    'LayerPlacement: above | below | start | end. LayerAlignment: start | center | end.',
    'For click popovers use XDSPopover (@xds/core/Popover). Hover overlays use XDSHoverCard (@xds/core/HoverCard). Tooltips use XDSTooltip (@xds/core/Tooltip).',
  ],
  accessibility: [
    'Layer hook provides positioning + visibility foundation. ARIA patterns implemented by higher-level components (XDSPopover, XDSHoverCard, XDSTooltip).',
  ],
  keyboard: 'Escape closes any open layer.',
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
