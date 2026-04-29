/** @type {import('../docs-types').ComponentDoc} */

export const docs = {
  name: 'Collapsible',
  group: 'Collapsible',
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
    description: 'Collapsible hides and reveals content behind a trigger button. Use it in settings panels, FAQ pages, or detail views to keep the page scannable while letting users drill into sections they care about. Wrap multiple collapsibles in XDSCollapsibleGroup for accordion behavior. For custom collapsible components, use the `useXDSCollapsible` hook directly (`xds hook useXDSCollapsible`).',
    bestPractices: [
      { guidance: true, description: 'Wrap each XDSCollapsible in an XDSCard for visual separation in accordion layouts.' },
      { guidance: true, description: 'Use XDSCollapsibleGroup with type="single" for settings or FAQ pages where only one section should be open at a time.' },
      { guidance: true, description: 'Use type="multiple" when users need to compare content across sections, like feature lists or pricing tiers.' },
      { guidance: true, description: 'Start sections open (defaultIsOpen) when the content is likely needed on first view — don\'t make users click to see essential info.' },
      { guidance: false, description: 'Hide critical or required content behind a collapsible — users may not discover it.' },
      { guidance: false, description: 'Nest collapsibles more than two levels deep — it makes content hard to find and navigate.' },
      { guidance: false, description: 'Use a collapsible for a single short paragraph — just show the text directly instead.' },
    ],
    anatomy: [
      { name: 'Trigger', required: true, description: 'The always-visible button that toggles the content. Shows a label and a chevron indicator.' },
      { name: 'Chevron', required: false, description: 'Animated arrow that rotates to show open or closed state.' },
      { name: 'Content', required: false, description: 'The area that hides or reveals when the trigger is clicked.' },
    ],
  },
};

/** @type {import('../docs-types').ComponentDoc} */
export const docsZh = {
  name: 'Collapsible',
  group: 'Collapsible',
  usage: {
    description: 'Collapsible hides and reveals content behind a trigger button. Use it in settings panels, FAQ pages, or detail views to keep the page scannable while letting users drill into sections they care about. Wrap multiple collapsibles in XDSCollapsibleGroup for accordion behavior.',
    bestPractices: [
      { guidance: true, description: 'Wrap each XDSCollapsible in an XDSCard for visual separation in accordion layouts.' },
      { guidance: true, description: 'Use XDSCollapsibleGroup with type="single" for settings or FAQ pages where only one section should be open at a time.' },
      { guidance: true, description: 'Use type="multiple" when users need to compare content across sections, like feature lists or pricing tiers.' },
      { guidance: true, description: 'Start sections open (defaultIsOpen) when the content is likely needed on first view — don\'t make users click to see essential info.' },
      { guidance: false, description: 'Hide critical or required content behind a collapsible — users may not discover it.' },
      { guidance: false, description: 'Nest collapsibles more than two levels deep — it makes content hard to find and navigate.' },
      { guidance: false, description: 'Use a collapsible for a single short paragraph — just show the text directly instead.' },
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
  description: 'hide/reveal content behind a trigger; group for accordion behavior',
  usage: {
    description: 'Collapsible hides and reveals content behind a trigger button. Use in settings, FAQs, or detail views. Wrap in XDSCollapsibleGroup for accordion behavior.',
    bestPractices: [
      { guidance: true, description: 'Wrap in XDSCard for visual separation. Use type="single" for settings/FAQs.' },
      { guidance: true, description: 'Use type="multiple" when users need to compare across sections.' },
      { guidance: true, description: 'Start sections open (defaultIsOpen) when content is needed on first view.' },
      { guidance: false, description: 'Hide critical content behind a collapsible — users may not discover it.' },
      { guidance: false, description: 'Nest more than two levels deep. Avoid for single short paragraphs.' },
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
