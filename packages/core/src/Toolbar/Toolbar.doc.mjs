// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @type {import('../docs-types').ComponentDoc} */

export const docs = {
  name: 'Toolbar',
  displayName: 'Toolbar',
  category: 'Navigation',
  keywords: ['toolbar', 'nav', 'bar', 'actions', 'buttonbar', 'header', 'footer', 'action-bar', 'control-bar'],
  theming: {
    targets: [
      {className: 'xds-toolbar', states: ['density']},
    ],
  },
  components: [
    {
      name: 'XDSToolbar',
      displayName: 'Toolbar',
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
          slotElements: [{__element: 'XDSIcon', props: {icon: 'check', size: 'sm'}}],
        },
        {
          name: 'centerContent',
          type: 'ReactNode',
          description:
            'Centered content. Switches layout to CSS grid (1fr auto 1fr).',
          slotElements: [{__element: 'XDSText', props: {type: 'body', weight: 'bold'}, children: 'Center'}],
        },
        {
          name: 'endContent',
          type: 'ReactNode',
          description: 'Content aligned to the end (right in LTR).',
          slotElements: [
            {__element: 'XDSIcon', props: {icon: 'chevronDown', size: 'sm'}},
            {__element: 'XDSBadge', props: {label: '3'}},
          ],
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
      ],    },
  ],
  usage: {
    description:
      'Toolbar is a horizontal bar with left, center, and right areas. Use it for contextual actions within a content area — above a table, inside a card, or in a panel — not as a page-level header. Set the size once on the toolbar and all buttons, inputs, and tabs inside it match automatically.',
    bestPractices: [
      {guidance: true, description: 'Put secondary actions like "Back" on the left, and primary actions like "Save" on the right.'},
      {guidance: true, description: 'Make temporary toolbars like bulk selection visually distinct so users can tell they\'re contextual — for example, with a background color or border.'},
      {guidance: true, description: 'Visually separate the toolbar from the content below it — with a divider, a background variant, or both.'},
      {guidance: true, description: 'Use Toolbar as a card header when the header has interactive actions like filter or add — it gives you slot layout, keyboard navigation, and size cascading. If the header is just a title with no actions, a LayoutHeader or Section is enough.'},
      {guidance: false, description: 'Put too many actions in one toolbar — move less common items into a MoreMenu.'},
      {guidance: false, description: 'Set size on individual child buttons — set it once on the toolbar and it cascades automatically.'},
      {guidance: false, description: 'Use Toolbar for app-wide navigation like main menu links or sign out — use TopNav or LayoutHeader for that.'},
    ],
  },
};

/** @type {import('../docs-types').TranslationDoc} */
export const docsZh = {
  components: [
    {
      name: 'XDSToolbar',
      displayName: 'Toolbar',
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
  usage: {
    description:
      'Toolbar is a horizontal bar with left, center, and right areas. Use it for contextual actions within a content area — above a table, inside a card, or in a panel — not as a page-level header. Set the size once on the toolbar and all buttons, inputs, and tabs inside it match automatically.',
    bestPractices: [
      {guidance: true, description: 'Put secondary actions like "Back" on the left, and primary actions like "Save" on the right.'},
      {guidance: true, description: 'Make temporary toolbars like bulk selection visually distinct so users can tell they\'re contextual — for example, with a background color or border.'},
      {guidance: true, description: 'Visually separate the toolbar from the content below it — with a divider, a background variant, or both.'},
      {guidance: true, description: 'Use Toolbar as a card header when the header has interactive actions like filter or add — it gives you slot layout, keyboard navigation, and size cascading. If the header is just a title with no actions, a LayoutHeader or Section is enough.'},
      {guidance: false, description: 'Put too many actions in one toolbar — move less common items into a MoreMenu.'},
      {guidance: false, description: 'Set size on individual child buttons — set it once on the toolbar and it cascades automatically.'},
      {guidance: false, description: 'Use Toolbar for app-wide navigation like main menu links or sign out — use TopNav or LayoutHeader for that.'},
    ],
  },
};

/** @type {import('../docs-types').TranslationDoc} */
export const docsDense = {
  description: 'Horizontal bar w/ left, center, right areas. For contextual actions in content, not page headers. Size cascades to children.',
  usage: {
    description:
      'Horizontal bar w/ left, optional center, right. For contextual actions within content (tables, cards, panels) — not page-level headers. Size cascades to children.',
    bestPractices: [
      {guidance: true, description: 'Secondary actions (Back) left, primary actions (Save) right.'},
      {guidance: true, description: 'Make temporary toolbars (bulk selection) visually distinct — e.g. background color or border.'},
      {guidance: true, description: 'Separate toolbar from content — divider, background variant, or both.'},
      {guidance: true, description: 'Use Toolbar as card header when it has actions (filter, add). Just a title? Use LayoutHeader/Section.'},
      {guidance: false, description: 'Overload with actions — use MoreMenu for overflow.'},
      {guidance: false, description: 'Set size on child buttons — set once on toolbar, it cascades.'},
      {guidance: false, description: 'Use for app-wide nav (menu links, sign out) — use TopNav/LayoutHeader.'},
    ],
  },
  components: [
    {
      name: 'XDSToolbar',
      displayName: 'Toolbar',
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
