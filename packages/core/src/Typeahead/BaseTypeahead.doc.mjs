// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @type {import('../docs-types').ComponentDoc} */

export const docs = {
  name: 'BaseTypeahead',
  subComponentOf: 'Typeahead',
  displayName: 'Base Typeahead',
  isHiddenFromOverview: true,
  description: 'Unstyled combobox engine providing input, search, keyboard navigation, and dropdown. No wrapper div, no border styling, no token rendering. Used by XDSTypeahead and XDSTokenizer for custom compositions.',
  props: [
    {
      name: 'searchSource',
      type: 'XDSSearchSource<T>',
      description: 'Data source providing search and bootstrap methods.',
      required: true,
    },
    {
      name: 'value',
      type: 'T | null',
      description: 'Currently selected item.',
      required: true,
    },
    {
      name: 'onChange',
      type: '(item: T | null) => void',
      description: 'Called when the selection changes.',
      required: true,
    },
    {
      name: 'renderItem',
      type: '(item: T) => ReactNode',
      description: 'Custom render function for dropdown items.',
    },
    {
      name: 'placeholder',
      type: 'string',
      description: 'Input placeholder text.',
      default: "'Search...'",
    },
    {
      name: 'hasEntriesOnFocus',
      type: 'boolean',
      description: 'Show bootstrap results on focus before typing.',
      default: 'false',
    },
    {
      name: 'maxMenuItems',
      type: 'number',
      description: 'Maximum dropdown items to display.',
      default: '10',
    },
    {
      name: 'emptySearchResultsText',
      type: 'string',
      description: 'Text shown when search returns no results.',
      default: "'No results found'",
    },
    {
      name: 'isDisabled',
      type: 'boolean',
      description: 'Whether the input is disabled.',
      default: 'false',
    },
    {
      name: 'hasAutoFocus',
      type: 'boolean',
      description: 'Auto-focus the input on mount.',
      default: 'false',
    },
    {
      name: 'debounceMs',
      type: 'number',
      description: 'Debounce delay in ms before triggering search. Set to 0 for synchronous sources.',
      default: '150',
    },
    {
      name: 'anchorRef',
      type: 'RefObject<HTMLElement | null>',
      description: 'Ref to the anchor element for dropdown positioning. If not provided, the input itself is used.',
    },
    {
      name: 'inputXStyle',
      type: 'StyleXStyles',
      description: 'Additional StyleX styles for the input element.',
    },
    {
      name: 'onKeyDown',
      type: '(e: React.KeyboardEvent<HTMLInputElement>) => void',
      description: 'Additional keydown handler called before internal keyboard navigation. Call e.preventDefault() to skip internal handling.',
    },
    {
      name: 'onChangeQuery',
      type: '(query: string) => void',
      description: 'Callback fired when the search query text changes.',
    },
    {
      name: 'onOpenChange',
      type: '(isOpen: boolean) => void',
      description: 'Callback when the dropdown opens or closes.',
    },
    {
      name: 'inputId',
      type: 'string',
      description: 'ID for the input element (for label association).',
    },
    {
      name: 'ariaDescribedBy',
      type: 'string',
      description: 'Additional aria-describedby IDs.',
    },
  ],
};

export const docsZh = {
  name: 'BaseTypeahead',
  isHiddenFromOverview: true,
  displayName: 'Base Typeahead',
  description: '无样式的组合框引擎，提供输入、搜索、键盘导航和下拉列表。无包装 div，无边框样式，无标记渲染。由 XDSTypeahead 和 XDSTokenizer 用于自定义组合。',
  props: [
    {
      name: 'searchSource',
      type: 'XDSSearchSource<T>',
      description: '提供搜索和引导方法的数据源。',
      required: true,
    },
    {
      name: 'value',
      type: 'T | null',
      description: '当前选中的项目。',
      required: true,
    },
    {
      name: 'onChange',
      type: '(item: T | null) => void',
      description: '选择变更时调用。',
      required: true,
    },
    {
      name: 'renderItem',
      type: '(item: T) => ReactNode',
      description: '下拉列表项的自定义渲染函数。',
    },
    {
      name: 'placeholder',
      type: 'string',
      description: '输入框占位文本。',
      default: "'Search...'",
    },
    {
      name: 'hasEntriesOnFocus',
      type: 'boolean',
      description: '聚焦时在输入前显示引导结果。',
      default: 'false',
    },
    {
      name: 'maxMenuItems',
      type: 'number',
      description: '下拉列表显示的最大项目数。',
      default: '10',
    },
    {
      name: 'emptySearchResultsText',
      type: 'string',
      description: '搜索无结果时显示的文本。',
      default: "'No results found'",
    },
    {
      name: 'isDisabled',
      type: 'boolean',
      description: '输入框是否被禁用。',
      default: 'false',
    },
    {
      name: 'hasAutoFocus',
      type: 'boolean',
      description: '挂载时自动聚焦输入框。',
      default: 'false',
    },
    {
      name: 'debounceMs',
      type: 'number',
      description: '触发搜索前的防抖延迟（毫秒）。同步数据源设置为 0。',
      default: '150',
    },
    {
      name: 'anchorRef',
      type: 'RefObject<HTMLElement | null>',
      description: '用于下拉列表定位的锚点元素引用。未提供时使用输入框本身。',
    },
    {
      name: 'inputXStyle',
      type: 'StyleXStyles',
      description: '输入元素的附加 StyleX 样式。',
    },
    {
      name: 'onKeyDown',
      type: '(e: React.KeyboardEvent<HTMLInputElement>) => void',
      description: '在内部键盘导航之前调用的附加 keydown 处理函数。调用 e.preventDefault() 可跳过内部处理。',
    },
    {
      name: 'onChangeQuery',
      type: '(query: string) => void',
      description: '搜索查询文本变更时触发的回调。',
    },
    {
      name: 'onOpenChange',
      type: '(isOpen: boolean) => void',
      description: '下拉列表打开或关闭时的回调。',
    },
    {
      name: 'inputId',
      type: 'string',
      description: '输入元素的 ID（用于标签关联）。',
    },
    {
      name: 'ariaDescribedBy',
      type: 'string',
      description: '附加的 aria-describedby ID。',
    },
  ],
};

export const docsDense = {
  name: 'BaseTypeahead',
  isHiddenFromOverview: true,
  displayName: 'Base Typeahead',
  description: 'Unstyled combobox engine; input+search+keyboard nav+dropdown. No wrapper/border/token. Used by XDSTypeahead+XDSTokenizer.',
  propDescriptions: {
    searchSource: 'Data source w/ search+bootstrap methods.',
    value: 'Currently selected item.',
    onChange: 'Fired on selection change.',
    renderItem: 'Custom dropdown item render.',
    placeholder: 'Input placeholder.',
    hasEntriesOnFocus: 'Bootstrap results on focus.',
    maxMenuItems: 'Max dropdown items.',
    emptySearchResultsText: 'Text when no results.',
    isDisabled: 'Whether input disabled.',
    hasAutoFocus: 'Auto-focus on mount.',
    debounceMs: 'Search debounce ms. 0 for sync.',
    anchorRef: 'Anchor for dropdown positioning. Defaults to input.',
    inputXStyle: 'Additional StyleX styles for input.',
    onKeyDown: 'Keydown before internal nav. preventDefault() skips internal handling.',
    onChangeQuery: 'Fired on query text change.',
    onOpenChange: 'Fired on dropdown open/close.',
    inputId: 'Input ID for label association.',
    ariaDescribedBy: 'Additional aria-describedby IDs.',
  },
};
