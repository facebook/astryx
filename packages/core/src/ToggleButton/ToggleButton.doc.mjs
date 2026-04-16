/** @type {import('../docs-types').ComponentDoc} */

export const docs = {
  name: 'ToggleButton',
  keywords: ["toggle","togglebutton","pressed","toolbar","formatting","segmented","button-group","exclusive","multi-select"],
  theming: {
    targets: [
      {className: 'xds-toggle-button-group'},
    ],
  },
  components: [
    {
      name: 'XDSToggleButton',
      description: 'A button that toggles between pressed and unpressed states. Thin wrapper over XDSButton with controlled toggle pattern, icon swap, and font weight emphasis.',
      props: [
        {name: 'label', type: 'string', description: 'Accessible label for the button. Used as visible text, or as aria-label for icon-only buttons.', required: true},
        {name: 'isPressed', type: 'boolean', description: 'Whether the button is currently pressed. Ignored when inside a group.'},
        {name: 'onPressedChange', type: '(isPressed: boolean) => void', description: 'Called when pressed state should change. Ignored when inside a group.'},
        {name: 'onPressedChangeAction', type: '(isPressed: boolean) => Promise<void>', description: 'Async action handler for API-backed toggles. Shows loading spinner while pending.'},
        {name: 'size', type: "'sm' | 'md' | 'lg'", description: 'Button size. Defaults to group size when inside a group.', default: "'md'"},
        {name: 'isDisabled', type: 'boolean', description: 'Whether the button is disabled.', default: 'false'},
        {name: 'isLoading', type: 'boolean', description: 'Whether the button shows a loading spinner.', default: 'false'},
        {name: 'icon', type: 'ReactNode', description: 'Icon element. When provided without children, button becomes icon-only with tooltip from label.'},
        {name: 'pressedIcon', type: 'ReactNode', description: 'Icon shown when pressed. Falls back to icon if not provided.'},
        {name: 'children', type: 'ReactNode', description: 'Visible content. If omitted with icon, button becomes icon-only.'},
        {name: 'tooltip', type: 'string', description: 'Tooltip text shown on hover.'},
        {name: 'value', type: 'string', description: 'Value identifier when used inside XDSToggleButtonGroup. Required in groups.'},
        {name: 'data-testid', type: 'string', description: 'Test selector for automated testing frameworks.'},
      ],    },
    {
      name: 'XDSToggleButtonGroup',
      description: 'Groups toggle buttons for exclusive (single) or multi-select behavior. Uses discriminated union on type for type-safe value/onChange.',
      props: [
        {name: 'children', type: 'ReactNode', description: 'XDSToggleButton children.', required: true},
        {name: 'label', type: 'string', description: 'Accessible label for the group (aria-label).', required: true},
        {name: 'type', type: "'single' | 'multiple'", description: 'Selection mode. Single allows one active button, multiple allows many.', default: "'single'"},
        {name: 'value', type: 'string | null | string[]', description: 'Currently selected value(s). Type depends on selection mode.', required: true},
        {name: 'onChange', type: '(value: string | null | string[]) => void', description: 'Called when selection changes.', required: true},
        {name: 'orientation', type: "'horizontal' | 'vertical'", description: 'Layout direction of the button group.', default: "'horizontal'"},
        {name: 'size', type: "'sm' | 'md' | 'lg'", description: 'Default size for buttons in the group. Individual buttons can override.', default: "'md'"},
        {name: 'isDisabled', type: 'boolean', description: 'Whether all buttons in the group are disabled.', default: 'false'},
        {name: 'xstyle', type: 'StyleXStyles', description: 'StyleX styles for layout customization (margins, positioning, sizing). Must be a stylex.create() value.'},
        {name: 'data-testid', type: 'string', description: 'Test selector for automated testing frameworks.'},
      ],
    },
  ],
  usage: {
    description:
      'ToggleButton is a button that switches between pressed and unpressed states to represent a persistent on/off choice. Use it standalone for binary actions like bold or mute, or within a ToggleButtonGroup for single-select or multi-select toolbar options.',
    bestPractices: [
      { guidance: true, description: 'Convey the pressed state through a filled icon, bold text, or color change so users can see the current state at a glance.' },
      { guidance: true, description: 'Keep the label the same between pressed and unpressed states — let the visual treatment communicate the change.' },
      { guidance: false, description: 'Use a ToggleButton for actions that navigate to another page or trigger a one-time event — use Button instead.' },
      { guidance: false, description: 'Mix ToggleButtons with regular Buttons in the same group.' },
    ],
  },
};

/** @type {import('../docs-types').TranslationDoc} */
export const docsZh = {
  components: [
    {
      name: 'XDSToggleButton',
      description: '在按下和未按下状态之间切换的按钮。XDSButton 的轻量封装，添加受控切换模式、图标切换和字重加粗。',
      propDescriptions: {
        label: '按钮的无障碍标签。作为可见文本或仅图标按钮的 aria-label。',
        isPressed: '按钮是否处于按下状态。在分组内时被忽略。',
        onPressedChange: '按下状态变更时的回调。在分组内时被忽略。',
        onPressedChangeAction: 'API 调用的异步操作处理器。等待期间显示加载动画。',
        size: '按钮尺寸。在分组内时默认使用分组尺寸。',
        isDisabled: '按钮是否禁用。',
        isLoading: '按钮是否显示加载动画。',
        icon: '图标元素。无 children 时按钮变为仅图标模式。',
        pressedIcon: '按下时显示的图标。未提供时回退到 icon。',
        children: '可见内容。与 icon 同时省略时按钮变为仅图标模式。',
        tooltip: '悬停时显示的提示文本。',
        value: '在 XDSToggleButtonGroup 内使用的值标识符。',
        'data-testid': '自动化测试的选择器。',
      },
    },
    {
      name: 'XDSToggleButtonGroup',
      description: '将切换按钮分组，支持单选或多选行为。通过 type 判别联合类型实现类型安全。',
      propDescriptions: {
        children: 'XDSToggleButton 子元素。',
        label: '分组的无障碍标签 (aria-label)。',
        type: '选择模式。single 允许单个激活，multiple 允许多个。',
        value: '当前选中的值。类型取决于选择模式。',
        onChange: '选择变更时的回调。',
        orientation: '按钮组的布局方向。',
        size: '分组内按钮的默认尺寸。单个按钮可覆盖。',
        isDisabled: '分组内所有按钮是否禁用。',
        xstyle: 'StyleX 样式，用于布局自定义。必须是 stylex.create() 的值。',
        'data-testid': '自动化测试的选择器。',
      },
    },
  ],
  usage: {
    description:
      'ToggleButton is a button that switches between pressed and unpressed states to represent a persistent on/off choice. Use it standalone for binary actions like bold or mute, or within a ToggleButtonGroup for single-select or multi-select toolbar options.',
    bestPractices: [
      { guidance: true, description: 'Convey the pressed state through a filled icon, bold text, or color change so users can see the current state at a glance.' },
      { guidance: true, description: 'Keep the label the same between pressed and unpressed states — let the visual treatment communicate the change.' },
      { guidance: false, description: 'Use a ToggleButton for actions that navigate to another page or trigger a one-time event — use Button instead.' },
      { guidance: false, description: 'Mix ToggleButtons with regular Buttons in the same group.' },
    ],
  },
};

/** @type {import('../docs-types').TranslationDoc} */
export const docsDense = {
  description: 'toggle btn w/ pressed/unpressed states, icon swap, group integration for single/multi-select',
  usage: {
    description:
      'ToggleButton is a button that switches between pressed and unpressed states to represent a persistent on/off choice. Use it standalone for binary actions like bold or mute, or within a ToggleButtonGroup for single-select or multi-select toolbar options.',
    bestPractices: [
      { guidance: true, description: 'Convey the pressed state through a filled icon, bold text, or color change so users can see the current state at a glance.' },
      { guidance: true, description: 'Keep the label the same between pressed and unpressed states — let the visual treatment communicate the change.' },
      { guidance: false, description: 'Use a ToggleButton for actions that navigate to another page or trigger a one-time event — use Button instead.' },
      { guidance: false, description: 'Mix ToggleButtons with regular Buttons in the same group.' },
    ],
  },
  components: [
    {
      name: 'XDSToggleButton',
      description: 'toggle btn w/ controlled pattern, icon swap, font weight emphasis; wraps XDSButton',
      propDescriptions: {
        label: 'a11y label; visible text or aria-label for icon-only',
        isPressed: 'pressed state; ignored in group',
        onPressedChange: 'pressed state change cb; ignored in group',
        onPressedChangeAction: 'async toggle handler w/ loading spinner',
        size: 'btn size; defaults to group size in group',
        isDisabled: 'disabled state',
        isLoading: 'shows loading spinner',
        icon: 'icon element; icon-only mode w/o children',
        pressedIcon: 'pressed icon; falls back to icon',
        children: 'visible content; omit w/ icon for icon-only',
        tooltip: 'hover tooltip text',
        value: 'value id for group usage',
        'data-testid': 'test selector',
      },
    },
    {
      name: 'XDSToggleButtonGroup',
      description: 'groups toggle btns for exclusive/multi-select; discriminated union on type',
      propDescriptions: {
        children: 'XDSToggleButton children',
        label: 'a11y label (aria-label)',
        type: 'selection mode: single or multiple',
        value: 'selected value(s); type depends on mode',
        onChange: 'selection change cb',
        orientation: 'layout direction',
        size: 'default btn size; individual btns override',
        isDisabled: 'all btns disabled',
        xstyle: 'StyleX layout styles; must be stylex.create() value',
        'data-testid': 'test selector',
      },
    },
  ],
};
