// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @type {import('../docs-types').ComponentDoc} */

export const docs = {
  name: 'Field',
  displayName: 'Field',
  group: 'Field',
  category: 'Inputs',
  keywords: ["field","formfield","formgroup","formcontrol","label","input","required","optional","helpertext","hint"],
  playground: {
    defaults: {
      label: 'Email address',
      children: {__element: 'XDSTextInput', props: {label: 'Email', placeholder: 'you@example.com'}},
    },
  },
  theming: {
    targets: [
      {className: 'xds-field'},
      {className: 'xds-field-label'},
      {className: 'xds-field-status', visualProps: ['type', 'variant']},
    ],
    vars: [
      {name: '--_field-radius', description: 'Border radius of input fields', default: 'var(--radius-element)', private: true},
    ],
    derived: [
      {property: 'borderRadius', vars: ['--_field-radius']},
    ],
  },
  components: [
    {
      name: 'XDSField',
      displayName: 'Field',
      description:
        'Form field wrapper that provides label, description, and optional/required indicators.',      props: [
        {
          name: 'label',
          type: 'string',
          description:
            'Label text for the field (always rendered for accessibility).',
          required: true,
        },
        {
          name: 'inputID',
          type: 'string',
          description:
            'ID for the input element (used for the label htmlFor attribute).',
          required: true,
        },
        {
          name: 'children',
          type: 'ReactNode',
          description: 'The input or control to render.',
          required: true,
        },
        {
          name: 'isLabelHidden',
          type: 'boolean',
          description:
            'Visually hide the label (still accessible to screen readers).',
          default: 'false',
        },
        {
          name: 'isDisabled',
          type: 'boolean',
          description:
            'Whether the associated input is disabled. Propagates disabled styling to the label.',
          default: 'false',
        },
        {
          name: 'description',
          type: 'string',
          description:
            'Description text displayed between the label and input.',
        },
        {
          name: 'descriptionID',
          type: 'string',
          description:
            'ID for the description element (use for aria-describedby on the input).',
        },
        {
          name: 'isOptional',
          type: 'boolean',
          description:
            'Whether the field is optional (mutually exclusive with isRequired).',
          default: 'false',
        },
        {
          name: 'isRequired',
          type: 'boolean',
          description:
            'Whether the field is required (mutually exclusive with isOptional).',
          default: 'false',
        },
        {
          name: 'labelIcon',
          type: 'XDSIconType',
          description: 'Icon to display before the label text. See `npx xds docs icons` for valid semantic names.',
        },
        {
          name: 'labelTooltip',
          type: 'string',
          description:
            'Tooltip text to display in an info icon at the end of the label.',
        },
        {
          name: 'status',
          type: 'XDSFieldStatus',
          description:
            'Status indicator with type and optional message. When message is set, displays a colored status box.',
        },
        {
          name: 'statusVariant',
          type: "'attached' | 'detached'",
          description:
            'How the status message renders relative to the input. Attached overlaps the input border; detached floats below.',
          default: "'attached'",
        },
        {
          name: 'ref',
          type: 'React.Ref<HTMLDivElement>',
          description: 'Ref forwarded to the root element.',
        },
        {
          name: 'xstyle',
          type: 'StyleXStyles',
          description:
            'StyleX styles for layout customization (margins, positioning, sizing). Must be a stylex.create() value — not an inline style object like style={{}}.',
        },
        {
          name: 'className',
          type: 'string',
          description:
            'CSS class name(s) appended to the root element. Prefer xstyle for StyleX deduplication.',
        },
        {
          name: 'style',
          type: 'React.CSSProperties',
          description:
            'Inline styles applied to the root element. Takes priority over StyleX inline styles.',
        },
      ],
    },
    {
      name: 'XDSFieldLabel',
      displayName: 'Field Label',
      description:
        'Standalone label component with optional/required indicators and tooltip support.',
      props: [
        {
          name: 'label',
          type: 'string',
          description: 'Label text.',
          required: true,
        },
        {
          name: 'inputID',
          type: 'string',
          description: 'ID of the input this label is for.',
          required: true,
        },
        {
          name: 'isLabelHidden',
          type: 'boolean',
          description: 'Visually hide the label.',
          default: 'false',
        },
        {
          name: 'isDisabled',
          type: 'boolean',
          description: 'Whether the associated input is disabled.',
          default: 'false',
        },
        {
          name: 'isOptional',
          type: 'boolean',
          description: 'Show "Optional" indicator.',
          default: 'false',
        },
        {
          name: 'isRequired',
          type: 'boolean',
          description: 'Show "Required" indicator.',
          default: 'false',
        },
        {
          name: 'labelIcon',
          type: 'XDSIconType',
          description: 'Icon before the label text. See `npx xds docs icons` for valid semantic names.',
        },
        {
          name: 'labelTooltip',
          type: 'string',
          description: 'Tooltip text for info icon at end of label.',
        },
      ],
    },
    {
      name: 'XDSFieldStatus',
      displayName: 'Field Status',
      description:
        'Status message component for form field validation feedback.',
      props: [
        {
          name: 'type',
          type: "'error' | 'warning' | 'success'",
          description: 'Status type.',
          required: true,
        },
        {
          name: 'message',
          type: 'string',
          description: 'Status message text.',
          required: true,
        },
        {
          name: 'id',
          type: 'string',
          description: 'ID for aria-describedby association.',
        },
        {
          name: 'variant',
          type: "'attached' | 'detached'",
          description:
            'Visual variant — attached overlaps the input, detached floats below.',
          default: "'attached'",
        },
      ],
    },
  ],
  usage: {
    description: 'Field wraps any input control with a label, description, and validation status. Use it to build accessible forms with consistent labeling, optional/required indicators, and inline error, warning, or success feedback.',
    bestPractices: [
      { guidance: true, description: 'Always provide a label for accessibility, even if visually hidden with isLabelHidden.' },
      { guidance: true, description: 'Use the status prop with clear messages to provide inline validation feedback.' },
      { guidance: true, description: 'Add a description when the label alone does not explain what the field expects, like format hints or constraints.' },
      { guidance: false, description: 'Set both isOptional and isRequired on the same field.' },
      { guidance: false, description: 'Use the detached status variant on bordered inputs — reserve it for checkboxes, switches, and sliders.' },
      { guidance: false, description: 'Hide the label without providing an alternative way for the user to understand the field purpose.' },
    ],
    anatomy: [
      {name: 'Label', required: true, description: 'Text identifying the field. Always rendered for accessibility, optionally hidden visually.'},
      {name: 'Description', required: false, description: 'Helper text between the label and input explaining what to enter.'},
      {name: 'Input slot', required: true, description: 'The input control wrapped by the field — TextInput, Select, DateInput, etc.'},
      {name: 'Status message', required: false, description: 'Inline validation feedback showing error, warning, or success with a message.'},
      {name: 'Optional/Required indicator', required: false, description: 'Badge next to the label showing whether the field is optional or required.'},
      {name: 'Label tooltip', required: false, description: 'Info icon at the end of the label with a tooltip explaining the field.'},
    ],
  },
};

/** @type {import('../docs-types').ComponentDoc} */
export const docsZh = {
  name: 'Field',
  displayName: 'Field',
  theming: {
    targets: [
      {className: 'xds-field'},
      {className: 'xds-field-label'},
      {className: 'xds-field-status', visualProps: ['type', 'variant']},
    ],
    vars: [
      {name: '--_field-radius', description: 'Border radius of input fields', default: 'var(--radius-element)', private: true},
    ],
    derived: [
      {property: 'borderRadius', vars: ['--_field-radius']},
    ],
  },
  components: [
    {
      name: 'XDSField',
      displayName: 'Field',
      description:
        '表单字段包装器，提供标签、描述以及可选/必填指示器。',
      props: [
        {
          name: 'label',
          type: 'string',
          description:
            '字段的标签文本（始终渲染以确保无障碍访问）。',
          required: true,
        },
        {
          name: 'inputID',
          type: 'string',
          description:
            '输入元素的 ID（用于标签的 htmlFor 属性）。',
          required: true,
        },
        {
          name: 'children',
          type: 'ReactNode',
          description: '要渲染的输入框或控件。',
          required: true,
        },
        {
          name: 'isLabelHidden',
          type: 'boolean',
          description:
            '视觉隐藏标签（屏幕阅读器仍可访问）。',
          default: 'false',
        },
        {
          name: 'isDisabled',
          type: 'boolean',
          description:
            '关联的输入框是否禁用。将禁用样式传递给标签。',
          default: 'false',
        },
        {
          name: 'description',
          type: 'string',
          description:
            '显示在标签和输入框之间的描述文本。',
        },
        {
          name: 'descriptionID',
          type: 'string',
          description:
            '描述元素的 ID（用于输入框的 aria-describedby）。',
        },
        {
          name: 'isOptional',
          type: 'boolean',
          description:
            '字段是否可选（与 isRequired 互斥）。',
          default: 'false',
        },
        {
          name: 'isRequired',
          type: 'boolean',
          description:
            '字段是否必填（与 isOptional 互斥）。',
          default: 'false',
        },
        {
          name: 'labelIcon',
          type: 'XDSIconType',
          description: '显示在标签文本前的图标。',
        },
        {
          name: 'labelTooltip',
          type: 'string',
          description:
            '在标签末尾的信息图标中显示的工具提示文本。',
        },
        {
          name: 'status',
          type: 'XDSFieldStatus',
          description:
            '状态指示器，包含类型和可选消息。设置消息时显示彩色状态框。',
        },
        {
          name: 'statusVariant',
          type: "'attached' | 'detached'",
          description:
            '状态消息相对于输入框的渲染方式。attached 覆盖输入框边框；detached 浮动在下方。',
          default: "'attached'",
        },
        {
          name: 'ref',
          type: 'React.Ref<HTMLDivElement>',
          description: '转发到根元素的 ref。',
        },
        {
          name: 'xstyle',
          type: 'StyleXStyles',
          description:
            '用于布局自定义（外边距、定位、尺寸）的 StyleX 样式。必须是 stylex.create() 的值，而非内联样式对象如 style={{}}。',
        },
        {
          name: 'className',
          type: 'string',
          description:
            '附加到根元素的 CSS 类名。优先使用 xstyle 以获得 StyleX 样式去重。',
        },
        {
          name: 'style',
          type: 'React.CSSProperties',
          description:
            '应用到根元素的内联样式。优先于 StyleX 内联样式。',
        },
      ],
    },
    {
      name: 'XDSFieldLabel',
      displayName: 'Field Label',
      description:
        '独立的标签组件，支持可选/必填指示器和工具提示。',
      props: [
        {
          name: 'label',
          type: 'string',
          description: '标签文本。',
          required: true,
        },
        {
          name: 'inputID',
          type: 'string',
          description: '此标签关联的输入框 ID。',
          required: true,
        },
        {
          name: 'isLabelHidden',
          type: 'boolean',
          description: '视觉隐藏标签。',
          default: 'false',
        },
        {
          name: 'isDisabled',
          type: 'boolean',
          description: '关联的输入框是否禁用。',
          default: 'false',
        },
        {
          name: 'isOptional',
          type: 'boolean',
          description: '显示"Optional"指示器。',
          default: 'false',
        },
        {
          name: 'isRequired',
          type: 'boolean',
          description: '显示"Required"指示器。',
          default: 'false',
        },
        {
          name: 'labelIcon',
          type: 'XDSIconType',
          description: '标签文本前的图标。',
        },
        {
          name: 'labelTooltip',
          type: 'string',
          description: '标签末尾信息图标的工具提示文本。',
        },
      ],
    },
    {
      name: 'XDSFieldStatus',
      displayName: 'Field Status',
      description:
        '用于表单字段验证反馈的状态消息组件。',
      props: [
        {
          name: 'type',
          type: "'error' | 'warning' | 'success'",
          description: '状态类型。',
          required: true,
        },
        {
          name: 'message',
          type: 'string',
          description: '状态消息文本。',
          required: true,
        },
        {
          name: 'id',
          type: 'string',
          description: '用于 aria-describedby 关联的 ID。',
        },
        {
          name: 'variant',
          type: "'attached' | 'detached'",
          description:
            '视觉变体 - attached 覆盖在输入框上，detached 浮动在下方。',
          default: "'attached'",
        },
      ],
    },
  ],
  usage: {
    description: 'Field wraps any input control with a label, description, and validation status. Use it to build accessible forms with consistent labeling, optional/required indicators, and inline error, warning, or success feedback.',
    bestPractices: [
      { guidance: true, description: 'Always provide a label for accessibility, even if visually hidden with isLabelHidden.' },
      { guidance: true, description: 'Use the status prop with clear messages to provide inline validation feedback.' },
      { guidance: true, description: 'Add a description when the label alone does not explain what the field expects, like format hints or constraints.' },
      { guidance: false, description: 'Set both isOptional and isRequired on the same field.' },
      { guidance: false, description: 'Use the detached status variant on bordered inputs — reserve it for checkboxes, switches, and sliders.' },
      { guidance: false, description: 'Hide the label without providing an alternative way for the user to understand the field purpose.' },
    ],
  },
};

/** @type {import('../docs-types').TranslationDoc} */
export const docsDense = {
  description:
    'Form field wrapper providing label, description + optional/required indicators.',
  usage: {
    description: 'Field wraps input controls with label, description, and validation. Use for accessible forms with consistent labeling and inline feedback.',
    bestPractices: [
      { guidance: true, description: 'Always provide a label. Use status with clear messages. Add description for format hints.' },
      { guidance: false, description: 'Don\'t set both isOptional and isRequired. Don\'t use detached status on bordered inputs.' },
    ],
  },
  components: [
    {
      name: 'XDSField',
      displayName: 'Field',
      description: 'Form field wrapper w/ label, description + optional/required indicators.',
      propDescriptions: {
        label: 'Label text for field (always rendered for a11y).',
        inputID: 'Input element ID (used for label htmlFor).',
        children: 'Input or control to render.',
        isLabelHidden: 'Visually hide label (still accessible to screen readers).',
        isDisabled: 'Associated input disabled. Propagates disabled styling to label.',
        description: 'Description text between label + input.',
        descriptionID: 'ID for description element (use for aria-describedby on input).',
        isOptional: 'Field optional (mutually exclusive w/ isRequired).',
        isRequired: 'Field required (mutually exclusive w/ isOptional).',
        labelIcon: 'Icon before label text.',
        labelTooltip: 'Tooltip text in info icon at end of label.',
        status: 'Status indicator w/ type + optional message. Shows colored status box.',
        statusVariant: 'Status render mode; attached overlaps input, detached floats below.',
        ref: 'Ref forwarded to root element.',
        xstyle: 'StyleX styles for layout customization. Must be stylex.create() value.',
        className: 'CSS class name(s) appended to root element.',
        style: 'Inline styles applied to root element.',
      },
    },
    {
      name: 'XDSFieldLabel',
      displayName: 'Field Label',
      description: 'Standalone label w/ optional/required indicators + tooltip support.',
      propDescriptions: {
        label: 'Label text.',
        inputID: 'ID of input this label is for.',
        isLabelHidden: 'Visually hide label.',
        isDisabled: 'Associated input disabled.',
        isOptional: 'Show "Optional" indicator.',
        isRequired: 'Show "Required" indicator.',
        labelIcon: 'Icon before label text.',
        labelTooltip: 'Tooltip text for info icon at end of label.',
      },
    },
    {
      name: 'XDSFieldStatus',
      displayName: 'Field Status',
      description: 'Status message for form field validation feedback.',
      propDescriptions: {
        type: 'Status type.',
        message: 'Status message text.',
        id: 'ID for aria-describedby association.',
        variant: 'Visual variant; attached overlaps input, detached floats below.',
      },
    },
  ],
};
