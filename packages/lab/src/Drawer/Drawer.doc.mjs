// Copyright (c) Meta Platforms, Inc. and affiliates.
/** @type {import('@astryxdesign/cli/authoring').ComponentDoc} */

export const docs = {
  name: 'Drawer',
  displayName: 'Drawer',
  group: 'Drawer',
  category: 'Overlay',
  keywords: [
    'drawer',
    'side panel',
    'panel',
    'inspector',
    'detail view',
    'overlay',
    'slide',
    'sidebar',
    'dialog',
    'side drawer',
  ],
  theming: {
    targets: [{className: 'astryx-drawer', visualProps: ['side']}],
  },
  description:
    'Side panel that floats above page content, using the native <dialog> element. Slides in from the inline start or end edge; full height, never reflows the layout underneath.',
  props: [
    {
      name: 'isOpen',
      type: 'boolean',
      description:
        'Whether the drawer is open. Fully controlled; pair with onOpenChange.',
      required: true,
    },
    {
      name: 'onOpenChange',
      type: '(isOpen: boolean) => void',
      description:
        'Called when the drawer requests an open-state change. Escape, scrim click, and the built-in close button call it with false. The caller owns the open state. With sibling drawers open, Escape only closes the last-opened one.',
      required: true,
    },
    {
      name: 'label',
      type: 'string',
      description:
        'Accessible label for the drawer. Required; the drawer has no built-in heading to derive a name from.',
      required: true,
    },
    {
      name: 'children',
      type: 'ReactNode',
      description:
        'Drawer content, rendered inside a full-height scrollable area. Compose your own header/body/footer; an element with data-autofocus is focused on open. Children stay mounted during the exit animation; keep the last-selected item rendered instead of nulling content on close.',
      required: true,
    },
    {
      name: 'side',
      type: "'start' | 'end'",
      description:
        "Edge the drawer slides from: 'end' is right in LTR (the inspector convention), 'start' is left. Inline axis only; for a bottom sheet use BottomSheet.",
      default: "'end'",
    },
    {
      name: 'width',
      type: 'number | string',
      description:
        "Desktop width budget. A number is pixels; a string is any CSS length ('50%', '32rem'). Below the 640px mobile breakpoint this remains the maximum while the drawer preserves a 56px reveal of the page behind.",
      default: '400',
    },
    {
      name: 'isFullWidthOnMobile',
      type: 'boolean',
      description:
        'Cover the full viewport width below the 640px mobile breakpoint instead of preserving the default 56px reveal of the page behind. The reveal makes the drawer read as an overlay, not a navigation.',
      default: 'false',
    },
    {
      name: 'modality',
      type: "'modal' | 'nonModal'",
      description:
        "Whether the drawer takes the area behind it out of play: not clickable, not tabbable, not in the accessibility tree. 'nonModal' leaves it interactive; Escape still closes while focus is inside. containerRef changes WHICH area, not what the word means — a viewport drawer gets it from showModal() (top layer, focus trap, body scroll lock), a bounded one by making its container inert. A bounded modal is therefore not aria-modal and does not lock body scroll.",
      default: "'modal'",
    },
    {
      name: 'hasScrim',
      type: 'boolean',
      description:
        'Whether to paint a scrim over the area behind the drawer. What the user SEES; modality is what is enforced. Defaults to match modality — a modal drawer scrims, a non-modal one does not — so set it only to have them apart: a non-modal inspector that still dims its context, or a modal over content that should stay legible. For modal drawers the scrim is also the pointer-dismissal surface; a non-modal scrim is paint only and does not intercept the interactive area behind it.',
      default: "modality === 'modal'",
    },
    {
      name: 'containerRef',
      type: 'React.RefObject<HTMLElement | null>',
      description:
        "Bind the drawer to an element instead of the viewport: the panel is portalled into it and slides against ITS edge, at its height — the inspector that belongs to one pane rather than the whole screen. Give the container position: relative; it needs no overflow rule — the drawer clips itself to the container, and it stays put in the container's scrollport when the pane scrolls. Scope only: it narrows what modality and hasScrim apply TO (the container, not the page) without changing what either means. A bounded modal blocks its container with inert rather than the top layer, so the rest of the page stays live. Two bounded drawers in one container stack the same way sibling drawers do: the front one stays interactive and the one behind it is blocked with the rest of the container.",
    },
    {
      name: 'hasCloseButton',
      type: 'boolean',
      description:
        'Built-in close button in the top-trailing corner. Enabled by default for both modal and non-modal drawers so every overlay has an obvious dismissal affordance.',
      default: 'true',
    },
  ],
  usage: {
    description:
      'A side panel that floats above page content for inspectors and detail views: the "click a table row, see its details" pattern. Unlike a docked panel it overlays the layout instead of reflowing it. Works on desktop and touch: the width budget applies on desktop and the panel preserves a 56px page reveal below 640px without exceeding the width budget. Escape closes the drawer and focus returns to the element that opened it. Entry/exit slide animation respects prefers-reduced-motion. Stacking contract: sibling drawers stack last-opened on top, Escape closes only the topmost, and closing peels innermost-first; render them as siblings, never nested. containerRef binds the drawer to an element instead of the viewport, for a pane-level inspector; modality then applies to that container rather than the page, enforced with inert since a bounded panel cannot use the browser top layer.',
    bestPractices: [
      {
        guidance: true,
        description:
          'Use for contextual detail views (row inspectors, entity details) where the user should keep the underlying list in sight.',
      },
      {
        guidance: true,
        description:
          'Keep the caller as the source of truth: derive isOpen from selection state and clear the selection in onOpenChange.',
      },
      {
        guidance: true,
        description:
          'Use modality="nonModal" for master-detail flows; non-modal drawers do not trap focus and the area behind stays interactive.',
      },
      {
        guidance: true,
        description:
          'Keep the last-selected item rendered on close: children stay mounted during the exit animation, so nulling content mid-close blanks the panel while it slides out.',
      },
      {
        guidance: true,
        description:
          'Use containerRef when the drawer belongs to one pane rather than the page — a split view, a dashboard card, a canvas. Give the container position: relative; it needs no overflow rule — the drawer clips itself to the container.',
      },
      {
        guidance: false,
        description:
          'Expect a bounded modal to be aria-modal or to lock body scroll: the browser top layer is always viewport-sized, so a bounded drawer blocks its container with inert instead. Use the viewport drawer when the whole page must be blocked.',
      },
      {
        guidance: false,
        description:
          'Use a Drawer for short confirmations or small forms; use Dialog or AlertDialog instead.',
      },
      {
        guidance: false,
        description:
          'Reach for a Drawer when the content should push the page aside; a Drawer floats over content, so use a docked panel or layout column instead.',
      },
      {
        guidance: false,
        description:
          'Use a Drawer as a bottom or top sheet; it is inline-axis only, so use BottomSheet for block-axis sheets.',
      },
      {
        guidance: false,
        description:
          'Nest a Drawer inside another Drawer; render drawers as siblings; the last-opened stacks on top and Escape closes it first.',
      },
    ],
  },
  examples: [
    {
      label: 'Wide desktop panel, full-width on mobile',
      code: `const [isOpen, setIsOpen] = useState(false);
<Drawer
  isOpen={isOpen}
  onOpenChange={setIsOpen}
  label="Filters"
  width={560}
  isFullWidthOnMobile>
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
    onOpenChange={isOpen => !isOpen && setOrder(null)}
    label="Order details"
    modality="nonModal">
    <OrderDetails order={order} onSelectLineItem={setLineItem} />
  </Drawer>
  <Drawer
    isOpen={lineItem != null}
    onOpenChange={isOpen => !isOpen && setLineItem(null)}
    label="Line item"
    modality="nonModal">
    <LineItemDetails item={lineItem} />
  </Drawer>
</>
// Last-opened stacks on top; Escape closes the line item first.`,
    },
    {
      label: 'Bounded to a pane (containerRef)',
      code: `const paneRef = useRef(null);
const [selected, setSelected] = useState(null);
<div ref={paneRef} style={{position: 'relative'}}>
  <HostTable onSelect={setSelected} />
</div>
<Drawer
  isOpen={selected != null}
  onOpenChange={isOpen => !isOpen && setSelected(null)}
  label="Host details"
  containerRef={paneRef}>
  <HostDetails host={selected} />
</Drawer>
// The panel slides against the pane's edge, at the pane's height.`,
    },
  ],
};

/** @type {import('@astryxdesign/cli/authoring').ComponentTranslationDoc} */
export const docsZh = {
  usage: {
    description:
      '浮在页面内容之上的侧边面板，用于检查器和详情视图——"点击表格行查看详情"的模式。与停靠面板不同，它覆盖在布局之上，不会挤压页面。桌面端按 width 设定宽度，宽度小于 640px 时保留 56px 的底层页面，并且不超过 width 上限。按 Escape 关闭抽屉，焦点返回到打开它的元素。滑入/滑出动画遵循 prefers-reduced-motion。堆叠约定：同级抽屉后开的在上层，Escape 只关闭最上层的，关闭顺序由内向外——请以同级方式渲染，切勿嵌套。containerRef 可将抽屉绑定到某个元素而非视口，用于面板级检查器；modality 作用于该容器而非整个页面，模态受限抽屉通过 inert 阻止容器内的背景交互。',
    bestPractices: [
      {
        guidance: true,
        description:
          '用于上下文详情视图（行检查器、实体详情），让用户保持对底层列表的可见性。',
      },
      {
        guidance: true,
        description:
          '让调用方作为唯一数据源：从选中状态派生 isOpen，并在 onOpenChange 中清除选中。',
      },
      {
        guidance: true,
        description:
          '在主从流程中使用 modality="nonModal"——非模态抽屉不捕获焦点，抽屉后面的区域保持可交互。',
      },
      {
        guidance: true,
        description:
          '关闭时保留最后选中的内容：退出动画期间子内容仍然挂载，中途置空会让面板在滑出时变为空白。',
      },
      {
        guidance: true,
        description:
          '当抽屉属于某个面板而非整个页面（分栏视图、仪表盘卡片、画布）时使用 containerRef，并给容器设置 position: relative；无需设置 overflow，抽屉会自行裁剪到容器内。',
      },
      {
        guidance: false,
        description:
          '不要期望受限模态抽屉具有 aria-modal 或锁定页面滚动：浏览器顶层始终是视口大小，因此受限抽屉改用 inert 阻挡其容器。需要阻挡整个页面时请使用视口抽屉。',
      },
      {
        guidance: false,
        description:
          '用 Drawer 做简短确认或小表单——请改用 Dialog 或 AlertDialog。',
      },
      {
        guidance: false,
        description:
          '需要把页面内容挤开时不要用 Drawer——它浮在内容之上，请改用停靠面板或布局分栏。',
      },
      {
        guidance: false,
        description:
          '不要把 Drawer 当作底部/顶部面板使用——它只支持行内轴，块轴面板请用 BottomSheet。',
      },
      {
        guidance: false,
        description:
          '在 Drawer 中嵌套另一个 Drawer；应以同级方式渲染——后开的堆叠在上层，Escape 先关闭它。',
      },
    ],
  },
};

/** @type {import('@astryxdesign/cli/authoring').ComponentTranslationDoc} */
export const docsDense = {
  description:
    'side panel floating over content (native <dialog>): start/end edge, full height',
  usage: {
    description:
      'Overlay side panel for inspectors and detail views; floats over content, never reflows it. width = desktop budget; 56px page reveal below 640px, capped by width (isFullWidthOnMobile for all of it). Escape closes topmost; focus restores to the opener. Siblings stack last-opened on top; never nest. Slide animation respects prefers-reduced-motion. containerRef binds it to an element (needs position: relative) for a pane-level inspector; modality then scopes to that container, enforced with inert.',
    bestPractices: [
      {
        guidance: true,
        description: 'Use for row inspectors and entity detail views.',
      },
      {
        guidance: true,
        description:
          'Derive isOpen from selection state; clear it in onOpenChange.',
      },
      {
        guidance: true,
        description:
          'Use modality="nonModal" for non-modal master-detail flows (no focus trap, area behind stays interactive).',
      },
      {
        guidance: true,
        description:
          'Keep last-selected content rendered on close (children stay mounted during exit).',
      },
      {
        guidance: true,
        description:
          'Use containerRef for a pane-level inspector; container needs position: relative.',
      },
      {
        guidance: false,
        description:
          'Use for confirmations or small forms; use Dialog instead.',
      },
      {
        guidance: false,
        description:
          'Use when content should push the page aside (it floats over) or as a bottom sheet (use BottomSheet).',
      },
      {
        guidance: false,
        description:
          'Nest Drawers: render as siblings; Escape closes the last-opened first.',
      },
    ],
  },
};
