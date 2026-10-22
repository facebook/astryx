// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @type {import('@astryxdesign/cli/authoring').ComponentDoc} */

export const docs = {
  name: 'DropdownMenuItem',
  subComponentOf: 'DropdownMenu',
  displayName: 'Dropdown Menu Item',
  isHiddenFromOverview: true,
  description:
    'Helper component for custom item rendering with consistent styling. Host attributes and DOM event handlers (aria-*, data-*, id, drag and drop) reach the row root, the element carrying role="menuitem".',
  playground: {
    // Standalone DropdownMenuItem has no required props, so the properties-tab
    // preview renders an empty row without seeded content. Seed a label and
    // description so the preview is meaningful.
    defaults: {label: 'Edit', description: 'Modify this item'},
  },
  props: [
    {
      name: 'icon',
      type: 'IconType',
      description:
        'Icon to display before the label. See `astryx docs icons` for valid semantic names.',
    },
    {
      name: 'label',
      type: 'ReactNode',
      description: 'Primary label text.',
    },
    {
      name: 'description',
      type: 'ReactNode',
      description: 'Secondary description text displayed below the label.',
    },
    {
      name: 'onClick',
      type: '(event: MouseEvent) => void',
      description:
        "Callback when the item is selected. A keyboard activation arrives as a synthesized click carrying the key's modifiers. On a row with `href` it runs before the browser navigates and is skipped for a modified click (⌘, Ctrl, Shift, Alt, middle button), which is left to the browser.",
    },
    {
      name: 'href',
      type: 'string',
      description:
        'Address the row navigates to. The row then renders as a real anchor with role="menuitem" (through LinkProvider), so a modified click or a middle click keeps the browser\'s meaning — a new tab — instead of running onClick.',
    },
    {
      name: 'target',
      type: "'_blank' | '_self'",
      description: 'Link target. Only used with href.',
    },
    {
      name: 'rel',
      type: 'string',
      description:
        'Link relationship. noopener noreferrer is added for target="_blank". Only used with href.',
    },
    {
      name: 'endContent',
      type: 'ReactNode',
      description:
        'Additional content rendered after the label and description.',
    },
    {
      name: 'hasCloseOnSelect',
      type: 'boolean',
      description:
        'Whether activating the item closes the menu. Set false for an action that reports its result on the item itself.',
      default: 'true',
    },
    {
      name: 'variant',
      type: "'default' | 'destructive'",
      description:
        "Visual variant. 'destructive' renders the label, description, and icon in the error color for dangerous actions (e.g. Delete).",
      default: "'default'",
    },
    {
      name: 'xstyle',
      type: 'StyleXStyles',
      description:
        'StyleX styles for layout customization (margins, positioning, sizing). Must be a stylex.create() value: not an inline style object like style={{}}.',
    },
    {
      name: 'ref',
      type: 'React.Ref<HTMLElement>',
      description:
        'Ref forwarded to the row root, the element carrying role="menuitem". Register the row with an element-keyed observer or overlay.',
    },
  ],
};

export const docsZh = {
  name: 'DropdownMenuItem',
  isHiddenFromOverview: true,
  displayName: 'Dropdown Menu Item',
  description:
    '用于自定义项渲染的辅助组件，提供一致的样式。宿主属性和 DOM 事件处理器（aria-*、data-*、id、拖放）会落在行根元素上，即带 role="menuitem" 的元素。',
  props: [
    {
      name: 'icon',
      type: 'IconType',
      description: '显示在标签前的图标。',
    },
    {
      name: 'label',
      type: 'ReactNode',
      description: '主标签文本。',
    },
    {
      name: 'description',
      type: 'ReactNode',
      description: '显示在标签下方的次要描述文本。',
    },
    {
      name: 'onClick',
      type: '(event: MouseEvent) => void',
      description:
        '选中该项时的回调。键盘激活会以携带修饰键的合成点击到达；带 href 的行会在浏览器导航前运行，带修饰键的点击则交给浏览器处理。',
    },
    {
      name: 'href',
      type: 'string',
      description:
        '该行导航到的地址。此时该行渲染为带 role="menuitem" 的真实链接，带修饰键的点击或中键点击保留浏览器语义（新标签页）。',
    },
    {
      name: 'target',
      type: "'_blank' | '_self'",
      description: '链接目标。仅与 href 一起使用。',
    },
    {
      name: 'rel',
      type: 'string',
      description: '链接关系。target="_blank" 时自动加入 noopener noreferrer。',
    },
    {
      name: 'endContent',
      type: 'ReactNode',
      description: '在标签和描述之后渲染的附加内容。',
    },
    {
      name: 'hasCloseOnSelect',
      type: 'boolean',
      description:
        '激活该项时是否关闭菜单。若操作要在该项上就地反馈结果，请设为 false。',
      default: 'true',
    },
    {
      name: 'variant',
      type: "'default' | 'destructive'",
      description:
        "视觉变体。'destructive' 会以错误色渲染标签、描述和图标，用于危险操作（如删除）。",
      default: "'default'",
    },
    {
      name: 'xstyle',
      type: 'StyleXStyles',
      description: '根容器的 StyleX 样式。',
    },
    {
      name: 'ref',
      type: 'React.Ref<HTMLElement>',
      description: '转发到行根元素（带 role="menuitem" 的元素）的 ref。',
    },
  ],
};

export const docsDense = {
  name: 'DropdownMenuItem',
  isHiddenFromOverview: true,
  displayName: 'Dropdown Menu Item',
  description: 'helper for custom item rendering w/ consistent styling',
  propDescriptions: {
    icon: 'icon before label',
    label: 'primary label text',
    description: 'secondary text below label',
    onClick:
      'selection callback (event); keyboard activation = synthesized click w/ modifiers; skipped for a modified click on an href row',
    href: 'row is a real anchor w/ role=menuitem; modified/middle click keeps browser meaning',
    target: "link target ('_blank' | '_self'), with href",
    rel: 'link rel; noopener noreferrer added for _blank',
    endContent: 'additional content after label+description',
    hasCloseOnSelect:
      'false keeps the menu open on activation (in-place result on the item)',
    variant:
      "'destructive' renders the item in the error color for dangerous actions",
    xstyle: 'StyleX styles for root container',
    ref: 'forwarded to the row root (the role="menuitem" element)',
  },
};
