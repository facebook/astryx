// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @type {import('../../../core/src/docs-types').ComponentDoc} */

export const docs = {
  name: 'ListInput',
  displayName: 'ListInput',
  category: 'Data Input',
  keywords: ["list","input","repeated","records","rows","collection","field array","editor","guest list","reorder","form"],
  props: [
    {
      name: 'label',
      type: 'string',
      description: 'Accessible name for the collection, e.g. "Tag options".',
      required: true,
    },
    {
      name: 'value',
      type: 'T[]',
      description:
        'The collection being edited. Fully controlled; ListInput never mutates it.',
      required: true,
    },
    {
      name: 'onChange',
      type: '(next: T[], change: ListInputChange<T>) => void',
      description:
        "Called with the next collection and a change descriptor ('add' | 'update' | 'remove' | 'reorder') carrying the stable item key and the relevant indexes or column key.",
      required: true,
    },
    {
      name: 'getItemKey',
      type: '(item: T) => React.Key',
      description:
        'Stable key for a record. Keeps DOM identity, focus, and validation messages attached to their item across reorder and external updates.',
      required: true,
    },
    {
      name: 'createItem',
      type: '() => T',
      description: 'Creates the record appended by the Add action.',
      required: true,
    },
    {
      name: 'columns',
      type: 'Array<ListInputColumn<T>>',
      description:
        'One entry per field: {key, header, width?, renderInput, renderValue?}. renderInput receives {item, index, updateItem, label, status, ...state}; pass label with isLabelHidden and spread state onto the input.',
      required: true,
    },
    {
      name: 'itemName',
      type: 'string',
      description:
        'Noun for one record, used in control labels such as "Add guest" and "Remove guest 2".',
      default: "'item'",
    },
    {
      name: 'description',
      type: 'string',
      description: 'Supporting text between the label and the rows.',
    },
    {
      name: 'status',
      type: 'InputStatus',
      description:
        'List-scope validation status. Its message renders full-width after the rows and the Add action.',
    },
    {
      name: 'getItemStatus',
      type: '(item: T, index: number) => InputStatus | undefined',
      description:
        'Item-scope validation status: a full-row message associated with that record. Does not replace field errors.',
    },
    {
      name: 'getFieldStatus',
      type: '(item: T, columnKey: string, index: number) => InputStatus | undefined',
      description:
        "Field-scope validation status, passed to that cell's renderInput as `status` for the input to render.",
    },
    {
      name: 'isReorderable',
      type: 'boolean',
      description:
        'Adds a per-row handle supporting pointer, touch, and keyboard reorder (grab, arrow-move, drop, escape-cancel) with polite announcements; all paths commit through one onChange.',
      default: 'false',
    },
    {
      name: 'isReadOnly',
      type: 'boolean',
      description:
        "Renders values without editing affordances, via each column's renderValue (or String(item[key]) for primitives).",
      default: 'false',
    },
    {
      name: 'isDisabled',
      type: 'boolean',
      description: 'Disables every control in the collection.',
      default: 'false',
    },
    {
      name: 'isLoading',
      type: 'boolean',
      description:
        'Marks the table aria-busy and disables every control while data loads.',
      default: 'false',
    },
    {
      name: 'maxItems',
      type: 'number',
      description:
        'Physical row limit; disables the Add action at the limit. Minimum counts stay caller-owned through status — removal is never blocked.',
    },
    {
      name: 'xstyle',
      type: 'StyleXStyles',
      description:
        'StyleX styles for layout customization (margins, positioning, sizing). Must be a stylex.create() value, not an inline style object like style={{}}.',
    },
  ],
  theming: {
    targets: [
      {className: 'astryx-list-input', visualProps: []},
    ],
  },
  usage: {
    description:
      'A compact editor for a short, ordered collection of consistent records: guest lists, traveler details, tag options, emergency contacts. Renders a semantic table of per-field inputs with Add/Remove, accessible reorder, focus restoration, and three independent validation scopes (field, item, list).',
    bestPractices: [
      { guidance: true, description: 'Keep collections small: under about seven records and three simple fields per record. Larger consistent datasets belong in Table; heterogeneous records belong in cards or another progressive form pattern.' },
      { guidance: true, description: "Pass the render context's label to each input with isLabelHidden so every cell stays individually named for assistive tech." },
      { guidance: true, description: 'Give records durable ids at creation (e.g. crypto.randomUUID()) so getItemKey stays stable across edits and reorder.' },
      { guidance: true, description: 'Compute statuses on whatever timing the form owns (change, blur, submit); keep them keyed by item id so errors survive reorder.' },
      { guidance: false, description: 'Derive getItemKey from the array index; it detaches focus, DOM state, and errors from their records on reorder.' },
      { guidance: false, description: 'Block removal by hiding the Remove action when the collection would become invalid; express minimum counts through status instead.' },
    ],
  },
};

/** @type {import('../../../core/src/docs-types').ComponentDoc} */
export const docsZh = {
  name: 'ListInput',
  displayName: 'ListInput',
  props: [
    {
      name: 'label',
      type: 'string',
      description: '集合的无障碍名称，例如 "Tag options"。',
      required: true,
    },
    {
      name: 'value',
      type: 'T[]',
      description: '正在编辑的集合。完全受控；ListInput 绝不修改它。',
      required: true,
    },
    {
      name: 'onChange',
      type: '(next: T[], change: ListInputChange<T>) => void',
      description:
        "以下一个集合和变更描述符（'add' | 'update' | 'remove' | 'reorder'）调用，包含稳定的条目 key 及相关索引或列 key。",
      required: true,
    },
    {
      name: 'getItemKey',
      type: '(item: T) => React.Key',
      description:
        '记录的稳定 key。使 DOM 身份、焦点和校验信息在重新排序与外部更新后仍跟随对应条目。',
      required: true,
    },
    {
      name: 'createItem',
      type: '() => T',
      description: '创建由 Add 操作追加的记录。',
      required: true,
    },
    {
      name: 'columns',
      type: 'Array<ListInputColumn<T>>',
      description:
        '每个字段一项：{key, header, width?, renderInput, renderValue?}。renderInput 接收 {item, index, updateItem, label, status, ...state}；将 label 配合 isLabelHidden 传入并把 state 展开到输入组件上。',
      required: true,
    },
    {
      name: 'itemName',
      type: 'string',
      description: '单条记录的名词，用于 "Add guest"、"Remove guest 2" 等控件标签。',
      default: "'item'",
    },
    {
      name: 'description',
      type: 'string',
      description: '标签与行之间的辅助说明文字。',
    },
    {
      name: 'status',
      type: 'InputStatus',
      description: '列表级校验状态。其消息在行与 Add 操作之后全宽渲染。',
    },
    {
      name: 'getItemStatus',
      type: '(item: T, index: number) => InputStatus | undefined',
      description: '条目级校验状态：与该记录关联的整行消息。不替代字段级错误。',
    },
    {
      name: 'getFieldStatus',
      type: '(item: T, columnKey: string, index: number) => InputStatus | undefined',
      description: '字段级校验状态，作为 status 传给该单元格的 renderInput，由输入组件渲染。',
    },
    {
      name: 'isReorderable',
      type: 'boolean',
      description:
        '为每行添加拖拽手柄，支持指针、触摸和键盘重排（抓取、方向键移动、放下、Escape 取消）并进行 polite 播报；所有路径通过同一个 onChange 提交。',
      default: 'false',
    },
    {
      name: 'isReadOnly',
      type: 'boolean',
      description:
        '不带编辑控件地渲染值，使用各列的 renderValue（原始类型则回退为 String(item[key])）。',
      default: 'false',
    },
    {
      name: 'isDisabled',
      type: 'boolean',
      description: '禁用集合中的所有控件。',
      default: 'false',
    },
    {
      name: 'isLoading',
      type: 'boolean',
      description: '数据加载期间将表格标记为 aria-busy 并禁用所有控件。',
      default: 'false',
    },
    {
      name: 'maxItems',
      type: 'number',
      description:
        '物理行数上限；达到上限时禁用 Add 操作。最小数量仍由调用方通过 status 表达——移除永远不会被阻止。',
    },
    {
      name: 'xstyle',
      type: 'StyleXStyles',
      description:
        '用于布局自定义的 StyleX 样式（外边距、定位、尺寸）。必须是 stylex.create() 的值，而非内联样式对象如 style={{}}。',
    },
  ],
  theming: {
    targets: [
      {className: 'astryx-list-input', visualProps: []},
    ],
  },
  usage: {
    description:
      'A compact editor for a short, ordered collection of consistent records: guest lists, traveler details, tag options, emergency contacts. Renders a semantic table of per-field inputs with Add/Remove, accessible reorder, focus restoration, and three independent validation scopes (field, item, list).',
    bestPractices: [
      { guidance: true, description: 'Keep collections small: under about seven records and three simple fields per record. Larger consistent datasets belong in Table; heterogeneous records belong in cards or another progressive form pattern.' },
      { guidance: true, description: "Pass the render context's label to each input with isLabelHidden so every cell stays individually named for assistive tech." },
      { guidance: true, description: 'Give records durable ids at creation (e.g. crypto.randomUUID()) so getItemKey stays stable across edits and reorder.' },
      { guidance: true, description: 'Compute statuses on whatever timing the form owns (change, blur, submit); keep them keyed by item id so errors survive reorder.' },
      { guidance: false, description: 'Derive getItemKey from the array index; it detaches focus, DOM state, and errors from their records on reorder.' },
      { guidance: false, description: 'Block removal by hiding the Remove action when the collection would become invalid; express minimum counts through status instead.' },
    ],
  },
};

/** @type {import('../../../core/src/docs-types').TranslationDoc} */
export const docsDense = {
  description: 'Compact editor for a short ordered collection of consistent records: semantic table of per-field inputs with add/remove, accessible reorder, and field/item/list validation.',
  usage: {
    description:
      'A compact editor for a short, ordered collection of consistent records: guest lists, traveler details, tag options, emergency contacts. Renders a semantic table of per-field inputs with Add/Remove, accessible reorder, focus restoration, and three independent validation scopes (field, item, list).',
    bestPractices: [
      { guidance: true, description: 'Keep collections small: under about seven records and three simple fields per record. Larger consistent datasets belong in Table; heterogeneous records belong in cards or another progressive form pattern.' },
      { guidance: true, description: "Pass the render context's label to each input with isLabelHidden so every cell stays individually named for assistive tech." },
      { guidance: true, description: 'Give records durable ids at creation (e.g. crypto.randomUUID()) so getItemKey stays stable across edits and reorder.' },
      { guidance: true, description: 'Compute statuses on whatever timing the form owns (change, blur, submit); keep them keyed by item id so errors survive reorder.' },
      { guidance: false, description: 'Derive getItemKey from the array index; it detaches focus, DOM state, and errors from their records on reorder.' },
      { guidance: false, description: 'Block removal by hiding the Remove action when the collection would become invalid; express minimum counts through status instead.' },
    ],
  },
  propDescriptions: {
    label: 'Accessible name for the collection.',
    value: 'Controlled collection; never mutated.',
    onChange: 'Next collection + change descriptor (add/update/remove/reorder) with key and indexes.',
    getItemKey: 'Stable record key; keeps DOM, focus, and errors with their item.',
    createItem: 'Creates the record appended by Add.',
    columns: '{key, header, width?, renderInput, renderValue?} per field.',
    itemName: "Record noun for control labels; default 'item'.",
    description: 'Supporting text between label and rows.',
    status: 'List-scope status; message renders after rows and Add.',
    getItemStatus: 'Item-scope full-row message for a record.',
    getFieldStatus: "Field-scope status passed to the cell's renderInput.",
    isReorderable: 'Per-row handle; pointer/touch/keyboard reorder, one commit path.',
    isReadOnly: 'Values only, via renderValue or String(item[key]).',
    isDisabled: 'Disables every control.',
    isLoading: 'aria-busy + all controls disabled.',
    maxItems: 'Row limit; disables Add at the limit.',
    xstyle: 'StyleX layout styles; must be stylex.create() value.',
  },
};
