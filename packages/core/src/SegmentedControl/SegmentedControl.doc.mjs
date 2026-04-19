/** @type {import('../docs-types').ComponentDoc} */

export const docs = {
  name: 'SegmentedControl',
  keywords: ['radio', 'tabs', 'toggle', 'toggle-group', 'pill', 'button-group', 'switch', 'segment', 'control'],
  theming: {
    targets: [
      {className: 'xds-segmented-control', visualProps: ['size']},
      {className: 'xds-segmented-control-item'},
    ],
    vars: [
      {name: '--segmented-radius', description: 'Border radius of the segmented control', default: 'var(--radius-element)'},
      {name: '--segmented-padding', description: 'Inner padding of the segmented control', default: 'var(--spacing-0-5)'},
    ],
    derived: [
      {property: 'borderRadius', description: 'Border radius of the segmented control', default: 'var(--radius-element)', vars: ['--segmented-radius']},
      {property: 'padding', description: 'Inner padding of the segmented control', default: 'var(--spacing-0-5)', vars: ['--segmented-padding']},
    ],
  },
  components: [
    {
      name: 'XDSSegmentedControl',
      description:
        'Container wrapper providing context (value, onChange, size, isDisabled) to XDSSegmentedControlItem children.',
      props: [
        {
          name: 'value',
          type: 'string',
          description: 'The currently selected value (controlled).',
          required: true,
        },
        {
          name: 'onChange',
          type: '(value: string) => void',
          description: 'Callback fired when a segment is selected.',
          required: true,
        },
        {
          name: 'label',
          type: 'string',
          description:
            'Accessible label for the radio group (used as aria-label, never rendered visually).',
          required: true,
        },
        {
          name: 'size',
          type: "'sm' | 'md' | 'lg'",
          description: 'Size variant for the control.',
          default: "'md'",
        },
        {
          name: 'isDisabled',
          type: 'boolean',
          description: 'Whether the entire control is disabled.',
          default: 'false',
        },
        {
          name: 'children',
          type: 'ReactNode',
          description: 'XDSSegmentedControlItem children.',
          required: true,
        },
        {
          name: 'xstyle',
          type: 'StyleXStyles',
          description: 'Additional StyleX styles for the container.',
        },
      ],    },
    {
      name: 'XDSSegmentedControlItem',
      description:
        'Individual segment item rendering as a radio button within the segmented control.',
      props: [
        {
          name: 'value',
          type: 'string',
          description:
            'Unique value for this segment, matched against the parent value.',
          required: true,
        },
        {
          name: 'label',
          type: 'string',
          description:
            'Accessible label for this segment. Rendered as visible text unless isLabelHidden is true.',
          required: true,
        },
        {
          name: 'isLabelHidden',
          type: 'boolean',
          description:
            'Whether the label is visually hidden. When true, only the icon is displayed and label is used as aria-label.',
          default: 'false',
        },
        {
          name: 'icon',
          type: 'ReactNode',
          description: 'Icon element displayed before the label.',
        },
        {
          name: 'isDisabled',
          type: 'boolean',
          description: 'Whether this individual item is disabled.',
          default: 'false',
        },
      ],
    },
  ],
  usage: {
    description:
      'A segmented button group that allows users to make a single selection from a small set of mutually exclusive options. Use SegmentedControl when all options should be visible at once and the selection controls a value or mode, not page navigation.',
    bestPractices: [
      {guidance: true, description: 'Use for switching between 2–5 mutually exclusive views or modes where all options should be visible.'},
      {guidance: true, description: 'Provide a descriptive label for the control to ensure the group is accessible to screen readers.'},
      {guidance: false, description: 'Use for page-level navigation — use Tabs instead.'},
      {guidance: false, description: 'Use for simple on/off states — use ToggleButton instead.'},
    ],
  },
};

/** @type {import('../docs-types').TranslationDoc} */
export const docsZh = {
  components: [
    {
      name: 'XDSSegmentedControl',
      description:
        '容器包装组件，通过上下文向 XDSSegmentedControlItem 子组件提供 value、onChange、size、isDisabled。',
      propDescriptions: {
        value: '当前选中值（受控）。',
        onChange: '选中分段时触发的回调。',
        label: '单选组的无障碍标签（用作 aria-label，不会渲染为可见内容）。',
        size: '控件的尺寸变体。',
        isDisabled: '是否禁用整个控件。',
        children: 'XDSSegmentedControlItem 子组件。',
        xstyle: '容器的额外 StyleX 样式。',
      },
    },
    {
      name: 'XDSSegmentedControlItem',
      description:
        '单个分段项，在分段控件中渲染为单选按钮。',
      propDescriptions: {
        value: '该分段的唯一值，与父组件的 value 匹配。',
        label: '该分段的无障碍标签。除非 isLabelHidden 为 true，否则渲染为可见文本。',
        isLabelHidden: '是否在视觉上隐藏标签。为 true 时仅显示图标，label 用作 aria-label。',
        icon: '显示在标签前的图标元素。',
        isDisabled: '是否禁用该单个项。',
      },
    },
  ],
  usage: {
    description:
      'A segmented button group that allows users to make a single selection from a small set of mutually exclusive options. Use SegmentedControl when all options should be visible at once and the selection controls a value or mode, not page navigation.',
    bestPractices: [
      {guidance: true, description: 'Use for switching between 2–5 mutually exclusive views or modes where all options should be visible.'},
      {guidance: true, description: 'Provide a descriptive label for the control to ensure the group is accessible to screen readers.'},
      {guidance: false, description: 'Use for page-level navigation — use Tabs instead.'},
      {guidance: false, description: 'Use for simple on/off states — use ToggleButton instead.'},
    ],
  },
};

/** @type {import('../docs-types').TranslationDoc} */
export const docsDense = {
  usage: {
    description:
      'A segmented button group that allows users to make a single selection from a small set of mutually exclusive options. Use SegmentedControl when all options should be visible at once and the selection controls a value or mode, not page navigation.',
    bestPractices: [
      {guidance: true, description: 'Use for switching between 2–5 mutually exclusive views or modes where all options should be visible.'},
      {guidance: true, description: 'Provide a descriptive label for the control to ensure the group is accessible to screen readers.'},
      {guidance: false, description: 'Use for page-level navigation — use Tabs instead.'},
      {guidance: false, description: 'Use for simple on/off states — use ToggleButton instead.'},
    ],
  },
  propDescriptions: {
    value: 'currently selected value (controlled)',
    onChange: 'callback on segment selection',
    label: 'aria-label for radio group (never rendered)',
    size: 'size variant',
    isDisabled: 'disables entire control',
    children: 'XDSSegmentedControlItem children',
    xstyle: 'additional StyleX styles for container',
  },
  components: [
    {
      name: 'XDSSegmentedControl',
      description: 'container; provides context (value/onChange/size/isDisabled) to children',
      propDescriptions: {
        value: 'selected value (controlled)',
        onChange: 'selection callback',
        label: 'aria-label for radio group (not rendered)',
        size: 'size variant',
        isDisabled: 'disables entire control',
        children: 'XDSSegmentedControlItem children',
        xstyle: 'extra StyleX styles',
      },
    },
    {
      name: 'XDSSegmentedControlItem',
      description: 'individual segment; renders as radio button in control',
      propDescriptions: {
        value: 'unique segment value; matched against parent',
        label: 'segment label; visible unless isLabelHidden',
        isLabelHidden: 'hides label visually; label becomes aria-label',
        icon: 'icon before label',
        isDisabled: 'disables this item',
      },
    },
  ],
};
