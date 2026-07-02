// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @type {import('../docs-types').ComponentDoc} */

export const docs = {
  name: 'ChatTypingIndicator',
  subComponentOf: 'Chat',
  displayName: 'Chat Typing Indicator',
  description: 'Animated three-dot typing hint with a grammar-aware label: "Ana is typing…", "Ana and Ben are typing…", or "Ana and 2 others are typing…". Dots bounce with staggered stylex.keyframes delays, disabled under prefers-reduced-motion; the label is announced politely via role="status".',
  props: [
    {
      name: 'names',
      type: 'string[]',
      description: 'Names of people currently typing. One name renders "is typing", two render both names, more collapse to "and N others". When omitted or empty, only the animated dots render.',
    },
  ],
};

export const docsZh = {
  name: 'ChatTypingIndicator',
  displayName: 'Chat Typing Indicator',
  description: '带语法感知标签的三点跳动输入提示："Ana is typing…"、"Ana and Ben are typing…" 或 "Ana and 2 others are typing…"。圆点用 stylex.keyframes 交错跳动，prefers-reduced-motion 下禁用；标签通过 role="status" 礼貌播报。',
  propDescriptions: {
    names: '正在输入的人名。一个名字渲染 "is typing"，两个渲染双名，更多折叠为 "and N others"。省略或为空时仅渲染动画圆点。',
  },
};

export const docsDense = {
  name: 'ChatTypingIndicator',
  displayName: 'Chat Typing Indicator',
  description: 'bouncing three-dot typing hint; label grammar 1/2/N names; reduced-motion safe keyframes; role=status polite announce; dots-only when names empty',
  propDescriptions: {
    names: "string[]; 1='X is typing', 2='X and Y', 3+='X and N others'; empty=dots only",
  },
};
