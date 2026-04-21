/** @type {import('../docs-types').ComponentDoc} */

export const docs = {
  name: 'Collapsible',
  keywords: ["accordion","collapse","expandable","disclosure","toggle","panel","foldable","expander","expand"],
  theming: {
    targets: [
      {className: 'xds-collapsible'},
    ],
  },
  components: [
    {
      name: 'XDSCollapsible',
      description:
        'A primitive that makes any content collapsible — a trigger button toggles visibility of the content area, managing its own state or deferring to a parent XDSCollapsibleGroup.',
      anatomy: [
        {name: 'Trigger', required: true, description: 'Always-visible button with a chevron indicator. Clicking toggles content visibility.'},
        {name: 'Chevron', required: false, description: 'Animated rotation indicator showing open/closed state.'},
        {name: 'Content', required: false, description: 'The collapsible area that hides or shows based on state.'},
      ],
      props: [
        {
          name: 'trigger',
          type: 'ReactNode',
          description: 'Content shown in the trigger area (always visible).',
          required: true,
        },
        {
          name: 'children',
          type: 'ReactNode',
          description: 'Content that collapses and expands.',
        },
        {
          name: 'defaultIsOpen',
          type: 'boolean',
          description: 'Default open state (uncontrolled).',
          default: 'true',
        },
        {
          name: 'isOpen',
          type: 'boolean',
          description: 'Controlled open state.',
        },
        {
          name: 'onOpenChange',
          type: '(isOpen: boolean) => void',
          description: 'Callback invoked when the open state changes.',
        },
        {
          name: 'value',
          type: 'string',
          description:
            'Identifier used for group coordination. Required when placed inside an XDSCollapsibleGroup.',
        },
      ],
    },
    {
      name: 'XDSCollapsibleGroup',
      description:
        'Coordinates multiple XDSCollapsible instances so only one (single mode) or any number (multiple mode) can be open at a time. Renders no wrapper DOM element.',
      props: [
        {
          name: 'type',
          type: "'single' | 'multiple'",
          description: 'Whether one or many items can be open simultaneously.',
          default: "'single'",
        },
        {
          name: 'defaultValue',
          type: 'string | string[]',
          description:
            'Default open item(s) for uncontrolled usage. Use a string for single mode and an array for multiple mode.',
        },
        {
          name: 'value',
          type: 'string | string[]',
          description: 'Controlled open item(s).',
        },
        {
          name: 'onChange',
          type: '(value: string | string[]) => void',
          description: 'Callback invoked when the set of open items changes.',
        },
        {
          name: 'children',
          type: 'ReactNode',
          description: 'XDSCollapsible instances to coordinate.',
          required: true,
        },
      ],
    },
  ],
  usage: {
    description: 'Collapsible is a content primitive that reveals and hides content on demand via a trigger button. Use it to progressively disclose secondary information in lists, settings, or detail panels.',
    bestPractices: [
      { guidance: true, description: 'Use XDSCollapsibleGroup with type="single" for accordion-style patterns where only one section should be open at a time.' },
      { guidance: true, description: 'Start sections open (defaultIsOpen) when the content is likely needed on first view.' },
      { guidance: true, description: 'Wrap each XDSCollapsible in an XDSCard for visual separation in accordion layouts.' },
      { guidance: true, description: 'Use type="multiple" when users need to compare content across sections simultaneously.' },
      { guidance: false, description: 'Hide critical or required content behind a collapsible — users may not discover it.' },
      { guidance: false, description: 'Nest collapsibles deeply — more than two levels makes content hard to discover and navigate.' },
    ],
  },
};

/** @type {import('../docs-types').ComponentDoc} */
export const docsZh = {
  name: 'Collapsible',
  usage: {
    description: 'Collapsible is a content primitive that reveals and hides content on demand via a trigger button. Use it to progressively disclose secondary information in lists, settings, or detail panels.',
    bestPractices: [
      { guidance: true, description: 'Use XDSCollapsibleGroup with type="single" for accordion-style patterns where only one section should be open at a time.' },
      { guidance: true, description: 'Start sections open (defaultIsOpen) when the content is likely needed on first view.' },
      { guidance: true, description: 'Wrap each XDSCollapsible in an XDSCard for visual separation in accordion layouts.' },
      { guidance: true, description: 'Use type="multiple" when users need to compare content across sections simultaneously.' },
      { guidance: false, description: 'Hide critical or required content behind a collapsible — users may not discover it.' },
      { guidance: false, description: 'Nest collapsibles deeply — more than two levels makes content hard to discover and navigate.' },
    ],
  },
  theming: {
    targets: [
      {className: 'xds-collapsible'},
    ],
  },
  components: [
    {
      name: 'XDSCollapsible',
      description:
        '使任何内容可折叠的原语——触发按钮切换内容区域的可见性，自行管理状态或委托给父级 XDSCollapsibleGroup。',
      anatomy: [
        {name: 'Trigger', required: true, description: '始终可见的按钮，带有箭头指示器。点击切换内容可见性。'},
        {name: 'Chevron', required: false, description: '显示展开/折叠状态的旋转动画指示器。'},
        {name: 'Content', required: false, description: '根据状态隐藏或显示的可折叠区域。'},
      ],
      props: [
        {name: 'trigger', type: 'ReactNode', description: '触发区域中显示的内容（始终可见）。', required: true},
        {name: 'children', type: 'ReactNode', description: '可折叠和展开的内容。'},
        {name: 'defaultIsOpen', type: 'boolean', description: '默认展开状态（非受控）。', default: 'true'},
        {name: 'isOpen', type: 'boolean', description: '受控展开状态。'},
        {name: 'onOpenChange', type: '(isOpen: boolean) => void', description: '展开状态变更时调用的回调。'},
        {name: 'value', type: 'string', description: '用于分组协调的标识符。放置在 XDSCollapsibleGroup 内时为必填。'},
      ],
    },
    {
      name: 'XDSCollapsibleGroup',
      description:
        '协调多个 XDSCollapsible 实例，使同一时间只有一个（single 模式）或任意数量（multiple 模式）可以展开。不渲染包裹 DOM 元素。',
      props: [
        {name: 'type', type: "'single' | 'multiple'", description: '是否允许同时展开一个或多个项目。', default: "'single'"},
        {name: 'defaultValue', type: 'string | string[]', description: '非受控模式下默认展开的项目。single 模式使用字符串，multiple 模式使用数组。'},
        {name: 'value', type: 'string | string[]', description: '受控展开的项目。'},
        {name: 'onChange', type: '(value: string | string[]) => void', description: '展开项目集合变更时调用的回调。'},
        {name: 'children', type: 'ReactNode', description: '需要协调的 XDSCollapsible 实例。', required: true},
      ],
    },
  ],
};

/** @type {import('../docs-types').TranslationDoc} */
export const docsDense = {
  description: 'collapsible content primitive + group coordination',
  usage: {
    description: 'Collapsible is a content primitive that reveals and hides content on demand via a trigger button. Use it to progressively disclose secondary information in lists, settings, or detail panels.',
    bestPractices: [
      { guidance: true, description: 'Use XDSCollapsibleGroup with type="single" for accordion-style patterns where only one section should be open at a time.' },
      { guidance: true, description: 'Start sections open (defaultIsOpen) when the content is likely needed on first view.' },
      { guidance: true, description: 'Wrap each XDSCollapsible in an XDSCard for visual separation in accordion layouts.' },
      { guidance: true, description: 'Use type="multiple" when users need to compare content across sections simultaneously.' },
      { guidance: false, description: 'Hide critical or required content behind a collapsible — users may not discover it.' },
      { guidance: false, description: 'Nest collapsibles deeply — more than two levels makes content hard to discover and navigate.' },
    ],
  },
  components: [
    {
      name: 'XDSCollapsible',
      description: 'makes content collapsible; trigger toggles visibility, manages own state or defers to parent group',
      propDescriptions: {
        trigger: 'content in trigger area (always visible)',
        children: 'content that collapses+expands',
        defaultIsOpen: 'default open state (uncontrolled)',
        isOpen: 'controlled open state',
        onOpenChange: 'callback on open state change',
        value: 'ID for group coordination; required inside XDSCollapsibleGroup',
      },
    },
    {
      name: 'XDSCollapsibleGroup',
      description: 'coordinates multiple XDSCollapsible instances; single or multiple open. no wrapper DOM.',
      propDescriptions: {
        type: 'one or many items open simultaneously',
        defaultValue: 'default open item(s) (uncontrolled); string for single, array for multiple',
        value: 'controlled open item(s)',
        onChange: 'callback on open items change',
        children: 'XDSCollapsible instances to coordinate',
      },
    },
  ],
};
