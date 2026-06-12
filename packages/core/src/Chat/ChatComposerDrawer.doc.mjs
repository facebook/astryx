// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @type {import('../docs-types').ComponentDoc} */

export const docs = {
  name: 'ChatComposerDrawer',
  subComponentOf: 'Chat',
  displayName: 'Chat Composer Drawer',
  isHiddenFromOverview: true,
  description: "Collapsible drawer panel that sits above the chat input inside XDSChatComposer. Pass it to the composer's `drawer` slot to show attachments, context chips, or any supplementary content. When `count` is provided the drawer gains a collapse toggle — collapsed state shows a badge and label, expanded state shows all children.",
  props: [
    {
      name: 'children',
      type: 'ReactNode',
      description: 'Content to render inside the drawer — tokens, chips, previews, or any React elements.',
      required: true,
    },
    {
      name: 'count',
      type: 'number',
      description: 'Total item count shown in the collapsed badge. When provided, the drawer gains a collapse/expand toggle.',
    },
    {
      name: 'label',
      type: 'string',
      description: 'Label shown next to the count in collapsed state.',
      default: "'Items'",
    },
    {
      name: 'isCollapsed',
      type: 'boolean',
      description: 'Controlled collapsed state. Use with `onCollapsedChange` for external control.',
    },
    {
      name: 'defaultIsCollapsed',
      type: 'boolean',
      description: 'Initial collapsed state for uncontrolled usage.',
      default: 'false',
    },
    {
      name: 'onCollapsedChange',
      type: '(isCollapsed: boolean) => void',
      description: 'Callback fired when the user toggles the drawer.',
    },
  ],
};

export const docsZh = {
  name: 'ChatComposerDrawer',
  isHiddenFromOverview: true,
  displayName: 'Chat Composer Drawer',
  description: '位于聊天输入上方的可折叠抽屉面板。传入 XDSChatComposer 的 `drawer` 插槽，用于显示附件、上下文标签或预览内容。提供 `count` 时启用折叠切换。',
  propDescriptions: {
    children: '抽屉内渲染的内容——标记、标签、预览或任何 React 元素。',
    count: '折叠徽章中显示的总数。提供时，抽屉获得折叠/展开切换。',
    label: '折叠状态下显示在数量旁边的标签。',
    isCollapsed: '受控折叠状态。与 onCollapsedChange 一起使用。',
    defaultIsCollapsed: '非受控模式的初始折叠状态。',
    onCollapsedChange: '用户切换抽屉时触发的回调。',
  },
};

export const docsDense = {
  name: 'ChatComposerDrawer',
  isHiddenFromOverview: true,
  displayName: 'Chat Composer Drawer',
  description: 'collapsible drawer above chat input; pass to composer `drawer` slot for attachments, context chips, previews. `count` enables collapse toggle',
  propDescriptions: {
    children: 'drawer content — tokens, chips, previews, any React elements',
    count: 'total count for collapsed badge; enables collapse/expand toggle',
    label: 'collapsed label next to count badge',
    isCollapsed: 'controlled collapsed state',
    defaultIsCollapsed: 'initial collapsed state (uncontrolled)',
    onCollapsedChange: 'callback on collapse toggle',
  },
};
