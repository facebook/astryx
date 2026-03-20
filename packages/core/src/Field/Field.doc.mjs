/** @type {import('../docs-types').ComponentDoc} */

export const docs = {
  name: 'Field',
  description:
    'A form field wrapper component that provides label, description, and optional/required indicators.',
  features: [
    'Label Support — required label for accessibility (can be visually hidden)',
    'Description — optional description text displayed between the label and input',
    'Optional/Required Indicators — display "Optional" or "Required" text with bullet separator',
    'Label Tooltip — optional info icon with tooltip at end of label',
    'Accessible — label properly associated with input via htmlFor/id',
    'Styled with StyleX — uses XDS design tokens for consistent styling',
  ],
  examples: [
    {
      label: 'Basic usage',
      code: `const id = useId();
<XDSField label="Email" inputID={id}>
  <input id={id} />
</XDSField>`,
    },
    {
      label: 'With description',
      code: `const inputId = useId();
const descId = useId();
<XDSField
  label="Email"
  description="We'll never share your email"
  inputID={inputId}
  descriptionID={descId}>
  <input id={inputId} aria-describedby={descId} />
</XDSField>`,
    },
    {
      label: 'Hidden label (screen readers only)',
      code: `const searchId = useId();
<XDSField label="Search" isLabelHidden inputID={searchId}>
  <input id={searchId} placeholder="Search..." />
</XDSField>`,
    },
    {
      label: 'Optional field',
      code: `const nicknameId = useId();
<XDSField label="Nickname" isOptional inputID={nicknameId}>
  <input id={nicknameId} placeholder="Enter your nickname" />
</XDSField>`,
    },
    {
      label: 'Required field',
      code: `const usernameId = useId();
<XDSField label="Username" isRequired inputID={usernameId}>
  <input id={usernameId} placeholder="Enter your username" />
</XDSField>`,
    },
    {
      label: 'Description with optional indicator (shows bullet separator)',
      code: `const bioId = useId();
const bioDescId = useId();
<XDSField
  label="Bio"
  description="Tell us about yourself"
  isOptional
  inputID={bioId}
  descriptionID={bioDescId}>
  <input id={bioId} aria-describedby={bioDescId} />
</XDSField>`,
    },
  ],
  theming: {
    targets: [
      {className: 'xds-field'},
      {className: 'xds-field-label'},
      {className: 'xds-field-status', visualProps: ['type', 'variant']},
    ],
    vars: [
      {name: '--input-radius', description: 'Border radius of input fields', default: 'var(--radius-2)'},
    ],
  },
  notes: [
    'Parent components are responsible for generating IDs (using the useId hook).',
    'Label is always rendered for accessibility; use isLabelHidden to hide visually.',
    'Hidden label uses a CSS technique that remains accessible to screen readers.',
    'Description is rendered when provided; if descriptionID is also provided, the description element gets that ID for aria-describedby association.',
    'isOptional and isRequired are mutually exclusive; setting both will show "Optional".',
    'Optional/Required text appears on the same line as the label.',
  ],
  components: [
    {
      name: 'XDSField',
      description:
        'Form field wrapper that provides label, description, and optional/required indicators.',
      examples: [
        {
          label: 'Basic',
          code: `<XDSField label="Email" inputID={id}>
  <input id={id} />
</XDSField>`,
        },
      ],
      props: [
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
          name: 'xstyle',
          type: 'StyleXStyles',
          description:
            'StyleX styles for layout customization (margins, positioning, sizing). Must be a stylex.create() value — not an inline style object like style={{}}.',
        },
      ],
    },
    {
      name: 'XDSFieldLabel',
      description:
        'Standalone label component with optional/required indicators and tooltip support.',
      examples: [
        {
          label: 'Basic',
          code: '<XDSFieldLabel label="Username" inputID={id} isRequired />',
        },
      ],
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
      examples: [
        {
          label: 'Error',
          code: '<XDSFieldStatus type="error" message="This field is required" />',
        },
      ],
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
    '无障碍 - 通过 htmlFor/id 将标签与输入框正确关联',
    '使用 StyleX 样式 - 使用 XDS 设计令牌实现一致的样式',
  ],
  examples: [
    {
      label: '基础用法',
      code: `const id = useId();
<XDSField label="Email" inputID={id}>
  <input id={id} />
</XDSField>`,
    },
    {
      label: '带描述',
      code: `const inputId = useId();
const descId = useId();
<XDSField
  label="Email"
  description="We'll never share your email"
  inputID={inputId}
  descriptionID={descId}>
  <input id={inputId} aria-describedby={descId} />
</XDSField>`,
    },
    {
      label: '隐藏标签（仅屏幕阅读器可见）',
      code: `const searchId = useId();
<XDSField label="Search" isLabelHidden inputID={searchId}>
  <input id={searchId} placeholder="Search..." />
</XDSField>`,
    },
    {
      label: '可选字段',
      code: `const nicknameId = useId();
<XDSField label="Nickname" isOptional inputID={nicknameId}>
  <input id={nicknameId} placeholder="Enter your nickname" />
</XDSField>`,
    },
    {
      label: '必填字段',
      code: `const usernameId = useId();
<XDSField label="Username" isRequired inputID={usernameId}>
  <input id={usernameId} placeholder="Enter your username" />
</XDSField>`,
    },
    {
      label: '带描述和可选指示器（显示圆点分隔符）',
      code: `const bioId = useId();
const bioDescId = useId();
<XDSField
  label="Bio"
  description="Tell us about yourself"
  isOptional
  inputID={bioId}
  descriptionID={bioDescId}>
  <input id={bioId} aria-describedby={bioDescId} />
</XDSField>`,
    },
  ],
  theming: {
    targets: [
      {className: 'xds-field'},
      {className: 'xds-field-label'},
      {className: 'xds-field-status', visualProps: ['type', 'variant']},
    ],
    vars: [
      {name: '--input-radius', description: 'Border radius of input fields', default: 'var(--radius-2)'},
    ],
  },
  notes: [
    '父组件负责生成 ID（使用 useId hook）。',
    '标签始终渲染以确保无障碍访问；使用 isLabelHidden 进行视觉隐藏。',
    '隐藏标签使用 CSS 技术，屏幕阅读器仍可访问。',
    '提供 description 时会渲染描述文本；如果同时提供 descriptionID，描述元素会获得该 ID 用于 aria-describedby 关联。',
    'isOptional 和 isRequired 互斥；同时设置两者将显示"Optional"。',
    '可选/必填文本与标签显示在同一行。',
  ],
  components: [
    {
      name: 'XDSField',
      description:
        '表单字段包装器，提供标签、描述以及可选/必填指示器。',
      examples: [
        {
          label: '基础用法',
          code: `<XDSField label="Email" inputID={id}>
  <input id={id} />
</XDSField>`,
        },
      ],
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
          name: 'xstyle',
          type: 'StyleXStyles',
          description:
            '用于布局自定义（外边距、定位、尺寸）的 StyleX 样式。必须是 stylex.create() 的值，而非内联样式对象如 style={{}}。',
        },
      ],
    },
    {
      name: 'XDSFieldLabel',
      description:
        '独立的标签组件，支持可选/必填指示器和工具提示。',
      examples: [
        {
          label: '基础用法',
          code: '<XDSFieldLabel label="Username" inputID={id} isRequired />',
        },
      ],
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
      examples: [
        {
          label: '错误状态',
          code: '<XDSFieldStatus type="error" message="This field is required" />',
        },
      ],
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
    'Label properly associated w/ input via htmlFor/id',
    'Styled w/ StyleX; uses XDS design tokens for consistent styling',
  ],
  notes: [
    'Parent components generate IDs (useId hook).',
    'Label always rendered for a11y; use isLabelHidden to hide visually.',
    'Hidden label uses CSS technique accessible to screen readers.',
    'Description rendered when provided; descriptionID sets element ID for aria-describedby.',
    'isOptional + isRequired mutually exclusive; both set shows "Optional".',
    'Optional/Required text on same line as label.',
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
        description: 'Description text between label + input.',
        descriptionID: 'ID for description element (use for aria-describedby on input).',
        isOptional: 'Field optional (mutually exclusive w/ isRequired).',
        isRequired: 'Field required (mutually exclusive w/ isOptional).',
        labelIcon: 'Icon before label text.',
        labelTooltip: 'Tooltip text in info icon at end of label.',
        xstyle: 'StyleX styles for layout customization. Must be stylex.create() value.',
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
