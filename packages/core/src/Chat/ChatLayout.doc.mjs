// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @type {import('../docs-types').ComponentDoc} */

export const docs = {
  name: 'ChatLayout',
  subComponentOf: 'Chat',
  displayName: 'Chat Layout',
  description: 'Layout shell for full chat interfaces. Messages flow in normal page flow, composer is fixed to the bottom with a frosted glass dock. Adapts density (compact/balanced/spacious) automatically via container width observation. Includes built-in auto-scroll, a "New messages" scroll-to-bottom button, and a frosted glass blur layer behind the composer. By default the layout root is the scroll container; pass scrollRef to delegate scrolling to a parent element or the document body.',
  props: [
    {
      name: 'children',
      type: 'ReactNode',
      description: 'Message content — typically XDSChatMessageList. Flows naturally in the page and scrolls with the container.',
      required: true,
    },
    {
      name: 'composer',
      type: 'ReactNode',
      description: 'Composer element — typically XDSChatComposer. Fixed to the bottom with a frosted glass dock.',
      required: true,
      slotElements: [
        {
          __element: 'XDSTextInput',
          props: {
            label: 'Input',
            placeholder: 'Type here...',
          },
        },
      ],
    },
    {
      name: 'emptyState',
      type: 'ReactNode',
      description: 'Content shown when children is empty. Centered vertically in the message area.',
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
      name: 'scrollButton',
      type: 'ReactNode | null',
      description: 'Scroll-to-bottom button rendered above the composer. Defaults to XDSChatLayoutScrollButton with auto-scroll integration. Pass null to hide.',
    },
    {
      name: 'scrollRef',
      type: 'React.RefObject<HTMLElement | null>',
      description: 'External scroll container ref. When provided, auto-scroll and scroll-to-bottom target this element instead of the layout root. Use when the chat is embedded in a page where a parent element or the document body scrolls.',
    },
  ],
  usage: {
    description: 'XDSChatLayout is the layout shell for full-page chat interfaces. It renders messages in normal page flow and docks the composer to the bottom with a frosted glass blur layer. Density adapts automatically via container width observation. Use it to wrap XDSChatMessageList and XDSChatComposer for a complete chat experience with built-in auto-scroll and a scroll-to-bottom button.',
    bestPractices: [
      {
        guidance: true,
        description: 'Pass XDSChatMessageList as children and XDSChatComposer as the composer prop for a complete chat interface.',
      },
      {
        guidance: true,
        description: 'Provide an emptyState so new conversations show a prompt instead of a blank screen.',
      },
      {
        guidance: true,
        description: 'Use scrollRef when the chat is embedded in a page where a parent element handles scrolling.',
      },
      {
        guidance: false,
        description: "Don't apply a fixed height on the layout — let it fill its container with flex: 1.",
      },
      {
        guidance: false,
        description: "Don't render multiple ChatLayout instances in the same scroll container — each expects to own its scroll context.",
      },
    ],
    anatomy: [
      {
        name: 'Message area',
        required: true,
        description: 'Scrollable region for messages. Renders children (typically XDSChatMessageList) in a flex column that pushes content to the bottom when the list is short.',
      },
      {
        name: 'Frosted glass dock',
        required: true,
        description: 'Sticky or fixed container at the bottom with a backdrop-blur layer. Houses the scroll button and composer.',
      },
      {
        name: 'Scroll-to-bottom button',
        required: false,
        description: 'Appears when the user scrolls up or new messages arrive. Defaults to XDSChatLayoutScrollButton; pass null to hide or a custom element to override.',
      },
      {
        name: 'Composer',
        required: true,
        description: 'The input area for sending messages, typically XDSChatComposer. Docked at the bottom inside the frosted glass layer.',
      },
      {
        name: 'Empty state',
        required: false,
        description: 'Centered placeholder shown when no messages exist. Use XDSEmptyState for a consistent look.',
      },
    ],
  },
};

export const docsZh = {
  name: 'ChatLayout',
  displayName: 'Chat Layout',
  description: '完整聊天界面的布局外壳。消息在页面中自然流动，编写器固定在底部，带有毛玻璃效果。通过容器宽度自动适配密度。',
  propDescriptions: {
    children: '消息内容 — 通常是 XDSChatMessageList。在页面中自然流动。',
    composer: '编写器元素 — 通常是 XDSChatComposer。固定在底部，带有毛玻璃底座。',
    emptyState: '子元素为空时显示的内容。',
    scrollButton: '编写器上方的滚动到底部按钮。默认使用 XDSChatLayoutScrollButton。传入 null 隐藏。',
    scrollRef: '外部滚动容器引用。提供时，自动滚动和滚动到底部将目标指向此元素。',
  },
};

export const docsDense = {
  name: 'ChatLayout',
  displayName: 'Chat Layout',
  description: 'layout shell for full chat; msgs in page flow, composer fixed bottom w/ frosted glass dock; auto density via container width; scrollRef delegates to parent/body',
  propDescriptions: {
    children: 'msg content; typically XDSChatMessageList',
    composer: 'composer element; typically XDSChatComposer; fixed bottom w/ frosted glass',
    emptyState: 'content when children empty',
    scrollButton: 'scroll-to-bottom btn; defaults to XDSChatLayoutScrollButton; pass null to hide',
    scrollRef: 'external scroll container ref; targets parent/body instead of layout root',
  },
};
