/** @type {import('../docs-types').ComponentDoc} */

export const docs = {
  name: 'ToggleButton',
  description:
    'A button that toggles between pressed and unpressed states, with optional icon swap and group integration for single or multi-select behavior.',
  showcase: {
    aspectRatio: 1,
    code: '<XDSToggleButton label="Bold" isIconOnly />',
  },
  keywords: ["toggle","togglebutton","pressed","toolbar","formatting","segmented","button-group","exclusive","multi-select"],
  features: [
    'Controlled toggle via isPressed/onPressedChange',
    'Icon swap between pressed and unpressed states via pressedIcon',
    'Font weight emphasis on press with width reservation to prevent layout shift',
    'Async action support via onPressedChangeAction with loading spinner',
    'Group integration via XDSToggleButtonGroup for single or multi-select',
    'Discriminated union on type: single (string | null) or multiple (string[])',
    'Horizontal and vertical group orientation',
    'Built on XDSButton with all its size, disabled, and tooltip support',
  ],
  theming: {
    targets: [
      {className: 'xds-toggle-button-group'},
    ],
  },
  accessibility: [
    'Uses aria-pressed on the toggle button for screen reader state announcement.',
    'Group uses role="group" with aria-label from the label prop.',
  ],
  keyboard: 'Space/Enter toggles pressed state; Tab moves between buttons in a group',  components: [
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
    summary: 'A button that switches between two persistent states, typically active and inactive.',
    content: `## When to use

- When an action has two persistent states and can be undone.
- Use a group of toggle buttons for multiple independent two-state actions.
- Use a toggle button group for 3 or more mutually exclusive states.

## Best practices

- Do: Convey state through color change, bolded text, or a filled icon.
- Do: Keep the label the same between states.`,
  },
};

/** @type {import('../docs-types').TranslationDoc} */
export const docsZh = {
  description:
    '在按下和未按下状态之间切换的按钮，支持图标切换和分组集成，用于单选或多选行为。',
  features: [
    '通过 isPressed/onPressedChange 实现受控切换',
    '通过 pressedIcon 在按下和未按下状态之间切换图标',
    '按下时字重加粗，并预留宽度防止布局偏移',
    '通过 onPressedChangeAction 支持异步操作，显示加载动画',
    '通过 XDSToggleButtonGroup 实现分组集成，支持单选或多选',
    'type 判别联合类型：single (string | null) 或 multiple (string[])',
    '支持水平和垂直方向的分组布局',
    '基于 XDSButton 构建，继承其尺寸、禁用和提示功能',
  ],
  accessibility: [
    '使用 aria-pressed 向屏幕阅读器宣告切换按钮状态。',
    '分组使用 role="group" 并通过 label 属性设置 aria-label。',
  ],
  keyboard: 'Space/Enter 切换按下状态；Tab 在分组中的按钮间移动焦点',
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
};

/** @type {import('../docs-types').TranslationDoc} */
export const docsDense = {
  description: 'toggle btn w/ pressed/unpressed states, icon swap, group integration for single/multi-select',
  features: [
    'controlled toggle via isPressed/onPressedChange',
    'icon swap pressed/unpressed via pressedIcon',
    'font weight emphasis on press w/ width reservation (no layout shift)',
    'async action via onPressedChangeAction w/ loading spinner',
    'group integration via XDSToggleButtonGroup for single/multi-select',
    'discriminated union on type: single (string|null) or multiple (string[])',
    'horizontal+vertical group orientation',
    'built on XDSButton w/ size, disabled, tooltip support',
  ],
  accessibility: [
    'aria-pressed on toggle btn for screen reader state',
    'group uses role="group" w/ aria-label from label prop',
  ],
  keyboard: 'Space/Enter toggles; Tab moves between btns in group',
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
