/** @type {import('../docs-types').ComponentDoc} */

export const docs = {
  name: 'FormLayout',
  description:
    'A spatial layout container for arranging form fields with consistent spacing and direction.',
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
  examples: [
    {
      label: 'Vertical layout (default)',
      code: `<XDSFormLayout>
  <XDSTextInput label="Name" value={name} onChange={setName} />
  <XDSTextInput label="Email" value={email} onChange={setEmail} />
</XDSFormLayout>`,
    },
    {
      label: 'Horizontal layout for related fields',
      code: `<XDSFormLayout direction="horizontal">
  <XDSTextInput label="First Name" value={first} onChange={setFirst} />
  <XDSTextInput label="Last Name" value={last} onChange={setLast} />
</XDSFormLayout>`,
    },
    {
      label: 'Horizontal labels for settings panels',
      code: `<XDSFormLayout direction="horizontal-labels">
  <XDSTextInput label="Display Name" value={name} onChange={setName} />
  <XDSSelector label="Timezone" value={tz} onChange={setTz} options={tzs} />
</XDSFormLayout>`,
    },
    {
      label: 'Nested layouts',
      code: `<XDSFormLayout direction="vertical">
  <XDSFormLayout direction="horizontal">
    <XDSTextInput label="First Name" value={first} onChange={setFirst} />
    <XDSTextInput label="Last Name" value={last} onChange={setLast} />
  </XDSFormLayout>
  <XDSTextInput label="Email" value={email} onChange={setEmail} />
</XDSFormLayout>`,
    },
    {
      label: 'Dialog composition via HTML form attribute',
      code: `<XDSDialog>
  <form id="edit-form" onSubmit={handleSubmit}>
    <XDSFormLayout>
      <XDSTextInput label="Name" value={name} onChange={setName} />
    </XDSFormLayout>
  </form>
  <XDSDialogFooter>
    <XDSButton label="Save" type="submit" form="edit-form" />
  </XDSDialogFooter>
</XDSDialog>`,
    },
  ],
  features: [
    "Three layout modes: 'vertical' (default), 'horizontal', and 'horizontal-labels'",
    'Direction context via XDSFormLayoutContext — children can read the current layout direction',
    'Responsive: horizontal-labels collapses to vertical on narrow viewports (<=480px)',
    'Nestable: inner FormLayout overrides context for its children',
    'Purely spatial: does not manage form state or render <form> — form submission is separate',
  ],
  theming: {
    targets: [
      {className: 'xds-form-layout', visualProps: ['direction']},
    ],
  },
  notes: [
    'Renders a <div>, not a <form>. Use a separate <form> element and connect submit buttons via the HTML form attribute.',
    'XDSFormLayoutContext provides { direction } to children. Import from @xds/core/FormLayout to read layout direction in custom components.',
    'Also accepts standard HTML div attributes (id, role, aria-*, etc.) via rest props.',
  ],
};

/** @type {import('../docs-types').ComponentDoc} */
export const docsZh = {
  name: 'FormLayout',
  description:
    '用于以一致的间距和方向排列表单字段的空间布局容器。',
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
  examples: [
    {
      label: '垂直布局（默认）',
      code: `<XDSFormLayout>
  <XDSTextInput label="Name" value={name} onChange={setName} />
  <XDSTextInput label="Email" value={email} onChange={setEmail} />
</XDSFormLayout>`,
    },
    {
      label: '相关字段的水平布局',
      code: `<XDSFormLayout direction="horizontal">
  <XDSTextInput label="First Name" value={first} onChange={setFirst} />
  <XDSTextInput label="Last Name" value={last} onChange={setLast} />
</XDSFormLayout>`,
    },
    {
      label: '设置面板的水平标签',
      code: `<XDSFormLayout direction="horizontal-labels">
  <XDSTextInput label="Display Name" value={name} onChange={setName} />
  <XDSSelector label="Timezone" value={tz} onChange={setTz} options={tzs} />
</XDSFormLayout>`,
    },
    {
      label: '嵌套布局',
      code: `<XDSFormLayout direction="vertical">
  <XDSFormLayout direction="horizontal">
    <XDSTextInput label="First Name" value={first} onChange={setFirst} />
    <XDSTextInput label="Last Name" value={last} onChange={setLast} />
  </XDSFormLayout>
  <XDSTextInput label="Email" value={email} onChange={setEmail} />
</XDSFormLayout>`,
    },
    {
      label: '通过 HTML form 属性组合对话框',
      code: `<XDSDialog>
  <form id="edit-form" onSubmit={handleSubmit}>
    <XDSFormLayout>
      <XDSTextInput label="Name" value={name} onChange={setName} />
    </XDSFormLayout>
  </form>
  <XDSDialogFooter>
    <XDSButton label="Save" type="submit" form="edit-form" />
  </XDSDialogFooter>
</XDSDialog>`,
    },
  ],
  features: [
    '三种布局模式：\'vertical\'（默认）、\'horizontal\' 和 \'horizontal-labels\'',
    '通过 XDSFormLayoutContext 提供方向上下文 - 子组件可以读取当前布局方向',
    '响应式：horizontal-labels 在窄视口（<=480px）时折叠为垂直布局',
    '可嵌套：内部 FormLayout 会为其子组件覆盖上下文',
    '纯空间布局：不管理表单状态或渲染 <form> - 表单提交是独立的',
  ],
  theming: {
    targets: [
      {className: 'xds-form-layout', visualProps: ['direction']},
    ],
  },
  notes: [
    '渲染 <div> 而非 <form>。使用单独的 <form> 元素，并通过 HTML form 属性连接提交按钮。',
    'XDSFormLayoutContext 向子组件提供 { direction }。从 @xds/core/FormLayout 导入以在自定义组件中读取布局方向。',
    '还通过 rest props 接受标准 HTML div 属性（id、role、aria-* 等）。',
  ],
};

/** @type {import('../docs-types').TranslationDoc} */
export const docsDense = {
  description:
    'Spatial layout container for arranging form fields w/ consistent spacing + direction.',
  features: [
    "Three layout modes: 'vertical' (default), 'horizontal', 'horizontal-labels'",
    'Direction context via XDSFormLayoutContext; children read current layout direction',
    'Responsive: horizontal-labels collapses to vertical on narrow viewports (<=480px)',
    'Nestable: inner FormLayout overrides context for children',
    'Purely spatial: no form state management or <form> rendering',
  ],
  notes: [
    'Renders <div> not <form>. Use separate <form> + HTML form attribute for submit buttons.',
    'XDSFormLayoutContext provides { direction } to children. Import from @xds/core/FormLayout.',
    'Accepts standard HTML div attributes (id, role, aria-*) via rest props.',
  ],
  propDescriptions: {
    direction: 'Field arrangement. Vertical stacks top-to-bottom, horizontal arranges left-to-right w/ equal flex-grow, horizontal-labels uses CSS Grid w/ labels left of inputs (collapses <=480px).',
    children: 'Form fields to arrange. Accepts XDS inputs + XDSField-wrapped custom controls.',
    xstyle: 'StyleX styles for layout customization. Must be stylex.create() value.',
  },
};
