/** @type {import('../docs-types').ComponentDoc} */

export const docs = {
  name: 'FormLayout',
  keywords: ["formlayout","form","fieldset","formgroup","formcontainer","fields","vertical","horizontal"],
  props: [
    {
      name: 'direction',
      type: "'vertical' | 'horizontal' | 'horizontal-labels'",
      description:
        'Controls field arrangement. Vertical stacks top-to-bottom, horizontal arranges left-to-right with equal flex-grow, and horizontal-labels uses CSS Grid with labels to the left of inputs (collapses to vertical on narrow viewports <=480px).',
      default: "'vertical'",
    },
    {
      name: 'children',
      type: 'ReactNode',
      description:
        'Form fields to arrange. Accepts XDS inputs (XDSTextInput, XDSSelector, etc.) and XDSField-wrapped custom controls.',
    },
    {
      name: 'xstyle',
      type: 'StyleXStyles',
      description:
        'StyleX styles for layout customization (margins, positioning, sizing). Must be a stylex.create() value — not an inline style object like style={{}}.',
    },
  ],
  theming: {
    targets: [
      {className: 'xds-form-layout', visualProps: ['direction']},
    ],
  },
  usage: {
    description: 'A layout container that arranges form fields with consistent spacing and direction. FormLayout handles where fields go — not state or submission. Wrap it in a <form> for that. Supports vertical (default), horizontal, and horizontal-labels directions, and can be nested to mix them.',
    bestPractices: [
      { guidance: true, description: 'Stack fields vertically for most forms — it\'s the easiest to scan top to bottom.' },
      { guidance: true, description: 'Nest a horizontal FormLayout inside a vertical one when fields naturally pair up, like First Name + Last Name or City + State + ZIP.' },
      { guidance: true, description: 'Use horizontal-labels for settings pages where labels sit beside their inputs.' },
      { guidance: false, description: 'Use FormLayout for form state or submission — it\'s just layout. Wrap it in a <form> for that.' },
      { guidance: false, description: 'Put unrelated fields side by side in a horizontal layout — save it for fields that belong together.' },
      { guidance: false, description: 'Nest horizontal-labels inside another FormLayout — it uses CSS Grid and needs to be the outermost container.' },
    ],
    anatomy: [
      {name: 'Form title', required: false, description: 'Heading that describes the purpose of the form.'},
      {name: 'Fields', required: true, description: 'Input components with labels for collecting user data.'},
      {name: 'Footer', required: false, description: 'Contains confirmation buttons such as Submit or Cancel.'},
    ],
  },
};

/** @type {import('../docs-types').ComponentDoc} */
export const docsZh = {
  name: 'FormLayout',
  props: [
    {
      name: 'direction',
      type: "'vertical' | 'horizontal' | 'horizontal-labels'",
      description:
        '控制字段排列方式。vertical 从上到下堆叠，horizontal 从左到右排列且等比弹性增长，horizontal-labels 使用 CSS Grid 将标签放在输入框左侧（在窄视口 <=480px 时折叠为垂直布局）。',
      default: "'vertical'",
    },
    {
      name: 'children',
      type: 'ReactNode',
      description:
        '要排列的表单字段。接受 XDS 输入组件（XDSTextInput、XDSSelector 等）和 XDSField 包装的自定义控件。',
    },
    {
      name: 'xstyle',
      type: 'StyleXStyles',
      description:
        '用于布局自定义（外边距、定位、尺寸）的 StyleX 样式。必须是 stylex.create() 的值，而非内联样式对象如 style={{}}。',
    },
  ],
  theming: {
    targets: [
      {className: 'xds-form-layout', visualProps: ['direction']},
    ],
  },
  usage: {
    description: 'A layout container that arranges form fields with consistent spacing and direction. FormLayout handles where fields go — not state or submission. Wrap it in a <form> for that. Supports vertical (default), horizontal, and horizontal-labels directions, and can be nested to mix them.',
    bestPractices: [
      { guidance: true, description: 'Stack fields vertically for most forms — it\'s the easiest to scan top to bottom.' },
      { guidance: true, description: 'Nest a horizontal FormLayout inside a vertical one when fields naturally pair up, like First Name + Last Name or City + State + ZIP.' },
      { guidance: true, description: 'Use horizontal-labels for settings pages where labels sit beside their inputs.' },
      { guidance: false, description: 'Use FormLayout for form state or submission — it\'s just layout. Wrap it in a <form> for that.' },
      { guidance: false, description: 'Put unrelated fields side by side in a horizontal layout — save it for fields that belong together.' },
      { guidance: false, description: 'Nest horizontal-labels inside another FormLayout — it uses CSS Grid and needs to be the outermost container.' },
    ],
    anatomy: [
      {name: 'Form title', required: false, description: 'Heading that describes the purpose of the form.'},
      {name: 'Fields', required: true, description: 'Input components with labels for collecting user data.'},
      {name: 'Footer', required: false, description: 'Contains confirmation buttons such as Submit or Cancel.'},
    ],
  },
};

/** @type {import('../docs-types').TranslationDoc} */
export const docsDense = {
  description:
    'Layout container for form fields w/ consistent spacing + direction.',
  usage: {
    description: 'A layout container that arranges form fields with consistent spacing and direction. FormLayout handles where fields go — not state or submission. Wrap it in a <form> for that. Supports vertical (default), horizontal, and horizontal-labels directions, and can be nested to mix them.',
    bestPractices: [
      { guidance: true, description: 'Stack fields vertically for most forms — it\'s the easiest to scan top to bottom.' },
      { guidance: true, description: 'Nest a horizontal FormLayout inside a vertical one when fields naturally pair up, like First Name + Last Name or City + State + ZIP.' },
      { guidance: true, description: 'Use horizontal-labels for settings pages where labels sit beside their inputs.' },
      { guidance: false, description: 'Use FormLayout for form state or submission — it\'s just layout. Wrap it in a <form> for that.' },
      { guidance: false, description: 'Put unrelated fields side by side in a horizontal layout — save it for fields that belong together.' },
      { guidance: false, description: 'Nest horizontal-labels inside another FormLayout — it uses CSS Grid and needs to be the outermost container.' },
    ],
    anatomy: [
      {name: 'Form title', required: false, description: 'Heading that describes the purpose of the form.'},
      {name: 'Fields', required: true, description: 'Input components with labels for collecting user data.'},
      {name: 'Footer', required: false, description: 'Contains confirmation buttons such as Submit or Cancel.'},
    ],
  },
  propDescriptions: {
    direction: 'Field arrangement. Vertical stacks top-to-bottom, horizontal arranges left-to-right w/ equal flex-grow, horizontal-labels uses CSS Grid w/ labels left of inputs (collapses <=480px).',
    children: 'Form fields to arrange. Accepts XDS inputs + XDSField-wrapped custom controls.',
    xstyle: 'StyleX styles for layout customization. Must be stylex.create() value.',
  },
};
