/** @type {import('../docs-types').ComponentDoc} */

export const docs = {
  name: 'Toolbar',
  description:
    'General-purpose toolbar with start, center, and end content slots. Built on XDSSection with roving tabindex keyboard navigation.',
  features: [
    'Slot-based layout — startContent, centerContent, and endContent for flexible organization',
    'Three-column centering — centerContent switches to CSS grid (1fr auto 1fr) for true centering',
    'Roving tabindex — arrow key navigation via useListFocus with orientation support',
    'Density variants — default (40px) and compact (32px) minimum heights',
    'Configurable gap — spacing scale gap between items within each slot',
    'Built on XDSSection — inherits variant, theming, and nesting behavior',
    'Composable overflow — use XDSOverflowList within slots for responsive collapsing',
  ],
  examples: [
    {
      label: 'Basic toolbar with start and end actions',
      code: `<XDSToolbar
  label="Text formatting"
  startContent={
    <>
      <XDSButton label="Bold" variant="ghost" icon={<BoldIcon />} />
      <XDSButton label="Italic" variant="ghost" icon={<ItalicIcon />} />
      <XDSButton label="Underline" variant="ghost" icon={<UnderlineIcon />} />
    </>
  }
  endContent={
    <XDSButton label="Settings" variant="ghost" icon={<Cog6ToothIcon />} />
  }
/>`,
    },
    {
      label: 'Three-slot layout with centered content',
      code: `<XDSToolbar
  label="Document actions"
  startContent={<XDSButton label="Back" variant="ghost" />}
  centerContent={<XDSText>Document Title</XDSText>}
  endContent={<XDSButton label="Save" variant="primary" />}
/>`,
    },
    {
      label: 'Card header pattern',
      code: `<XDSCard>
  <XDSToolbar
    label="Card actions"
    startContent={<XDSText weight="bold">Users</XDSText>}
    endContent={
      <>
        <XDSButton label="Filter" variant="ghost" icon={<FunnelIcon />} />
        <XDSButton label="Add" variant="primary" />
      </>
    }
  />
  <XDSSection>{/* card body */}</XDSSection>
</XDSCard>`,
    },
    {
      label: 'With XDSOverflowList for responsive collapsing',
      code: `<XDSToolbar
  label="Actions"
  startContent={
    <XDSOverflowList
      items={actions}
      renderItem={(action) => (
        <XDSButton key={action.id} label={action.label} variant="ghost" />
      )}
      renderOverflow={(items) => (
        <XDSDropdownMenu
          trigger={<XDSButton label="More" variant="ghost" />}
          items={items.map(a => ({label: a.label, onSelect: a.onSelect}))}
        />
      )}
    />
  }
/>`,
    },
    {
      label: 'Compact density',
      code: `<XDSToolbar
  label="Compact actions"
  density="compact"
  startContent={
    <>
      <XDSButton label="Cut" variant="ghost" size="sm" />
      <XDSButton label="Copy" variant="ghost" size="sm" />
      <XDSButton label="Paste" variant="ghost" size="sm" />
    </>
  }
/>`,
    },
  ],
  theming: {
    targets: [
      {className: 'xds-toolbar', states: ['density']},
    ],
  },
  accessibility: [
    'Inner element renders role="toolbar" with aria-label from label prop',
    'aria-orientation reflects the orientation prop (horizontal or vertical)',
    'Roving tabindex via useListFocus — arrow keys move focus between focusable items (buttons, inputs, [tabindex="0"])',
    'Home/End keys jump to first/last focusable item',
    'Horizontal orientation: ArrowLeft/ArrowRight navigate; Vertical orientation: ArrowUp/ArrowDown navigate',
  ],
  keyboard:
    'ArrowLeft/ArrowRight (horizontal) or ArrowUp/ArrowDown (vertical) to move between items; Home/End for first/last item',
  notes: [
    'Built on XDSSection — variant prop controls background (default: transparent)',
    'Two-slot layout (no centerContent): flex row with space-between',
    'Three-slot layout (with centerContent): CSS grid 1fr auto 1fr for true centering',
    'startContent only: fills width; endContent only: aligns to end',
    'centerContent has min-width:0 and overflow:hidden for graceful truncation',
    'No built-in overflow — compose with XDSOverflowList for responsive collapsing',
    'Density controls minimum height — compact: 32px, default: 40px',
    'Gap prop controls spacing between items within slots (default: --spacing-2 / 8px)',
  ],
  components: [
    {
      name: 'XDSToolbar',
      description:
        'General-purpose toolbar container with three content slots and roving tabindex.',
      props: [
        {
          name: 'label',
          type: 'string',
          description: 'Accessible label for the toolbar, applied as aria-label.',
          required: true,
        },
        {
          name: 'startContent',
          type: 'ReactNode',
          description: 'Content aligned to the start (left in LTR).',
        },
        {
          name: 'centerContent',
          type: 'ReactNode',
          description:
            'Centered content. Switches layout to CSS grid (1fr auto 1fr).',
        },
        {
          name: 'endContent',
          type: 'ReactNode',
          description: 'Content aligned to the end (right in LTR).',
        },
        {
          name: 'density',
          type: "'compact' | 'default'",
          description: 'Toolbar density. Controls minimum height.',
          default: "'default'",
        },
        {
          name: 'gap',
          type: 'SpacingStep',
          description: 'Gap between items within each slot.',
          default: '2',
        },
        {
          name: 'orientation',
          type: "'horizontal' | 'vertical'",
          description:
            'Orientation for keyboard navigation. Controls arrow key direction.',
          default: "'horizontal'",
        },
        {
          name: 'variant',
          type: 'XDSSectionVariant',
          description: 'Visual variant passed to XDSSection.',
          default: "'transparent'",
        },
        {
          name: 'xstyle',
          type: 'StyleXStyles',
          description:
            'StyleX styles for layout customization. Must be a stylex.create() value.',
        },
      ],
      examples: [
        {
          label: 'Basic',
          code: `<XDSToolbar
  label="Actions"
  startContent={<XDSButton label="Save" variant="primary" />}
  endContent={<XDSButton label="Cancel" variant="ghost" />}
/>`,
        },
        {
          label: 'With centered content',
          code: `<XDSToolbar
  label="Editor"
  startContent={<XDSButton label="Back" variant="ghost" />}
  centerContent={<XDSText>Document.tsx</XDSText>}
  endContent={<XDSButton label="Publish" variant="primary" />}
/>`,
        },
      ],
    },
  ],
};

/** @type {import('../docs-types').TranslationDoc} */
export const docsZh = {
  description:
    '通用工具栏，提供起始、居中和结束内容插槽。基于 XDSSection 构建，支持循环 Tab 键盘导航。',
  features: [
    '插槽式布局 — startContent、centerContent 和 endContent 灵活组织',
    '三列居中 — centerContent 切换为 CSS grid（1fr auto 1fr）实现真正居中',
    '循环 Tab — 通过 useListFocus 实现方向键导航',
    '密度变体 — default（40px）和 compact（32px）最小高度',
    '可配置间距 — 使用间距尺度设置插槽内项目间距',
    '基于 XDSSection — 继承变体、主题化和嵌套行为',
    '可组合溢出 — 在插槽中使用 XDSOverflowList 实现响应式折叠',
  ],
  accessibility: [
    '内部元素渲染 role="toolbar"，从 label 属性设置 aria-label',
    'aria-orientation 反映 orientation 属性（horizontal 或 vertical）',
    '通过 useListFocus 实现循环 Tab — 方向键在可聚焦项之间移动焦点',
    'Home/End 键跳转到第一个/最后一个可聚焦项',
    '水平方向：ArrowLeft/ArrowRight 导航；垂直方向：ArrowUp/ArrowDown 导航',
  ],
  keyboard:
    'ArrowLeft/ArrowRight（水平）或 ArrowUp/ArrowDown（垂直）移动项目；Home/End 跳转首/末项',
  notes: [
    '基于 XDSSection — variant 属性控制背景（默认：transparent）',
    '两插槽布局（无 centerContent）：flex 行 + space-between',
    '三插槽布局（有 centerContent）：CSS grid 1fr auto 1fr 实现真正居中',
    'startContent 独占：填充宽度；endContent 独占：靠右对齐',
    'centerContent 设置 min-width:0 和 overflow:hidden 以优雅截断',
    '无内置溢出 — 组合 XDSOverflowList 实现响应式折叠',
    '密度控制最小高度 — compact: 32px，default: 40px',
    'gap 属性控制插槽内项目间距（默认：--spacing-2 / 8px）',
  ],
  components: [
    {
      name: 'XDSToolbar',
      description: '通用工具栏容器，提供三个内容插槽和循环 Tab。',
      propDescriptions: {
        label: '工具栏的无障碍标签，作为 aria-label 应用。',
        startContent: '起始内容（LTR 中靠左对齐）。',
        centerContent: '居中内容。切换为 CSS grid（1fr auto 1fr）。',
        endContent: '结束内容（LTR 中靠右对齐）。',
        density: '工具栏密度。控制最小高度。',
        gap: '插槽内项目间距。',
        orientation: '键盘导航方向。控制方向键方向。',
        variant: '传递给 XDSSection 的视觉变体。',
        xstyle: '用于布局自定义的 StyleX 样式。必须是 stylex.create() 的值。',
      },
    },
  ],
};

/** @type {import('../docs-types').TranslationDoc} */
export const docsDense = {
  description: 'General-purpose toolbar w/ start/center/end slots. Built on XDSSection w/ roving tabindex.',
  features: [
    'Slot-based layout; startContent, centerContent, endContent',
    'Three-column centering; centerContent switches to CSS grid (1fr auto 1fr)',
    'Roving tabindex; arrow key nav via useListFocus w/ orientation',
    'Density variants; default (40px) + compact (32px) min-height',
    'Configurable gap; spacing scale gap between slot items',
    'Built on XDSSection; inherits variant, theming, nesting',
    'Composable overflow; use XDSOverflowList for responsive collapsing',
  ],
  accessibility: [
    'role="toolbar" w/ aria-label from label prop.',
    'aria-orientation reflects orientation prop.',
    'Roving tabindex via useListFocus; arrows move focus between items.',
    'Home/End jump to first/last item.',
    'Horizontal: Left/Right; Vertical: Up/Down.',
  ],
  keyboard: 'Left/Right (horiz) or Up/Down (vert) between items; Home/End for first/last.',
  notes: [
    'Built on XDSSection; variant controls bg (default: transparent).',
    'Two-slot (no center): flex row w/ space-between.',
    'Three-slot (w/ center): CSS grid 1fr auto 1fr.',
    'startOnly fills width; endOnly aligns right.',
    'centerContent: min-width:0 + overflow:hidden for truncation.',
    'No built-in overflow; compose w/ XDSOverflowList.',
    'Density: compact=32px, default=40px min-height.',
    'Gap: spacing between slot items (default: --spacing-2/8px).',
  ],
  components: [
    {
      name: 'XDSToolbar',
      description: 'Toolbar container w/ 3 content slots + roving tabindex.',
      propDescriptions: {
        label: 'A11y label, aria-label on toolbar.',
        startContent: 'Start-aligned content.',
        centerContent: 'Centered content; switches to 3-col grid.',
        endContent: 'End-aligned content.',
        density: 'Toolbar density; controls min-height.',
        gap: 'Gap between slot items.',
        orientation: 'Keyboard nav direction.',
        variant: 'Visual variant for XDSSection.',
        xstyle: 'StyleX layout styles. Must be stylex.create() value.',
      },
    },
  ],
};
