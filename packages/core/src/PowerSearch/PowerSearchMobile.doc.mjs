// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @type {import('@astryxdesign/cli/authoring').ComponentDoc} */

export const docs = {
  name: 'PowerSearchMobile',
  displayName: 'Power Search Mobile',
  category: 'Data Input',
  keywords: [
    'powersearch',
    'mobile',
    'touch',
    'search',
    'filter',
    'filterbar',
    'bottomsheet',
    'faceted',
    'querybuilder',
    'responsive',
  ],
  props: [
    {
      name: 'config',
      type: 'PowerSearchConfig',
      description:
        'Configuration defining available fields, operators, and their value types. Identical to PowerSearch.',
      required: true,
    },
    {
      name: 'filters',
      type: 'ReadonlyArray<PowerSearchFilter>',
      description: 'Currently active filters.',
      required: true,
    },
    {
      name: 'onChange',
      type: "(filters: ReadonlyArray<PowerSearchFilter>, changeType: 'add' | 'edit' | 'remove', index: number) => void",
      description:
        "Called when filters change. changeType is 'add', 'edit', or 'remove'. index is the affected filter's position.",
      required: true,
    },
    {
      name: 'label',
      type: 'string',
      description:
        'Accessible label for the tap target that opens the filter sheet.',
      default: "'Search'",
    },
    {
      name: 'isLabelHidden',
      type: 'boolean',
      description: 'Visually hides the label while keeping it accessible.',
      default: 'true',
    },
    {
      name: 'placeholder',
      type: 'string',
      description:
        'Text shown on the tap target while no filters are selected. Once a filter exists the target reads "Add filter" instead.',
      default: "'Search...'",
    },
    {
      name: 'hasClear',
      type: 'boolean',
      description:
        'Show a clear-all button on the tap target. Read-only filters are left in place.',
      default: 'true',
    },
    {
      name: 'isReadOnly',
      type: 'boolean',
      description:
        'Prevent adding, editing, or removing filters. The sheet no longer opens and tokens lose their remove buttons.',
      default: 'false',
    },
    {
      name: 'isDisabled',
      type: 'boolean',
      description: 'Disables the entire component.',
      default: 'false',
    },
    {
      name: 'disabledMessage',
      type: 'string',
      description:
        'Explains why the search is disabled. With isDisabled, shows a tooltip on hover/keyboard focus and keeps the tap target focusable via aria-disabled (opening stays blocked). Use this instead of wrapping a disabled PowerSearchMobile in Tooltip. Disabled controls swallow the hover events an external Tooltip needs.',
    },
    {
      name: 'status',
      type: "{type: 'warning' | 'error' | 'success', message?: string}",
      description: 'Validation status object with type and optional message.',
    },
    {
      name: 'statusVariant',
      type: "'attached' | 'detached'",
      description:
        'How the status message is placed relative to the tap target. attached overlaps directly below it (bordered treatment); detached floats below as a separate element with spacing.',
      default: "'attached'",
    },
    {
      name: 'startIcon',
      type: 'ReactNode | IconType',
      description:
        'Icon displayed at the start of the tap target, before any filter tokens. Accepts a semantic icon name, an SVG icon component, or a ReactNode.',
      slotElements: [{__element: 'Icon', props: {icon: 'search', size: 'sm'}}],
    },
    {
      name: 'maxTokenLength',
      type: 'number',
      description: 'Max character length for filter value display in tokens.',
      default: '40',
    },
    {
      name: 'popoverSaveButtonLabel',
      type: 'string',
      description:
        "Label for the sheet's confirm button. Named for the desktop popover so one call site can feed both variants.",
      default: "'Apply'",
    },
    {
      name: 'timezoneID',
      type: 'string',
      description: 'Timezone ID for date formatting (e.g. "America/New_York").',
    },
    {
      name: 'endContent',
      type: 'ReactNode',
      description:
        'Content displayed at the end of the tap target row, after the result count.',
      slotElements: [{__element: 'Badge', props: {label: '3'}}],
    },
    {
      name: 'resultCount',
      type: 'number | string',
      description:
        'Number of results matching the current filters. When a number, formatted as "N results". When a string, displayed as-is. Changes are announced to screen readers via a polite live region.',
    },
    {
      name: 'components',
      type: 'PowerSearchComponents',
      description:
        'Per-operator-value-type overrides for token and editor rendering. A Token override replaces the pill on the tap target; an Editor override replaces the whole body of the editor sheet, including its own confirm and cancel controls.',
    },
    {
      name: 'handleRef',
      type: 'Ref<PowerSearchHandle>',
      description:
        'Imperative handle. This variant has no typeahead input, so focusTypeahead() and blurTypeahead() move focus to and from the tap target.',
    },
    {
      name: 'size',
      type: "'sm' | 'md' | 'lg'",
      description: 'Size of the tap target and its tokens.',
      default: "'md'",
    },
    {
      name: 'xstyle',
      type: 'StyleXStyles',
      description:
        'StyleX styles for layout customization. Must be a stylex.create() value.',
    },
  ],
  usage: {
    description:
      'PowerSearchMobile is the touch-first form of PowerSearch: the same props, filter model, and tokens, with the typeahead dropdown and the row-shaped edit popover replaced by a pinned-tall bottom sheet that drills down field to operator to value. Reach for it on phone layouts, where a popover fights the on-screen keyboard and the editor row has nowhere to go. Choose between the two variants on viewport; do not render both.',
    bestPractices: [
      {
        guidance: true,
        description:
          'Pick between PowerSearch and PowerSearchMobile with one viewport check (useMediaQuery or AppShell) and pass both the same props, so the two stay in step.',
      },
      {
        guidance: true,
        description:
          'Give each field a description; it is the second line of the field row, which is where users decide what a filter will do before opening it.',
      },
      {
        guidance: true,
        description:
          'Keep operator lists short. The first operator is what a field row promises, and every extra one costs a drill-down.',
      },
      {
        guidance: false,
        description:
          "Use it for fields whose only operators have a 'nested' value type; nested filter groups have no touch editor, so those fields are left out of the list and a dev warning fires.",
      },
      {
        guidance: false,
        description:
          'Render it inside another dialog or bottom sheet. Its sheet is a top-layer dialog of its own and would stack a second modal surface on the first.',
      },
    ],
  },
  examples: [
    {
      label: 'Responsive: one call site, both variants',
      code: `const isTouch = useMediaQuery('(max-width: 768px)');
const Search = isTouch ? PowerSearchMobile : PowerSearch;

<Search
  config={config}
  filters={filters}
  onChange={setFilters}
  resultCount={results.length}
/>`,
    },
    {
      label: 'Standalone',
      code: `const [filters, setFilters] = useState([]);

<PowerSearchMobile
  config={config}
  filters={filters}
  onChange={setFilters}
  placeholder="Filter issues…"
/>`,
    },
  ],
  theming: {
    targets: [
      {
        className: 'astryx-power-search-mobile',
        visualProps: ['size', 'status'],
        states: ['disabled'],
      },
      // The desktop variant lives in the same directory and shares this
      // documented surface.
      {className: 'astryx-power-search'},
    ],
  },
};

// -------------------------------------------------------
// Auto-generated translations below. Do not edit manually.
// Regenerate with the dense compression protocol.
// See .context/decisions/dense-compression-protocol.md
// -------------------------------------------------------

/** @type {import('@astryxdesign/cli/authoring').ComponentDoc} */
export const docsZh = {
  name: 'PowerSearchMobile',
  displayName: 'Power Search Mobile',
  props: [
    {
      name: 'config',
      type: 'PowerSearchConfig',
      description: '定义可用字段、运算符及其值类型的配置。与 PowerSearch 相同。',
      required: true,
    },
    {
      name: 'filters',
      type: 'ReadonlyArray<PowerSearchFilter>',
      description: '当前活跃的过滤器。',
      required: true,
    },
    {
      name: 'onChange',
      type: "(filters: ReadonlyArray<PowerSearchFilter>, changeType: 'add' | 'edit' | 'remove', index: number) => void",
      description:
        "当过滤器变更时调用。changeType 为 'add'、'edit' 或 'remove'。index 为受影响的过滤器位置。",
      required: true,
    },
    {
      name: 'label',
      type: 'string',
      description: '打开过滤器面板的点击目标的无障碍标签。',
      default: "'Search'",
    },
    {
      name: 'isLabelHidden',
      type: 'boolean',
      description: '视觉上隐藏标签，同时保持无障碍性。',
      default: 'true',
    },
    {
      name: 'placeholder',
      type: 'string',
      description:
        '未选择过滤器时点击目标上显示的文本。存在过滤器后，目标改为显示"Add filter"。',
      default: "'Search...'",
    },
    {
      name: 'hasClear',
      type: 'boolean',
      description: '在点击目标上显示清除全部按钮。只读过滤器会被保留。',
      default: 'true',
    },
    {
      name: 'isReadOnly',
      type: 'boolean',
      description:
        '阻止添加、编辑或移除过滤器。面板不再打开，标记也不再显示移除按钮。',
      default: 'false',
    },
    {
      name: 'isDisabled',
      type: 'boolean',
      description: '禁用整个组件。',
      default: 'false',
    },
    {
      name: 'disabledMessage',
      type: 'string',
      description:
        'Explains why the search is disabled. With isDisabled, shows a tooltip on hover/keyboard focus and keeps the tap target focusable via aria-disabled (opening stays blocked). Use this instead of wrapping a disabled PowerSearchMobile in Tooltip. Disabled controls swallow the hover events an external Tooltip needs.',
    },
    {
      name: 'status',
      type: "{type: 'warning' | 'error' | 'success', message?: string}",
      description: '带有类型和可选消息的验证状态对象。',
    },
    {
      name: 'statusVariant',
      type: "'attached' | 'detached'",
      description:
        '状态消息相对于点击目标的放置方式。attached 直接叠加在其下方（带边框处理）；detached 作为独立元素浮于下方并留有间距。',
      default: "'attached'",
    },
    {
      name: 'startIcon',
      type: 'ReactNode | IconType',
      description:
        '在点击目标开头（筛选 token 之前）显示的图标。接受语义图标名称、SVG 图标组件或 ReactNode。',
    },
    {
      name: 'maxTokenLength',
      type: 'number',
      description: '令牌中过滤器值显示的最大字符长度。',
      default: '40',
    },
    {
      name: 'popoverSaveButtonLabel',
      type: 'string',
      description:
        '面板确认按钮的标签。沿用桌面端弹出层的命名，便于同一处调用同时驱动两个变体。',
      default: "'Apply'",
    },
    {
      name: 'timezoneID',
      type: 'string',
      description: '用于日期格式化的时区 ID（例如 "America/New_York"）。',
    },
    {
      name: 'endContent',
      type: 'ReactNode',
      description: '显示在点击目标行末尾、结果数量之后的内容。',
    },
    {
      name: 'resultCount',
      type: 'number | string',
      description:
        '匹配当前过滤器的结果数量。数字类型时格式化为"N results"。字符串类型时按原样显示。数量变化会通过 polite 实时区域向屏幕阅读器播报。',
    },
    {
      name: 'components',
      type: 'PowerSearchComponents',
      description:
        '按运算符值类型覆盖标记与编辑器的渲染。Token 覆盖替换点击目标上的标记；Editor 覆盖替换编辑器面板的整个主体，包括其自身的确认与取消控件。',
    },
    {
      name: 'handleRef',
      type: 'Ref<PowerSearchHandle>',
      description:
        '命令式句柄。此变体没有 typeahead 输入框，因此 focusTypeahead() 与 blurTypeahead() 将焦点移入或移出点击目标。',
    },
    {
      name: 'size',
      type: "'sm' | 'md' | 'lg'",
      description: '点击目标及其标记的尺寸。',
      default: "'md'",
    },
    {
      name: 'xstyle',
      type: 'StyleXStyles',
      description: '用于布局自定义的 StyleX 样式。必须是 stylex.create() 值。',
    },
  ],
  usage: {
    description:
      'PowerSearchMobile is the touch-first form of PowerSearch: the same props, filter model, and tokens, with the typeahead dropdown and the row-shaped edit popover replaced by a pinned-tall bottom sheet that drills down field to operator to value. Reach for it on phone layouts, where a popover fights the on-screen keyboard and the editor row has nowhere to go. Choose between the two variants on viewport; do not render both.',
    bestPractices: [
      {
        guidance: true,
        description:
          'Pick between PowerSearch and PowerSearchMobile with one viewport check (useMediaQuery or AppShell) and pass both the same props, so the two stay in step.',
      },
      {
        guidance: true,
        description:
          'Give each field a description; it is the second line of the field row, which is where users decide what a filter will do before opening it.',
      },
      {
        guidance: true,
        description:
          'Keep operator lists short. The first operator is what a field row promises, and every extra one costs a drill-down.',
      },
      {
        guidance: false,
        description:
          "Use it for fields whose only operators have a 'nested' value type; nested filter groups have no touch editor, so those fields are left out of the list and a dev warning fires.",
      },
      {
        guidance: false,
        description:
          'Render it inside another dialog or bottom sheet. Its sheet is a top-layer dialog of its own and would stack a second modal surface on the first.',
      },
    ],
  },
};

/** @type {import('@astryxdesign/cli/authoring').ComponentTranslationDoc} */
export const docsDense = {
  description:
    'Touch-first PowerSearch. Same props/filter model/tokens; typeahead dropdown + row-shaped edit popover replaced by pinned-tall BottomSheet drilling field -> operator -> value. Tap target shows tokens; tap token to edit.',
  usage: {
    description:
      'PowerSearchMobile is the touch-first form of PowerSearch: the same props, filter model, and tokens, with the typeahead dropdown and the row-shaped edit popover replaced by a pinned-tall bottom sheet that drills down field to operator to value. Reach for it on phone layouts, where a popover fights the on-screen keyboard and the editor row has nowhere to go. Choose between the two variants on viewport; do not render both.',
    bestPractices: [
      {
        guidance: true,
        description:
          'Pick between PowerSearch and PowerSearchMobile with one viewport check (useMediaQuery or AppShell) and pass both the same props, so the two stay in step.',
      },
      {
        guidance: true,
        description:
          'Give each field a description; it is the second line of the field row, which is where users decide what a filter will do before opening it.',
      },
      {
        guidance: true,
        description:
          'Keep operator lists short. The first operator is what a field row promises, and every extra one costs a drill-down.',
      },
      {
        guidance: false,
        description:
          "Use it for fields whose only operators have a 'nested' value type; nested filter groups have no touch editor, so those fields are left out of the list and a dev warning fires.",
      },
      {
        guidance: false,
        description:
          'Render it inside another dialog or bottom sheet. Its sheet is a top-layer dialog of its own and would stack a second modal surface on the first.',
      },
    ],
  },
  propDescriptions: {
    config:
      'Config defining available fields, operators, value types. Same as PowerSearch.',
    filters: 'Currently active filters.',
    onChange:
      "Called on filter change. changeType is 'add', 'edit', or 'remove'. index is affected filter position.",
    label: 'Accessible label for tap target that opens filter sheet.',
    isLabelHidden: 'Visually hides label while keeping accessible.',
    placeholder:
      'Text on tap target while no filters selected. With filters, target reads "Add filter".',
    hasClear: 'Show clear-all button on tap target. Read-only filters kept.',
    isReadOnly:
      'Prevent add/edit/remove. Sheet no longer opens; tokens lose remove buttons.',
    isDisabled: 'Disables entire component.',
    disabledMessage:
      'Why search is disabled. Tooltip on hover/focus; tap target stays focusable via aria-disabled.',
    status: 'Validation status object w/ type + optional message.',
    statusVariant:
      'How status message is placed: attached overlaps below tap target; detached floats below w/ spacing.',
    startIcon: 'Icon at tap-target start, before filter tokens.',
    maxTokenLength: 'Max char length for filter value display in tokens.',
    popoverSaveButtonLabel:
      "Label for sheet's confirm button. Named for desktop popover so one call site feeds both variants.",
    timezoneID: 'Timezone ID for date formatting (e.g. "America/New_York").',
    endContent: 'Content at end of tap-target row, after result count.',
    resultCount:
      'Result count matching current filters. Number formatted as "N results"; string displayed as-is.',
    components:
      'Per-type Token/Editor overrides. Token replaces the pill; Editor replaces the whole editor-sheet body incl. its own confirm/cancel.',
    handleRef:
      'Imperative handle. No typeahead input here, so focusTypeahead()/blurTypeahead() move focus to/from the tap target.',
    size: 'Tap target + token size.',
    xstyle:
      'StyleX styles for layout customization. Must be stylex.create() value.',
  },
};
