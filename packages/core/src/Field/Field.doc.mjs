/** @type {import('../docs-types').ComponentDoc} */

export const docs = {
  name: 'Field',
  description:
    'A form field wrapper component that provides label, description, and optional/required indicators.',
  showcase: {
    aspectRatio: 4 / 3,
    code: '<XDSField label="Name"><input /></XDSField>',
  },
  keywords: ["field","formfield","formgroup","formcontrol","label","input","required","optional","helpertext","hint"],
  features: [
    'Label Support — required label for accessibility (can be visually hidden)',
    'Description — optional description text displayed between the label and input',
    'Optional/Required Indicators — display "Optional" or "Required" text with bullet separator',
    'Label Tooltip — optional info icon with tooltip at end of label',
    'Disabled State — propagates disabled styling to label',
    'Status Messages — attached/detached validation feedback with role="status" and aria-live="polite"',
    'Accessible — label properly associated with input via htmlFor/id',
    'Styled with StyleX — uses XDS design tokens for consistent styling',
  ],
  theming: {
    targets: [
      {className: 'xds-field'},
      {className: 'xds-field-label'},
      {className: 'xds-field-status', visualProps: ['type', 'variant']},
    ],
    vars: [
      {name: '--input-radius', description: 'Border radius of input fields', default: 'var(--radius-element)'},
    ],
  },
  notes: [
    'Parent components are responsible for generating IDs (using the useId hook).',
    'Label is always rendered for accessibility; use isLabelHidden to hide visually.',
    'Hidden label uses a CSS technique that remains accessible to screen readers.',
    'Description is rendered when provided; if descriptionID is also provided, the description element gets that ID for aria-describedby association.',
    'isOptional and isRequired are mutually exclusive; setting both will show "Optional" (dev warning emitted).',
    'Optional/Required text appears on the same line as the label.',
    'Status messages use role="status" and aria-live="polite" for screen reader announcements.',
    'Use statusVariant="attached" (default) for bordered inputs; "detached" for checkboxes, switches, sliders.',
    'isDisabled propagates disabled styling to the label (color + cursor).',
  ],
  components: [
    {
      name: 'XDSField',
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
          description: 'Icon to display before the label text.',
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
          description: 'Icon before the label text.',
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
    summary: 'A form field wrapper that provides label, description, and optional/required indicators around an input.',
    content: `## When to use

- Wrapping input components in forms to provide consistent labels, descriptions, and validation states.`,
  },
};

/** @type {import('../docs-types').ComponentDoc} */
export const docsZh = {
  name: 'Field',
  description:
    '表单字段包装组件，提供标签、描述以及可选/必填指示器。',
  features: [
    '标签支持 - 必需的标签用于无障碍访问（可视觉隐藏）',
    '描述 - 可选的描述文本，显示在标签和输入框之间',
    '可选/必填指示器 - 显示"Optional"或"Required"文本，带圆点分隔符',
    '标签工具提示 - 可选的信息图标，在标签末尾显示工具提示',
    '禁用状态 - 将禁用样式传递给标签',
    '状态消息 - attached/detached 验证反馈，带 role="status" 和 aria-live="polite"',
    '无障碍 - 通过 htmlFor/id 将标签与输入框正确关联',
    '使用 StyleX 样式 - 使用 XDS 设计令牌实现一致的样式',
  ],
  theming: {
    targets: [
      {className: 'xds-field'},
      {className: 'xds-field-label'},
      {className: 'xds-field-status', visualProps: ['type', 'variant']},
    ],
    vars: [
      {name: '--input-radius', description: 'Border radius of input fields', default: 'var(--radius-element)'},
    ],
  },
  notes: [
    '父组件负责生成 ID（使用 useId hook）。',
    '标签始终渲染以确保无障碍访问；使用 isLabelHidden 进行视觉隐藏。',
    '隐藏标签使用 CSS 技术，屏幕阅读器仍可访问。',
    '提供 description 时会渲染描述文本；如果同时提供 descriptionID，描述元素会获得该 ID 用于 aria-describedby 关联。',
    'isOptional 和 isRequired 互斥；同时设置两者将显示"Optional"（开发模式下发出警告）。',
    '可选/必填文本与标签显示在同一行。',
    '状态消息使用 role="status" 和 aria-live="polite" 进行屏幕阅读器播报。',
    '使用 statusVariant="attached"（默认）用于带边框的输入框；"detached" 用于复选框、开关、滑块。',
    'isDisabled 将禁用样式传递给标签（颜色 + 光标）。',
  ],
  components: [
    {
      name: 'XDSField',
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
};

/** @type {import('../docs-types').TranslationDoc} */
export const docsDense = {
  description:
    'Form field wrapper providing label, description + optional/required indicators.',
  features: [
    'Label support; required for a11y (can be visually hidden)',
    'Optional description text between label + input',
    'Optional/Required indicators w/ bullet separator',
    'Label tooltip; optional info icon w/ tooltip at end of label',
    'Disabled state; propagates disabled styling to label',
    'Status messages; attached/detached validation feedback w/ role="status" + aria-live="polite"',
    'Label properly associated w/ input via htmlFor/id',
    'Styled w/ StyleX; uses XDS design tokens for consistent styling',
  ],
  notes: [
    'Parent components generate IDs (useId hook).',
    'Label always rendered for a11y; use isLabelHidden to hide visually.',
    'Hidden label uses CSS technique accessible to screen readers.',
    'Description rendered when provided; descriptionID sets element ID for aria-describedby.',
    'isOptional + isRequired mutually exclusive; both set shows "Optional" (dev warning).',
    'Optional/Required text on same line as label.',
    'Status messages use role="status" + aria-live="polite" for screen reader announcements.',
    'statusVariant="attached" (default) for bordered inputs; "detached" for checkboxes/switches/sliders.',
    'isDisabled propagates disabled styling to label (color + cursor).',
  ],
  components: [
    {
      name: 'XDSField',
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
