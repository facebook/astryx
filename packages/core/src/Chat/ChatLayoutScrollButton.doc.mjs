// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @type {import('../docs-types').ComponentDoc} */

export const docs = {
  name: 'ChatLayoutScrollButton',
  subComponentOf: 'Chat',
  displayName: 'Chat Layout Scroll Button',
  isHiddenFromOverview: true,
  description: 'Floating scroll-to-bottom button that appears when the user scrolls away from the latest messages. It fades in as a compact icon button and expands to show a label when new messages arrive. XDSChatLayout renders this by default — pass a custom element to the scrollButton prop to override, or null to hide it entirely.',
  props: [
    {
      name: 'isVisible',
      type: 'boolean',
      description: 'Whether the button is visible. Bind to a scroll-position check so the button only appears when the user has scrolled up.',
      required: true,
    },
    {
      name: 'label',
      type: 'string',
      description: 'Optional label that expands the button (e.g. "New messages"). Use to signal unread content below the fold.',
    },
    {
      name: 'onClick',
      type: '() => void',
      description: 'Click handler — typically scrolls to bottom and dismisses the new message indicator.',
      required: true,
    },
  ],
};

export const docsZh = {
  name: 'ChatLayoutScrollButton',
  isHiddenFromOverview: true,
  displayName: 'Chat Layout Scroll Button',
  description: '可组合的滚动到底部按钮。可见时淡入，提供标签时展开。',
  propDescriptions: {
    isVisible: '按钮是否可见。',
    label: '可选标签 — 展开按钮（如"新消息"）。',
    onClick: '点击处理器。',
  },
};

export const docsDense = {
  name: 'ChatLayoutScrollButton',
  isHiddenFromOverview: true,
  displayName: 'Chat Layout Scroll Button',
  description: 'floating scroll-to-bottom btn; fades in when scrolled up, expands w/ label for new msgs. Default in XDSChatLayout; override via scrollButton prop.',
  propDescriptions: {
    isVisible: 'btn visibility — bind to scroll-position check',
    label: 'optional label; expands btn (e.g. "New messages")',
    onClick: 'click handler',
  },
};
