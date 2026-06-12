// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @type {import('../docs-types').ComponentDoc} */

export const docs = {
  name: 'ChatMessageList',
  subComponentOf: 'Chat',
  displayName: 'Chat Message List',
  isHiddenFromOverview: true,
  description: `Presentational message container with density context and infinite scroll support. Provides role="log" with aria-live="polite" for accessibility. A flex spacer pushes messages to the bottom when the list isn't full.`,
  props: [
    {
      name: 'children',
      type: 'ReactNode',
      description: 'Message elements — typically XDSChatMessage or XDSChatSystemMessage.',
      required: true,
    },
    {
      name: 'emptyState',
      type: 'ReactNode',
      description: 'Content shown when the list has no messages.',
      slotElements: [
        {
          __element: 'XDSEmptyState',
          props: {
            title: 'No items',
            description: 'Nothing to show.',
          },
        },
      ],
    },
    {
      name: 'scrollToTopAction',
      type: '() => Promise<void>',
      description: 'Async action fired when user scrolls to top. Use for loading older messages. Wrapped in useTransition — shows a spinner at the top while pending.',
    },
    {
      name: 'density',
      type: "'compact' | 'balanced' | 'spacious'",
      description: 'Visual density — flows to child messages via context.',
      default: "'balanced'",
    },
    {
      name: 'gap',
      type: 'SpacingStep',
      description: 'Gap between top-level message rows. Defaults to the selected density; override for LLM event streams or independent rows that need different spacing from density.',
    },
  ],
};

export const docsZh = {
  name: 'ChatMessageList',
  isHiddenFromOverview: true,
  displayName: 'Chat Message List',
  description: '消息展示容器，支持密度上下文和无限滚动。自动滚动由 XDSChatLayout 管理。',
  propDescriptions: {
    children: '消息元素，通常是 XDSChatMessage 或 XDSChatSystemMessage。',
    emptyState: '列表无消息时显示的内容。',
    scrollToTopAction: '用户滚动到顶部时触发的异步操作。用于加载更早的消息。',
    density: '视觉密度，通过上下文传递给子消息。',
    gap: '顶层消息行之间的间距。默认跟随密度；当 LLM 事件流等独立行需要不同间距时可覆盖。',
  },
};

export const docsDense = {
  name: 'ChatMessageList',
  isHiddenFromOverview: true,
  displayName: 'Chat Message List',
  description: 'presentational msg container w/ density context + infinite scroll; auto-scroll owned by XDSChatLayout',
  propDescriptions: {
    children: 'msg elements (XDSChatMessage or XDSChatSystemMessage)',
    emptyState: 'content when no msgs',
    scrollToTopAction: 'async action at scroll top; load older msgs',
    density: 'visual density; flows to children via context',
    gap: 'top-level row gap; defaults to density spacing; override for independent LLM/tool rows',
  },
};
