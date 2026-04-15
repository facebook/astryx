/** @type {import('../docs-types').ComponentDoc} */

export const docs = {
  name: 'Collapsible',
  description: 'Collapsible content primitive and group coordination.',
  showcase: {
    aspectRatio: 4 / 3,
    code: '<XDSCollapsible trigger="Details">Hidden content</XDSCollapsible>',
  },
  keywords: ["accordion","collapse","expandable","disclosure","toggle","panel","foldable","expander","expand"],
  features: [
    'XDSCollapsible makes any content collapsible — a trigger toggles visibility of the content area',
    'Handles state management, accessibility (aria-expanded, keyboard activation), and a chevron indicator',
    'Supports uncontrolled (defaultIsOpen), controlled (isOpen / onOpenChange), and group-coordinated modes',
    'XDSCollapsibleGroup coordinates multiple XDSCollapsible instances so only one (single mode) or multiple (multiple mode) can be open at a time',
    'XDSCollapsibleGroup renders no wrapper DOM element',
    'When inside a group, XDSCollapsible defers open/close state to the group context via the value prop',
  ],
  keyboard:
    'Enter or Space activates the trigger button to toggle open/close state.',
  accessibility: [
    'Trigger renders as a <button> with aria-expanded reflecting the current open state',
    'A chevron indicator provides a visual affordance for the expanded/collapsed state',
  ],
  theming: {
    targets: [
      {className: 'xds-collapsible'},
    ],
  },
  notes: [
    'XDSCollapsible manages its own open/close state by default (uncontrolled)',
    'When nested inside an XDSCollapsibleGroup with a matching value prop, it defers to the group context',
    'XDSCollapsibleGroup provides context with isOpen(value) and toggle(value) methods',
    'The group renders no wrapper DOM — layout is the responsibility of the consumer (e.g. XDSVStack)',
  ],
  components: [
    {
      name: 'XDSCollapsible',
      description:
        'A primitive that makes any content collapsible — a trigger button toggles visibility of the content area, managing its own state or deferring to a parent XDSCollapsibleGroup.',
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
      ],    },
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
    summary: 'Contains information that may need additional space to display.',
    content: `## When to use

- Presenting additional information for items in a list.
- Content that can be hidden to save space and revealed on demand.`,
  },
};

/** @type {import('../docs-types').ComponentDoc} */
export const docsZh = {
  name: 'Collapsible',
  description: '可折叠内容原语和分组协调。',
  features: [
    'XDSCollapsible 使任何内容可折叠——触发器切换内容区域的可见性',
    '处理状态管理、无障碍（aria-expanded、键盘激活）和折叠指示器',
    '支持非受控（defaultIsOpen）、受控（isOpen / onOpenChange）和分组协调模式',
    'XDSCollapsibleGroup 协调多个 XDSCollapsible 实例，使同一时间只有一个（single 模式）或多个（multiple 模式）可以展开',
    'XDSCollapsibleGroup 不渲染包裹 DOM 元素',
    '在分组内时，XDSCollapsible 通过 value 属性将展开/收起状态委托给分组上下文',
  ],
  keyboard:
    'Enter 或 Space 激活触发按钮以切换展开/收起状态。',
  accessibility: [
    '触发器渲染为带有 aria-expanded 的 <button>，反映当前展开状态',
    '折叠指示器为展开/收起状态提供视觉提示',
  ],
  theming: {
    targets: [
      {className: 'xds-collapsible'},
    ],
  },
  notes: [
    'XDSCollapsible 默认自行管理展开/收起状态（非受控）',
    '嵌套在具有匹配 value 属性的 XDSCollapsibleGroup 内时，委托给分组上下文',
    'XDSCollapsibleGroup 通过 isOpen(value) 和 toggle(value) 方法提供上下文',
    '分组不渲染包裹 DOM——布局由使用者负责（如 XDSVStack）',
  ],
  components: [
    {
      name: 'XDSCollapsible',
      description:
        '使任何内容可折叠的原语——触发按钮切换内容区域的可见性，自行管理状态或委托给父级 XDSCollapsibleGroup。',
      props: [
        {
          name: 'trigger',
          type: 'ReactNode',
          description: '触发区域中显示的内容（始终可见）。',
          required: true,
        },
        {
          name: 'children',
          type: 'ReactNode',
          description: '可折叠和展开的内容。',
        },
        {
          name: 'defaultIsOpen',
          type: 'boolean',
          description: '默认展开状态（非受控）。',
          default: 'true',
        },
        {
          name: 'isOpen',
          type: 'boolean',
          description: '受控展开状态。',
        },
        {
          name: 'onOpenChange',
          type: '(isOpen: boolean) => void',
          description: '展开状态变更时调用的回调。',
        },
        {
          name: 'value',
          type: 'string',
          description:
            '用于分组协调的标识符。放置在 XDSCollapsibleGroup 内时为必填。',
        },
      ],
    },
    {
      name: 'XDSCollapsibleGroup',
      description:
        '协调多个 XDSCollapsible 实例，使同一时间只有一个（single 模式）或任意数量（multiple 模式）可以展开。不渲染包裹 DOM 元素。',
      props: [
        {
          name: 'type',
          type: "'single' | 'multiple'",
          description: '是否允许同时展开一个或多个项目。',
          default: "'single'",
        },
        {
          name: 'defaultValue',
          type: 'string | string[]',
          description:
            '非受控模式下默认展开的项目。single 模式使用字符串，multiple 模式使用数组。',
        },
        {
          name: 'value',
          type: 'string | string[]',
          description: '受控展开的项目。',
        },
        {
          name: 'onChange',
          type: '(value: string | string[]) => void',
          description: '展开项目集合变更时调用的回调。',
        },
        {
          name: 'children',
          type: 'ReactNode',
          description: '需要协调的 XDSCollapsible 实例。',
          required: true,
        },
      ],
    },
  ],
};

/** @type {import('../docs-types').TranslationDoc} */
export const docsDense = {
  description: 'collapsible content primitive + group coordination',
  features: [
    'XDSCollapsible makes content collapsible; trigger toggles content visibility',
    'handles state, a11y (aria-expanded, keyboard), chevron indicator',
    'uncontrolled (defaultIsOpen), controlled (isOpen/onOpenChange), group-coordinated modes',
    'XDSCollapsibleGroup coordinates multiple instances; single or multiple open at once',
    'XDSCollapsibleGroup renders no wrapper DOM',
    'inside group, defers open/close state to group context via value prop',
  ],
  keyboard: 'Enter/Space activates trigger to toggle open/close',
  accessibility: [
    'trigger renders as <button> w/ aria-expanded reflecting open state',
    'chevron indicator shows expanded/collapsed visual affordance',
  ],
  notes: [
    'manages own open/close state by default (uncontrolled)',
    'nested in XDSCollapsibleGroup w/ matching value, defers to group context',
    'group context exposes isOpen(value) + toggle(value) methods',
    'group renders no wrapper DOM; layout is consumer responsibility (e.g. XDSVStack)',
  ],
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
