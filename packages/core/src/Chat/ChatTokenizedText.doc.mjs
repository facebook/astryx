// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @type {import('../docs-types').ComponentDoc} */

export const docs = {
  name: 'ChatTokenizedText',
  subComponentOf: 'Chat',
  displayName: 'Chat Tokenized Text',
  isHiddenFromOverview: true,
  description: 'Renders a text string with token patterns replaced by inline XDSBadge components. Wrap any message body inside XDSChatMessageBubble to turn raw @mentions, #tags, or /commands into styled badges. When no tokens match or none are provided, the text renders as-is: so you can use ChatTokenizedText unconditionally on every message.',
  props: [
    {
      name: 'children',
      type: 'string',
      description: "The plain text message containing serialized token values. Patterns matching a token's value are replaced with badge components inline.",
      required: true,
    },
    {
      name: 'tokens',
      type: 'XDSChatComposerToken[]',
      description: 'Token definitions: same type returned by trigger onSelect. Each token has a value (the string to match), label (display text), and optional variant and icon. Uses the same type as the composer input, so token definitions work for both input and display.',
    },
  ],
};

export const docsZh = {
  name: 'ChatTokenizedText',
  isHiddenFromOverview: true,
  displayName: 'Chat Tokenized Text',
  description: '渲染带有标记模式的文本，将匹配的模式替换为内联 XDSBadge 组件。在 XDSChatMessageBubble 内使用，将 @提及、#标签或 /命令显示为样式化徽章。未提供标记时以纯文本渲染，因此可以无条件使用。',
  propDescriptions: {
    children: '包含序列化标记值的纯文本消息。匹配标记值的模式将被替换为内联徽章组件。',
    tokens: '标记定义 — 与触发器 onSelect 返回的类型相同。每个包含 value（匹配字符串）、label（显示文本）以及可选的 variant 和 icon。',
  },
};

export const docsDense = {
  name: 'ChatTokenizedText',
  isHiddenFromOverview: true,
  displayName: 'Chat Tokenized Text',
  description: 'renders text w/ token patterns replaced by inline badges; use in bubble for @mentions, #tags, /commands; degrades to plain text when no tokens match',
  propDescriptions: {
    children: 'plain text msg w/ serialized token values; matching patterns become inline badges',
    tokens: 'token defs (same type as composer input): value+label+variant+icon',
  },
};
