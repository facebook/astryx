/** @type {import('../docs-types').ComponentDoc} */

export const docs = {
  name: 'SegmentedControl',
  description:
    'Segmented button group for single selection with radio group semantics. Visually resembles a tab bar but controls a value, not a view.',
  features: [
    'Context-based communication: XDSSegmentedControlContext passes value/onChange/size/isDisabled from parent to children',
    'Radio group semantics: role="radiogroup" with role="radio" items and aria-checked',
    'Roving tabindex: only the selected item is tabbable (tabIndex=0), others are tabIndex=-1',
    'Keyboard navigation: ArrowLeft/ArrowRight navigate + select, Home/End jump to first/last, wraps around',
    'Animated indicator: selected item has a raised surface background with box-shadow',
    'Icon + label or icon-only items (isLabelHidden hides label visually, keeps it as aria-label)',
    'Size variants: sm (compact for toolbars), md (default), lg (larger touch targets)',
    'Disabled state: entire group or individual items via aria-disabled (maintains focusability)',
    'Hover state: unselected items show overlay on hover with @media (hover: hover) guard',
  ],
  examples: [
    {
      label: 'Basic',
      code: `<XDSSegmentedControl value={view} onChange={setView} label="View mode">
  <XDSSegmentedControlItem value="grid" label="Grid" />
  <XDSSegmentedControlItem value="list" label="List" />
  <XDSSegmentedControlItem value="table" label="Table" />
</XDSSegmentedControl>`,
    },
    {
      label: 'With icons',
      code: `<XDSSegmentedControl value={view} onChange={setView} label="View mode">
  <XDSSegmentedControlItem value="grid" label="Grid" icon={<XDSIcon icon={Squares2X2Icon} color="inherit" />} />
  <XDSSegmentedControlItem value="list" label="List" icon={<XDSIcon icon={ListBulletIcon} color="inherit" />} />
  <XDSSegmentedControlItem value="table" label="Table" icon={<XDSIcon icon={TableCellsIcon} color="inherit" />} />
</XDSSegmentedControl>`,
    },
    {
      label: 'Icon-only compact',
      code: `<XDSSegmentedControl value={view} onChange={setView} label="View mode" size="sm">
  <XDSSegmentedControlItem value="grid" label="Grid" isLabelHidden icon={<XDSIcon icon={Squares2X2Icon} color="inherit" />} />
  <XDSSegmentedControlItem value="list" label="List" isLabelHidden icon={<XDSIcon icon={ListBulletIcon} color="inherit" />} />
</XDSSegmentedControl>`,
    },
    {
      label: 'Disabled',
      code: `<XDSSegmentedControl value={view} onChange={setView} label="View mode" isDisabled>
  <XDSSegmentedControlItem value="grid" label="Grid" />
  <XDSSegmentedControlItem value="list" label="List" />
</XDSSegmentedControl>`,
    },
  ],
  theming: {
    targets: [
      {className: 'xds-segmented-control', visualProps: ['size']},
      {className: 'xds-segmented-control-item'},
    ],
  },
  accessibility: [
    'Container has role="radiogroup" with aria-label from the label prop (never rendered visually)',
    'Items have role="radio" with aria-checked indicating selection state',
    'Roving tabindex: selected item has tabIndex=0, others have tabIndex=-1',
    'Arrow keys navigate and select simultaneously (radio group pattern)',
    'Disabled items use aria-disabled (not native disabled) to maintain focusability',
    'Icon-only items use isLabelHidden — label becomes aria-label',
  ],
  keyboard:
    'ArrowRight/ArrowLeft navigate and select (wrapping). Home/End jump to first/last item. Only the selected item is in the tab order.',
  notes: [
    'Controlled-only — no uncontrolled mode in v1',
    'Horizontal-only — no vertical orientation in v1',
    'Deselection not allowed (radio semantics — always one selected)',
    'Uses aria-disabled instead of native disabled to maintain keyboard focusability',
    'Keyboard navigation skips disabled items',
    'Track background uses --color-secondary, selected indicator uses --color-surface with --shadow-base',
    'label prop on XDSSegmentedControl is aria-only (like XDSTabList aria-label), never rendered visually',
  ],
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
      ],
      examples: [
        {
          label: 'Basic',
          code: `<XDSSegmentedControl value={view} onChange={setView} label="View mode">
  <XDSSegmentedControlItem value="grid" label="Grid" />
  <XDSSegmentedControlItem value="list" label="List" />
  <XDSSegmentedControlItem value="table" label="Table" />
</XDSSegmentedControl>`,
        },
      ],
    },
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
      examples: [
        {
          label: 'With icon and label',
          code: '<XDSSegmentedControlItem value="grid" label="Grid" icon={<XDSIcon icon={Squares2X2Icon} color="inherit" />} />',
        },
        {
          label: 'Icon-only',
          code: '<XDSSegmentedControlItem value="grid" label="Grid" isLabelHidden icon={<XDSIcon icon={Squares2X2Icon} color="inherit" />} />',
        },
      ],
    },
  ],
};

/** @type {import('../docs-types').TranslationDoc} */
export const docsZh = {
  description:
    '分段按钮组，用于单选，具有单选组语义。外观类似标签栏，但控制的是值而非视图。',
  features: [
    '基于上下文通信：XDSSegmentedControlContext 将 value/onChange/size/isDisabled 从父组件传递给子组件',
    '单选组语义：role="radiogroup" 配合 role="radio" 子项和 aria-checked',
    '漫游焦点：仅选中项可通过 Tab 访问（tabIndex=0），其余为 tabIndex=-1',
    '键盘导航：ArrowLeft/ArrowRight 导航并选中，Home/End 跳转到首尾，循环切换',
    '动画指示器：选中项具有带 box-shadow 的凸起表面背景',
    '图标+文本或纯图标项（isLabelHidden 隐藏文本，保留为 aria-label）',
    '尺寸变体：sm（紧凑，适用于工具栏）、md（默认）、lg（更大触摸目标）',
    '禁用状态：可禁用整组或单个项，使用 aria-disabled 保持可聚焦性',
    '悬停状态：未选中项悬停时显示覆盖层，使用 @media (hover: hover) 保护',
  ],
  accessibility: [
    '容器具有 role="radiogroup"，aria-label 来自 label 属性（不会渲染为可见内容）',
    '子项具有 role="radio"，aria-checked 表示选中状态',
    '漫游焦点：选中项 tabIndex=0，其余 tabIndex=-1',
    '方向键同时导航和选中（单选组模式）',
    '禁用项使用 aria-disabled（非原生 disabled）以保持可聚焦性',
    '纯图标项使用 isLabelHidden，label 变为 aria-label',
  ],
  keyboard:
    'ArrowRight/ArrowLeft 导航并选中（循环）。Home/End 跳转到首尾项。仅选中项在 Tab 顺序中。',
  notes: [
    '仅受控模式，v1 无非受控模式',
    '仅水平方向，v1 无垂直方向',
    '不允许取消选中（单选语义，始终有一项选中）',
    '使用 aria-disabled 替代原生 disabled 以保持键盘可聚焦性',
    '键盘导航会跳过禁用项',
    '轨道背景使用 --color-secondary，选中指示器使用 --color-surface 配合 --shadow-base',
    'XDSSegmentedControl 的 label 属性仅用于 aria（类似 XDSTabList 的 aria-label），不会渲染为可见内容',
  ],
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
};

/** @type {import('../docs-types').TranslationDoc} */
export const docsDense = {
  description: 'segmented button group; single selection w/ radio group semantics; resembles tab bar but controls value not view',
  features: [
    'context-based: XDSSegmentedControlContext passes value/onChange/size/isDisabled to children',
    'radio group semantics: role="radiogroup" w/ role="radio" items+aria-checked',
    'roving tabindex: selected=tabIndex=0; others tabIndex=-1',
    'keyboard: ArrowLeft/Right navigate+select; Home/End first/last; wraps',
    'animated indicator: selected item raised surface bg w/ box-shadow',
    'icon+label or icon-only (isLabelHidden hides label visually; keeps aria-label)',
    'sizes: sm (compact/toolbars) md (default) lg (larger touch)',
    'disabled: group or individual via aria-disabled (maintains focusability)',
    'hover: unselected items show overlay; @media (hover: hover) guard',
  ],
  accessibility: [
    'container: role="radiogroup" w/ aria-label from label prop (never rendered)',
    'items: role="radio" w/ aria-checked for selection',
    'roving tabindex: selected=tabIndex=0; others=-1',
    'arrows navigate+select simultaneously (radio group pattern)',
    'disabled items use aria-disabled not native disabled; maintains focusability',
    'icon-only: isLabelHidden; label becomes aria-label',
  ],
  keyboard: 'ArrowRight/Left navigate+select (wrap). Home/End first/last. Only selected in tab order.',
  notes: [
    'controlled-only; no uncontrolled v1',
    'horizontal-only; no vertical v1',
    'no deselection (radio semantics; always one selected)',
    'aria-disabled not native disabled; maintains keyboard focusability',
    'keyboard nav skips disabled items',
    'track bg: --color-secondary; selected indicator: --color-surface+--shadow-base',
    'label prop aria-only (like XDSTabList aria-label); never rendered',
  ],
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
