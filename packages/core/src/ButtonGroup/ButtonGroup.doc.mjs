// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @type {import('../docs-types').ComponentDoc} */

export const docs = {
  name: 'ButtonGroup',
  displayName: 'Button Group',
  group: 'Button',
  category: 'Action',
  keywords: ["button-group","connected","split","toolbar","actions","grouped","buttons"],
  playground: {
    defaults: {
      label: 'Actions',
    },
  },
  theming: {
    targets: [
      {className: 'astryx-button-group', visualProps: ['size', 'orientation']},
    ],
  },
  components: [
    {
      name: 'ButtonGroup',
      displayName: 'Button Group',
      description: 'Groups multiple buttons together with connected styling: shared borders, proper border-radius handling (only on outer edges), and horizontal or vertical orientation.',
      props: [
        {name: 'children', type: 'ReactNode', description: 'Button or IconButton children.', required: true, slotElements: [{__element: 'Button', props: {label: 'Action'}}]},
        {name: 'label', type: 'string', description: 'Accessible label for the group (aria-label).', required: true},
        {name: 'orientation', type: "'horizontal' | 'vertical'", description: 'Layout direction of the button group.', default: "'horizontal'"},
        {name: 'size', type: "'sm' | 'md' | 'lg'", description: 'Default size for buttons in the group. Individual buttons can override.', default: "'md'"},
        {name: 'isDisabled', type: 'boolean', description: 'Whether all buttons in the group are disabled.', default: 'false'},
        {name: 'ref', type: 'React.Ref<HTMLDivElement>', description: 'Ref forwarded to the root element.'},
        {name: 'xstyle', type: 'StyleXStyles', description: 'StyleX styles for layout customization. Must be a stylex.create() value.'},
        {name: 'data-testid', type: 'string', description: 'Test selector for automated testing frameworks.'},
      ],
    },
  ],
  usage: {
    description:
      'ButtonGroup joins related actions into a single connected control. Use it when multiple buttons represent related choices or operations that belong together visually, like copy/cut/paste, or undo/redo.',
    bestPractices: [
      {guidance: true, description: 'Group buttons that perform related actions on the same object, like copy, cut, paste on selected text.'},
      {guidance: true, description: 'Use the same variant for all buttons in a group so they look like a single connected unit.'},
      {guidance: true, description: 'Keep groups small (2–4 buttons). For more actions, use a Toolbar or DropdownMenu instead.'},
      {guidance: false, description: "Don't mix wildly different actions. A Save button next to a Delete button in the same group is confusing."},
      {guidance: false, description: "Don't use ButtonGroup for navigation. Use SegmentedControl or TabList for switching between views."},
      {guidance: false, description: "Don't nest ButtonGroups. If you need multiple groups, place them side by side with a gap."},
    ],
    anatomy: [
      {name: 'Button', required: true, description: 'One or more Button or IconButton children that form the connected group.'},
      {name: 'Divider', required: false, description: 'A thin border between buttons, rendered automatically by the group.'},
    ],
  },
};

/** @type {import('../docs-types').TranslationDoc} */
export const docsZh = {
  components: [
    {
      name: 'ButtonGroup',
      displayName: 'Button Group',
      description: '将多个按钮组合在一起，带有连接样式：共享边框、正确的圆角处理（仅外边缘），以及水平或垂直方向。',
      propDescriptions: {
        children: 'Button 或 IconButton 子元素。',
        label: '按钮组的无障碍标签 (aria-label)。',
        orientation: '按钮组的布局方向。',
        size: '组内按钮的默认尺寸。单个按钮可覆盖。',
        isDisabled: '组内所有按钮是否禁用。',
        ref: '转发到根元素的引用。',
        xstyle: 'StyleX 样式，用于布局自定义。必须是 stylex.create() 的值。',
        'data-testid': '自动化测试的选择器。',
      },
    },
  ],
  usage: {
    description:
      'ButtonGroup 将相关操作连接成一个控件。当多个按钮表示对同一对象的相关操作时使用，如复制/剪切/粘贴，或撤销/重做。',
    bestPractices: [
      {guidance: true, description: '将对同一对象执行相关操作的按钮分组，如对选中文本的复制、剪切、粘贴。'},
      {guidance: true, description: '组内所有按钮使用相同的变体，使其看起来像一个连接的整体。'},
      {guidance: true, description: '保持组较小（2-4 个按钮）。更多操作请使用工具栏或下拉菜单。'},
      {guidance: false, description: '不要混合差异很大的操作，将保存按钮和删除按钮放在同一组中会令人困惑。'},
      {guidance: false, description: '不要使用 ButtonGroup 进行导航，使用 SegmentedControl 或 TabList 切换视图。'},
      {guidance: false, description: '不要嵌套 ButtonGroup。如需多个组，请并排放置并留有间隔。'},
    ],
    anatomy: [
      {name: '按钮', required: true, description: '一个或多个 Button 或 IconButton 子元素，形成连接的组。'},
      {name: '分隔线', required: false, description: '按钮之间的细边框，由组自动渲染。'},
    ],
  },
};

/** @type {import('../docs-types').TranslationDoc} */
export const docsDense = {
  description: 'connected button group w/ shared borders, outer-only radius, horizontal/vertical',
  usage: {
    description:
      'ButtonGroup joins related actions into a single connected control. Use for related operations on the same object.',
    bestPractices: [
      {guidance: true, description: 'Group related actions on the same object: copy/cut/paste, undo/redo.'},
      {guidance: true, description: 'Same variant for all buttons to look like one unit.'},
      {guidance: true, description: 'Keep groups small (2–4 buttons). Use Toolbar or DropdownMenu for more.'},
      {guidance: false, description: "Don't mix unrelated actions in one group."},
      {guidance: false, description: "Don't use for navigation. Use SegmentedControl or TabList."},
      {guidance: false, description: "Don't nest ButtonGroups."},
    ],
  },
  components: [
    {
      name: 'ButtonGroup',
      displayName: 'Button Group',
      description: 'connected button group w/ shared borders, outer-only radius',
      propDescriptions: {
        children: 'Button or IconButton children',
        label: 'a11y label (aria-label)',
        orientation: 'layout direction',
        size: 'default btn size; individual btns override',
        isDisabled: 'all btns disabled',
        xstyle: 'StyleX layout styles; must be stylex.create() value',
        'data-testid': 'test selector',
      },
    },
  ],
};
