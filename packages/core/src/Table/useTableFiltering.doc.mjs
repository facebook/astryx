// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @type {import('@astryxdesign/cli/authoring').ComponentDoc} */

export const docs = {
  name: 'useTableFiltering',
  subComponentOf: 'Table',
  displayName: 'useTableFiltering',
  isHiddenFromOverview: true,
  description: 'Table plugin that adds column filters as header popovers, inline header controls, or a bottom sheet. Pairs with useTableFilterState for managed state. Supports text, select, multi-select, date, and number filter types via PowerSearch field definitions. Below the sheet breakpoint the controls leave the header for a bottom sheet opened from one Filter button, because a phone column is too narrow to hold a control.',
  props: [
    {
      name: 'filters',
      type: 'TableFilterState',
      description: 'Current filter state: map from column key to filter value.',
      required: true,
    },
    {
      name: 'onFilterChange',
      type: '(columnKey: string, value: TableFilterValue | null) => void',
      description: 'Called when the user changes a filter value. null clears the filter.',
      required: true,
    },
    {
      name: 'searchConfig',
      type: 'PowerSearchConfig',
      description: 'PowerSearch config defining the filterable fields. Columns reference a field by key; the plugin resolves the operator value type and renders the matching control. Build it with createPowerSearchConfig or usePowerSearchConfig and share it with PowerSearch.',
      required: true,
    },
    {
      name: 'variant',
      type: "'popover' | 'inline' | 'inline-compact' | 'sheet'",
      description: 'Display variant for filter controls. sheet moves every control out of the header into a bottom sheet opened from one Filter button above the table, with an active-filter count on the button, Reset, and Done; filters apply as they are toggled and the sheet has no scrim, so the rows behind stay visible and keep updating. Below sheetBreakpoint every variant renders as sheet.',
      default: "'popover'",
    },
    {
      name: 'sheetBreakpoint',
      type: "'sm' | 'md' | 'lg' | 'none'",
      description: 'Viewport width below which the controls collapse into the sheet: sm 640px, md 768px, lg 1024px. none keeps the header controls at every width.',
      default: "'sm'",
    },
    {
      name: 'defaultIsMobile',
      type: 'boolean',
      description: 'SSR hint: whether the first render should assume a narrow viewport, so server HTML matches the client on phones. Derive it from the User-Agent header or a device cookie.',
      default: 'false',
    },
  ],
};

export const docsZh = {
  name: 'useTableFiltering',
  isHiddenFromOverview: true,
  displayName: 'useTableFiltering',
  description: '表格筛选插件，以表头弹出层、表头内联控件或底部弹层的形式添加列筛选。与 useTableFilterState 配合使用管理状态。窄屏下控件移出表头，改由一个"筛选"按钮打开底部弹层。',
  props: [
    {
      name: 'filters',
      type: 'TableFilterState',
      description: '当前筛选状态——列键到筛选值的映射。',
      required: true,
    },
    {
      name: 'onFilterChange',
      type: '(columnKey: string, value: TableFilterValue | null) => void',
      description: '用户更改筛选值时调用。null 清除筛选。',
      required: true,
    },
    {
      name: 'searchConfig',
      type: 'PowerSearchConfig',
      description: '定义可筛选字段的 PowerSearch 配置。列通过 key 引用字段，插件据此渲染对应控件。',
      required: true,
    },
    {
      name: 'variant',
      type: "'popover' | 'inline' | 'inline-compact' | 'sheet'",
      description: '筛选控件的显示变体。sheet 将所有控件移入底部弹层，由表格上方的"筛选"按钮打开，按钮显示生效筛选数量；切换即时生效，弹层无遮罩，后面的行保持可见并实时更新。低于 sheetBreakpoint 时所有变体都按 sheet 渲染。',
      default: "'popover'",
    },
    {
      name: 'sheetBreakpoint',
      type: "'sm' | 'md' | 'lg' | 'none'",
      description: '控件收进底部弹层的视口宽度阈值：sm 640px、md 768px、lg 1024px。none 表示任何宽度都保留表头控件。',
      default: "'sm'",
    },
    {
      name: 'defaultIsMobile',
      type: 'boolean',
      description: 'SSR 提示：首次渲染是否按窄视口处理，使服务端 HTML 与手机端一致。',
      default: 'false',
    },
  ],
};

export const docsDense = {
  name: 'useTableFiltering',
  isHiddenFromOverview: true,
  displayName: 'useTableFiltering',
  description: 'Table filtering plugin: column filters as header popover/inline, or a bottom sheet on narrow viewports. Pairs w/ useTableFilterState.',
  propDescriptions: {
    filters: 'Current filter state map (columnKey → value).',
    onFilterChange: 'Called on filter change. null clears.',
    searchConfig: 'PowerSearch config defining the filterable fields.',
    variant: "Filter control display variant. 'sheet' = one Filter button + bottom sheet, live-applied, no scrim.",
    sheetBreakpoint: "Width below which any variant becomes the sheet ('sm' 640 / 'md' 768 / 'lg' 1024 / 'none').",
    defaultIsMobile: 'SSR hint for the first render below the breakpoint.',
  },
};
