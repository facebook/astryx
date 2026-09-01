// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @type {import('@astryxdesign/cli/authoring').ComponentDoc} */

export const docs = {
  name: 'BaseTypeahead',
  subComponentOf: 'Typeahead',
  displayName: 'Base Typeahead',
  isHiddenFromOverview: true,
  description: 'Unstyled combobox engine providing input, search, keyboard navigation, and dropdown. No wrapper div, no border styling, no token rendering. Used by Typeahead and Tokenizer for custom compositions.',
  usage: {
    description: 'Unstyled combobox engine providing input, search, keyboard navigation, and dropdown. No wrapper div, no border styling, no token rendering. Used by Typeahead and Tokenizer for custom compositions.',
    bestPractices: [
      { guidance: true, description: 'Use Typeahead or Tokenizer for standard fields; they wrap BaseTypeahead with the wrapper div, border styling, and token rendering it intentionally omits.' },
      { guidance: true, description: 'Provide your own wrapper div with border and layout when composing directly, since BaseTypeahead renders no visual chrome of its own.' },
      { guidance: true, description: 'Pass anchorRef pointing to your wrapper so the dropdown positions against your custom input chrome, not just the bare input element.' },
      { guidance: false, description: 'Expect a wrapper div, border, or token rendering. BaseTypeahead is an engine only; all visual chrome is the caller\'s responsibility.' },
      { guidance: false, description: 'Use BaseTypeahead when Typeahead or Tokenizer would suffice; the extra wrapper and styling work is only justified for truly custom compositions.' },
    ],
  },
  props: [
    {
      name: 'searchSource',
      type: 'SearchSource<T>',
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
      name: 'menuWidth',
      type: 'number',
      description: 'Fixed dropdown width in pixels. The menu never shrinks below its anchor width.',
    },
    {
      name: 'minQueryLength',
      type: 'number',
      description: 'Minimum query length before the search source is queried. Below it no search runs and the menu stays closed.',
      default: '1',
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
      name: 'transformQuery',
      type: '(nextQuery: string) => string',
      description: 'Rewrites edited input text before it becomes the query. Called with the value the input is about to take; the return value is used instead. Runs before the query is stored, before onChangeQuery, and before a search is scheduled, so returning shorter text never searches for the text it replaced. On paste it receives the full post-paste value (clipboard spliced over the selection) before the single-line input strips newlines; returning different text replaces the native insertion. After an IME composition ends it runs over the finalized text. Not called for query changes the component makes itself (e.g. the clear after a selection) or while an IME is mid-composition. Tokenizer uses it to lift delimited values out of the input and commit them as tokens.',
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
  description: '无样式的组合框引擎，提供输入、搜索、键盘导航和下拉列表。无包装 div，无边框样式，无标记渲染。由 Typeahead 和 Tokenizer 用于自定义组合。',
  props: [
    {
      name: 'searchSource',
      type: 'SearchSource<T>',
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
      name: 'menuWidth',
      type: 'number',
      description: '下拉菜单的固定像素宽度。菜单不会小于其锚点宽度。',
    },
    {
      name: 'minQueryLength',
      type: 'number',
      description: '查询搜索源前的最小查询长度。低于该长度不会发起搜索，菜单保持关闭。',
      default: '1',
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
      name: 'transformQuery',
      type: '(nextQuery: string) => string',
      description: '在编辑文本成为查询之前重写它。以输入框即将取得的值调用，返回值将被采用。在查询存储、onChangeQuery 触发和搜索调度之前运行。粘贴时以粘贴后的完整文本（剪贴板内容替换选区）调用，先于单行输入框剥离换行符；返回不同文本会取代原生插入。输入法组合结束后对最终文本再运行一次。组件自身引起的查询变化（如选择后的清空）和输入法组合过程中不会调用。Tokenizer 用它把分隔的值从输入框提取为标记。',
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
  description: 'Unstyled combobox engine; input+search+keyboard nav+dropdown. No wrapper/border/token. Used by Typeahead+Tokenizer.',
  usage: {
    bestPractices: [
      { guidance: true, description: 'Use Typeahead or Tokenizer for standard fields; they add the wrapper, border, and token rendering BaseTypeahead omits.' },
      { guidance: true, description: 'Provide your own wrapper div with border and layout when composing directly; BaseTypeahead renders no chrome.' },
      { guidance: true, description: 'Pass anchorRef to your wrapper so the dropdown positions against your input chrome, not the bare input.' },
      { guidance: false, description: 'Expect wrapper, border, or token rendering. Engine only; chrome is the caller\'s job.' },
      { guidance: false, description: 'Use BaseTypeahead when Typeahead or Tokenizer suffice; extra work only pays off for custom compositions.' },
    ],
  },
  propDescriptions: {
    searchSource: 'Data source w/ search+bootstrap methods.',
    value: 'Currently selected item.',
    onChange: 'Fired on selection change.',
    renderItem: 'Custom dropdown item render.',
    placeholder: 'Input placeholder.',
    hasEntriesOnFocus: 'Bootstrap results on focus.',
    maxMenuItems: 'Max dropdown items.',
    menuWidth: 'Fixed dropdown width in pixels.',
    minQueryLength: 'Min query length before searching. Menu stays closed below it.',
    emptySearchResultsText: 'Text when no results.',
    isDisabled: 'Whether input disabled.',
    hasAutoFocus: 'Auto-focus on mount.',
    debounceMs: 'Search debounce ms. 0 for sync.',
    anchorRef: 'Anchor for dropdown positioning. Defaults to input.',
    inputXStyle: 'Additional StyleX styles for input.',
    onKeyDown: 'Keydown before internal nav. preventDefault() skips internal handling.',
    transformQuery: 'Rewrites edited input text before it becomes the query (runs before store/onChangeQuery/search; on paste gets the composed post-paste value pre-newline-strip; runs on IME text at composition end; not for self-made query changes or mid-IME). Tokenizer uses it to split delimited values into tokens.',
    onChangeQuery: 'Fired on query text change.',
    onOpenChange: 'Fired on dropdown open/close.',
    inputId: 'Input ID for label association.',
    ariaDescribedBy: 'Additional aria-describedby IDs.',
  },
};
