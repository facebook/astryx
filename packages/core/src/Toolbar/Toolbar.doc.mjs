/** @type {import('../docs-types').ComponentDoc} */

export const docs = {
  name: 'Toolbar',
  keywords: ['toolbar', 'nav', 'bar', 'actions', 'buttonbar', 'header', 'footer', 'action-bar', 'control-bar'],
  theming: {
    targets: [
      {className: 'xds-toolbar', visualProps: ['size']},
    ],
  },
  components: [
    {
      name: 'XDSToolbar',
      description:
        'General-purpose toolbar container with three content slots and roving tabindex.',
      props: [
        {
          name: 'label',
          type: 'string',
          description: 'Accessible label for the toolbar, applied as aria-label.',
          required: true,
        },
        {
          name: 'startContent',
          type: 'ReactNode',
          description: 'Content aligned to the start (left in LTR).',
        },
        {
          name: 'centerContent',
          type: 'ReactNode',
          description:
            'Centered content. Switches layout to CSS grid (1fr auto 1fr).',
        },
        {
          name: 'endContent',
          type: 'ReactNode',
          description: 'Content aligned to the end (right in LTR).',
        },
        {
          name: 'size',
          type: "'sm' | 'md' | 'lg'",
          description: 'Size of the toolbar. Children such as Button, TextInput, TabList, and Selector inherit this size as their default via XDSSizeContext.',
          default: "'md'",
        },
        {
          name: 'gap',
          type: 'SpacingStep',
          description: 'Gap between items within each slot.',
          default: '1',
        },
        {
          name: 'orientation',
          type: "'horizontal' | 'vertical'",
          description:
            'Orientation for keyboard navigation. Controls arrow key direction.',
          default: "'horizontal'",
        },
        {
          name: 'variant',
          type: 'XDSSectionVariant',
          description: 'Visual variant passed to XDSSection.',
          default: "'transparent'",
        },
        {
          name: 'dividers',
          type: "Array<'top' | 'bottom' | 'start' | 'end'>",
          description: 'Which sides should have divider borders. Passed through to XDSSection.',
        },
        {
          name: 'xstyle',
          type: 'StyleXStyles',
          description:
            'StyleX styles for layout customization. Must be a stylex.create() value.',
        },
      ],
    },
  ],
  usage: {
    description:
      'Toolbar is a horizontal container for grouping related actions and controls using start, center, and end content slots. Use Toolbar to provide contextual actions above content areas like tables, editors, or detail panels.',
    bestPractices: [
      {guidance: true, description: 'Group related actions together in the same slot for a clear visual hierarchy.'},
      {guidance: true, description: 'Use a smaller size (sm) when space is limited or the toolbar is secondary to the main content.'},
      {guidance: false, description: 'Avoid overloading the toolbar with too many actions — use an overflow menu for less common items.'},
    ],
  },
};

/** @type {import('../docs-types').TranslationDoc} */
export const docsZh = {
  components: [
    {
      name: 'XDSToolbar',
      description: '通用工具栏容器，提供三个内容插槽和循环 Tab。',
      propDescriptions: {
        label: '工具栏的无障碍标签，作为 aria-label 应用。',
        startContent: '起始内容（LTR 中靠左对齐）。',
        centerContent: '居中内容。切换为 CSS grid（1fr auto 1fr）。',
        endContent: '结束内容（LTR 中靠右对齐）。',
        size: '工具栏尺寸。子组件（如 Button、TextInput、TabList、Selector）通过 XDSSizeContext 继承此尺寸作为默认值。',
        gap: '插槽内项目间距。',
        orientation: '键盘导航方向。控制方向键方向。',
        variant: '传递给 XDSSection 的视觉变体。',
        dividers: '哪些侧面应有分隔线边框。传递给 XDSSection。',
        xstyle: '用于布局自定义的 StyleX 样式。必须是 stylex.create() 的值。',
      },
    },
  ],
  usage: {
    description:
      'Toolbar is a horizontal container for grouping related actions and controls using start, center, and end content slots. Use Toolbar to provide contextual actions above content areas like tables, editors, or detail panels.',
    bestPractices: [
      {guidance: true, description: 'Group related actions together in the same slot for a clear visual hierarchy.'},
      {guidance: true, description: 'Use a smaller size (sm) when space is limited or the toolbar is secondary to the main content.'},
      {guidance: false, description: 'Avoid overloading the toolbar with too many actions — use an overflow menu for less common items.'},
    ],
  },
};

/** @type {import('../docs-types').TranslationDoc} */
export const docsDense = {
  description: 'General-purpose toolbar w/ start/center/end slots. Built on XDSSection w/ roving tabindex.',
  usage: {
    description:
      'Toolbar is a horizontal container for grouping related actions and controls using start, center, and end content slots. Use Toolbar to provide contextual actions above content areas like tables, editors, or detail panels.',
    bestPractices: [
      {guidance: true, description: 'Group related actions together in the same slot for a clear visual hierarchy.'},
      {guidance: true, description: 'Use a smaller size (sm) when space is limited or the toolbar is secondary to the main content.'},
      {guidance: false, description: 'Avoid overloading the toolbar with too many actions — use an overflow menu for less common items.'},
    ],
  },
  components: [
    {
      name: 'XDSToolbar',
      description: 'Toolbar container w/ 3 content slots + roving tabindex.',
      propDescriptions: {
        label: 'A11y label, aria-label on toolbar.',
        startContent: 'Start-aligned content.',
        centerContent: 'Centered content; switches to 3-col grid.',
        endContent: 'End-aligned content.',
        size: 'Toolbar size; children inherit via XDSSizeContext.',
        gap: 'Gap between slot items.',
        orientation: 'Keyboard nav direction.',
        variant: 'Visual variant for XDSSection.',
        dividers: 'Which sides get divider borders.',
        xstyle: 'StyleX layout styles. Must be stylex.create() value.',
      },
    },
  ],
};
