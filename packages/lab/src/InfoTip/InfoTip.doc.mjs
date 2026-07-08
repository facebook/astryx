// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @type {import('../docs-types').ComponentDoc} */

export const docs = {
  name: 'InfoTip',
  displayName: 'Info Tip',
  category: 'Feedback & Status',
  keywords: ["info","tooltip","help","hint","affordance","icon","label","field","metric","definition"],
  props: [
    {
      name: 'content',
      type: 'ReactNode',
      description: 'Content to display in the tooltip. Typically short, non-interactive text. Mirrors Tooltip’s content prop.',
      required: true,
    },
    {
      name: 'label',
      type: 'string',
      description: 'Accessible name for the trigger button.',
      default: "'More information'",
    },
    {
      name: 'size',
      type: "'xsm' | 'sm' | 'md' | 'lg'",
      description: 'Size of the info icon (12px, 16px, 20px, 24px). Maps 1:1 to Icon sizes.',
      default: "'sm'",
    },
  ],
  usage: {
    description:
      'An inline info-icon help affordance: a small "i" button that reveals a tooltip on hover and keyboard focus. Use it next to labels, values, and metrics for permission notes, metric definitions, and field help. Its value over hand-composing Icon inside Tooltip is the pre-wired accessible trigger: a real button with an aria-label, Tab-reachable, tooltip on hover AND focus, and Escape dismissal.',
    bestPractices: [
      { guidance: true, description: 'Keep tooltip content concise, plain, and non-interactive; use Popover or HoverCard for links and buttons.' },
      { guidance: true, description: 'Override label when "More information" is too generic, e.g. "About this metric".' },
      { guidance: false, description: 'Hand-compose Icon inside Tooltip for info affordances; the bare Icon is aria-hidden and unfocusable, so keyboard and screen-reader users never see it.' },
      { guidance: false, description: 'Use InfoTip for essential information users must see to complete a task; put that text inline instead.' },
    ],
  },
};

/** @type {import('../docs-types').ComponentDoc} */
export const docsZh = {
  name: 'InfoTip',
  displayName: 'Info Tip',
  props: [
    {
      name: 'content',
      type: 'ReactNode',
      description: '工具提示中显示的内容。通常为简短的非交互文本。与 Tooltip 的 content 属性一致。',
      required: true,
    },
    {
      name: 'label',
      type: 'string',
      description: '触发按钮的无障碍名称。',
      default: "'More information'",
    },
    {
      name: 'size',
      type: "'xsm' | 'sm' | 'md' | 'lg'",
      description: '信息图标的尺寸（12px、16px、20px、24px）。与 Icon 尺寸一一对应。',
      default: "'sm'",
    },
  ],
  usage: {
    description:
      'An inline info-icon help affordance: a small "i" button that reveals a tooltip on hover and keyboard focus. Use it next to labels, values, and metrics for permission notes, metric definitions, and field help.',
    bestPractices: [
      { guidance: true, description: 'Keep tooltip content concise, plain, and non-interactive; use Popover or HoverCard for links and buttons.' },
      { guidance: true, description: 'Override label when "More information" is too generic, e.g. "About this metric".' },
      { guidance: false, description: 'Hand-compose Icon inside Tooltip for info affordances; the bare Icon is aria-hidden and unfocusable, so keyboard and screen-reader users never see it.' },
      { guidance: false, description: 'Use InfoTip for essential information users must see to complete a task; put that text inline instead.' },
    ],
  },
};

/** @type {import('../docs-types').TranslationDoc} */
export const docsDense = {
  description:
    'Inline info-icon help affordance: accessible "i" button trigger pre-wired into a Tooltip.',
  usage: {
    description:
      'A small "i" button that reveals a tooltip on hover and keyboard focus. Use next to labels, values, and metrics for permission notes, metric definitions, and field help. Pre-wired accessible trigger: real button, aria-label, Tab-reachable, tooltip on hover AND focus, Escape dismissal.',
    bestPractices: [
      { guidance: true, description: 'Keep tooltip content concise, plain, and non-interactive; use Popover or HoverCard for links and buttons.' },
      { guidance: true, description: 'Override label when "More information" is too generic, e.g. "About this metric".' },
      { guidance: false, description: 'Hand-compose Icon inside Tooltip for info affordances; the bare Icon is aria-hidden and unfocusable.' },
      { guidance: false, description: 'Use InfoTip for essential information users must see to complete a task; put that text inline instead.' },
    ],
  },
  propDescriptions: {
    content: 'Tooltip content. Short, non-interactive text. Mirrors Tooltip content prop.',
    label: "Accessible name for the trigger button. Default 'More information'.",
    size: 'Info icon size (12/16/20/24px). Maps 1:1 to Icon sizes.',
  },
};
