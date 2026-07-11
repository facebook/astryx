// Copyright (c) Meta Platforms, Inc. and affiliates.
/** @type {import('../../core/src/docs-types').ComponentDoc} */

export const docs = {
  name: 'Drawer',
  displayName: 'Drawer',
  group: 'Drawer',
  category: 'Overlay',
  keywords: ["drawer","side panel","panel","inspector","detail view","overlay","slide","sheet","bottom sheet","sidebar","dialog","collapse","rail"],
  theming: {
    targets: [
      {className: 'astryx-drawer', visualProps: ['side']},
    ],
  },
  description: 'Edge-anchored overlay panel using the native <dialog> element. Slides in from the start/end edge (side panel) or top/bottom edge (full-width sheet).',
  props: [
    {
      name: 'isOpen',
      type: 'boolean',
      description: 'Whether the drawer is open. Fully controlled; pair with onClose.',
      required: true,
    },
    {
      name: 'onClose',
      type: '() => void',
      description: 'Called when the drawer requests to be closed (Escape key, scrim click, built-in close button). The caller owns the open state. With sibling drawers open, Escape only closes the last-opened one.',
      required: true,
    },
    {
      name: 'label',
      type: 'string',
      description: 'Accessible label for the drawer. Required; the drawer has no built-in heading to derive a name from. Also names the built-in collapse/expand affordances.',
      required: true,
    },
    {
      name: 'children',
      type: 'ReactNode',
      description: 'Drawer content, rendered inside a full-height scrollable area. Compose your own header/body/footer; an element with data-autofocus is focused on open. Children stay mounted during the exit animation; keep the last-selected item rendered instead of nulling content on close.',
      required: true,
    },
    {
      name: 'side',
      type: "'start' | 'end' | 'top' | 'bottom'",
      description: "Edge the drawer slides from: 'end' is right in LTR (the inspector convention), 'start' is left; 'top' and 'bottom' render full-width sheets on the block axis.",
      default: "'end'",
    },
    {
      name: 'size',
      type: 'number | string',
      description: "Size budget along the slide axis: width for start/end, height for top/bottom. A number is pixels; a string is any CSS length ('50%', '40dvh'). On viewports smaller than the budget the drawer fills the axis.",
      default: '400',
    },
    {
      name: 'hasScrim',
      type: 'boolean',
      description: 'Modal scrim behind the drawer. true uses showModal() (top layer, focus trap, scroll lock; clicking the scrim closes; modal only); false uses show() for a non-modal overlay that does NOT trap focus and keeps the page behind interactive.',
      default: 'true',
    },
    {
      name: 'hasCloseButton',
      type: 'boolean',
      description: 'Built-in close button in the top-trailing corner. Defaults to the hasScrim value: modal drawers get one, non-modal drawers don\'t.',
      default: 'hasScrim',
    },
    {
      name: 'isCollapsed',
      type: 'boolean',
      description: 'Collapse the drawer to a narrow click-to-expand rail showing the label vertically. Only supported for non-modal (hasScrim={false}) start/end drawers; ignored with a dev warning otherwise. Controlled; pair with onCollapsedChange.',
    },
    {
      name: 'onCollapsedChange',
      type: '(collapsed: boolean) => void',
      description: 'Called by the built-in collapse/expand affordances. Providing it renders a collapse toggle next to the close button while expanded; the collapsed rail always expands on click.',
    },
  ],
  usage: {
    description: 'An edge-anchored overlay for inspectors, detail views, and sheets: the "click a table row, see its details" pattern. Escape closes the drawer and focus returns to the element that opened it. Entry/exit slide animation respects prefers-reduced-motion. Stacking contract: sibling drawers stack last-opened on top, Escape closes only the topmost, and closing peels innermost-first; render them as siblings, never nested.',
    bestPractices: [
      { guidance: true, description: 'Use for contextual detail views (row inspectors, entity details) where the user should keep the underlying list in sight.' },
      { guidance: true, description: 'Keep the caller as the source of truth: derive isOpen from selection state and clear the selection in onClose.' },
      { guidance: true, description: 'Use hasScrim={false} for master-detail flows; non-modal drawers do not trap focus and the page behind stays interactive.' },
      { guidance: true, description: 'Keep the last-selected item rendered on close: children stay mounted during the exit animation, so nulling content mid-close blanks the panel while it slides out.' },
      { guidance: true, description: 'Use isCollapsed/onCollapsedChange for persistent non-modal side panels; the collapsed rail is click-to-expand.' },
      { guidance: false, description: 'Use a Drawer for short confirmations or small forms; use Dialog or AlertDialog instead.' },
      { guidance: false, description: 'Nest a Drawer inside another Drawer; render drawers as siblings; the last-opened stacks on top and Escape closes it first.' },
    ],
  },
  examples: [
    {
      label: 'Bottom sheet',
      code: `const [isOpen, setIsOpen] = useState(false);
<Drawer
  isOpen={isOpen}
  onClose={() => setIsOpen(false)}
  label="Filters"
  side="bottom"
  size="40dvh">
  <FilterControls />
</Drawer>`,
    },
    {
      label: 'Stacked drill-in (siblings, not nested)',
      code: `const [order, setOrder] = useState(null);
const [lineItem, setLineItem] = useState(null);
<>
  <Drawer
    isOpen={order != null}
    onClose={() => setOrder(null)}
    label="Order details"
    hasScrim={false}>
    <OrderDetails order={order} onSelectLineItem={setLineItem} />
  </Drawer>
  <Drawer
    isOpen={lineItem != null}
    onClose={() => setLineItem(null)}
    label="Line item"
    hasScrim={false}>
    <LineItemDetails item={lineItem} />
  </Drawer>
</>
// Last-opened stacks on top; Escape closes the line item first.`,
    },
  ],
};

/** @type {import('../docs-types').TranslationDoc} */
export const docsZh = {
  usage: {
    description: '用于检查器、详情视图和面板的边缘浮层——"点击表格行查看详情"的模式。按 Escape 关闭抽屉，焦点返回到打开它的元素。滑入/滑出动画遵循 prefers-reduced-motion。堆叠约定：同级抽屉后开的在上层，Escape 只关闭最上层的，关闭顺序由内向外——请以同级方式渲染，切勿嵌套。',
    bestPractices: [
      { guidance: true, description: '用于上下文详情视图（行检查器、实体详情），让用户保持对底层列表的可见性。' },
      { guidance: true, description: '让调用方作为唯一数据源：从选中状态派生 isOpen，并在 onClose 中清除选中。' },
      { guidance: true, description: '在主从流程中使用 hasScrim={false}——非模态抽屉不捕获焦点，抽屉后面的页面保持可交互。' },
      { guidance: true, description: '关闭时保留最后选中的内容：退出动画期间子内容仍然挂载，中途置空会让面板在滑出时变为空白。' },
      { guidance: true, description: '对常驻的非模态侧面板使用 isCollapsed/onCollapsedChange；折叠后的窄条点击即可展开。' },
      { guidance: false, description: '用 Drawer 做简短确认或小表单——请改用 Dialog 或 AlertDialog。' },
      { guidance: false, description: '在 Drawer 中嵌套另一个 Drawer；应以同级方式渲染——后开的堆叠在上层，Escape 先关闭它。' },
    ],
  },
};

/** @type {import('../docs-types').TranslationDoc} */
export const docsDense = {
  description: 'edge-anchored overlay (native <dialog>): start/end side panel or top/bottom sheet',
  usage: {
    description: 'Overlay for inspectors, detail views, and sheets. Escape closes topmost; focus restores to the opener. Siblings stack last-opened on top; never nest. Slide animation respects prefers-reduced-motion.',
    bestPractices: [
      { guidance: true, description: 'Use for row inspectors and entity detail views.' },
      { guidance: true, description: 'Derive isOpen from selection state; clear it in onClose.' },
      { guidance: true, description: 'Use hasScrim={false} for non-modal master-detail flows (no focus trap, page stays interactive).' },
      { guidance: true, description: 'Keep last-selected content rendered on close (children stay mounted during exit).' },
      { guidance: true, description: 'Use isCollapsed/onCollapsedChange for persistent panels; rail is click-to-expand.' },
      { guidance: false, description: 'Use for confirmations or small forms; use Dialog instead.' },
      { guidance: false, description: 'Nest Drawers: render as siblings; Escape closes the last-opened first.' },
    ],
  },
};
