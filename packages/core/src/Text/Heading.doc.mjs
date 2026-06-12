// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @type {import('../docs-types').ComponentDoc} */

export const docs = {
  name: 'Heading',
  subComponentOf: 'Text',
  displayName: 'Heading',
  description: 'Semantic heading component that renders h1–h6 elements with themed styling, themed sizing via type scale tokens, and line-clamp truncation.',
  props: [
    {
      name: 'level',
      type: '1 | 2 | 3 | 4 | 5 | 6',
      description: 'Heading level. Determines the semantic HTML element (h1–h6) and the visual styling from the theme (unless `type` is set).',
      required: true,
    },
    {
      name: 'type',
      type: "'display-1' | 'display-2' | 'display-3'",
      description: 'Display type variant. Overrides the visual styling from `level` with display-scale sizing (larger, lighter weight, tighter line-height). The `level` still determines the HTML element for accessibility. Use for hero banners, marketing headlines, and data callouts.',
    },
    {
      name: 'children',
      type: 'ReactNode',
      description: 'Heading content.',
      required: true,
    },
    {
      name: 'accessibilityLevel',
      type: '1 | 2 | 3 | 4 | 5 | 6',
      description: 'Accessibility level override. When set and different from `level`, applies `aria-level` so the document outline differs from the visual style.',
    },
    {
      name: 'color',
      type: "'primary' | 'secondary' | 'disabled' | 'placeholder' | 'active' | 'inherit'",
      description: 'Text color.',
      default: "'primary'",
    },
    {
      name: 'display',
      type: "'inline' | 'block'",
      description: "Display type. Silently overridden to 'block' when maxLines > 0 or hasCapsize is true.",
      default: "'block'",
    },
    {
      name: 'maxLines',
      type: 'number',
      description: 'Maximum lines before truncation. 0 means no truncation. When set, shows a tooltip on hover if content is truncated.',
      default: '0',
    },
    {
      name: 'hasTruncateTooltip',
      type: 'boolean | LayerPlacement',
      description: 'Controls tooltip behavior for truncated text. true shows the tooltip at the default position, false disables it, or a LayerPlacement string sets a specific position.',
      default: 'true',
    },
    {
      name: 'wordBreak',
      type: "'break-word' | 'break-all'",
      description: "Word break behavior when truncating. Defaults to 'break-all' for single-line truncation, 'break-word' otherwise.",
    },
    {
      name: 'textWrap',
      type: "'wrap' | 'nowrap' | 'balance' | 'pretty'",
      description: 'Text wrapping behavior.',
    },
    {
      name: 'hasCapsize',
      type: 'boolean',
      description: 'Enable optical alignment using text-box-trim. Forces block display.',
      default: 'false',
    },
    {
      name: 'hasStrikethrough',
      type: 'boolean',
      description: 'Apply strikethrough text decoration.',
      default: 'false',
    },
    {
      name: 'id',
      type: 'string',
      description: 'HTML id attribute.',
    },
  ],
};

export const docsZh = {
  name: 'Heading',
  displayName: 'Heading',
  description: '语义化标题组件，渲染带主题样式的 h1–h6 元素，支持可选的编辑风格比例和行截断。',
  props: [
    {
      name: 'level',
      type: '1 | 2 | 3 | 4 | 5 | 6',
      description: '标题级别。决定语义 HTML 元素（h1–h6）和来自主题的样式（除非设置了 `type`）。',
      required: true,
    },
    {
      name: 'type',
      type: "'display-1' | 'display-2' | 'display-3'",
      description: '展示类型变体。用展示级别的大小（更大、更轻的字重、更紧的行高）覆盖来自 `level` 的视觉样式。`level` 仍然决定用于无障碍的 HTML 元素。用于英雄横幅、营销标题和数据提示。',
    },
    {
      name: 'children',
      type: 'ReactNode',
      description: '标题内容。',
      required: true,
    },
    {
      name: 'accessibilityLevel',
      type: '1 | 2 | 3 | 4 | 5 | 6',
      description: '无障碍级别覆盖。当设置且与 `level` 不同时，应用 `aria-level` 使文档大纲与视觉样式不同。',
    },
    {
      name: 'color',
      type: "'primary' | 'secondary' | 'disabled' | 'placeholder' | 'active' | 'inherit'",
      description: '文本颜色。',
      default: "'primary'",
    },
    {
      name: 'display',
      type: "'inline' | 'block'",
      description: "显示类型。当 maxLines > 0 或 hasCapsize 为 true 时，会静默覆盖为 'block'。",
      default: "'block'",
    },
    {
      name: 'maxLines',
      type: 'number',
      description: '截断前的最大行数。0 表示不截断。设置后，如果内容被截断，悬停时会显示工具提示。',
      default: '0',
    },
    {
      name: 'hasTruncateTooltip',
      type: 'boolean | LayerPlacement',
      description: '控制截断文本的工具提示行为。true 在默认位置显示工具提示，false 禁用它，或者 LayerPlacement 字符串设置特定位置。',
      default: 'true',
    },
    {
      name: 'wordBreak',
      type: "'break-word' | 'break-all'",
      description: "截断时的断词行为。单行截断默认为 'break-all'，其他情况默认为 'break-word'。",
    },
    {
      name: 'textWrap',
      type: "'wrap' | 'nowrap' | 'balance' | 'pretty'",
      description: '文本换行行为。',
    },
    {
      name: 'hasCapsize',
      type: 'boolean',
      description: '使用 text-box-trim 启用光学对齐。强制块级显示。',
      default: 'false',
    },
    {
      name: 'hasStrikethrough',
      type: 'boolean',
      description: '应用删除线文本装饰。',
      default: 'false',
    },
    {
      name: 'id',
      type: 'string',
      description: 'HTML id 属性。',
    },
  ],
};

export const docsDense = {
  name: 'Heading',
  displayName: 'Heading',
  description: 'Semantic h1–6 w/ themed styling, themed sizing via type scale tokens, line-clamp truncation.',
  propDescriptions: {
    level: 'Heading level; determines HTML element + styling from theme (unless type is set).',
    type: 'Display variant (display-1/2/3); overrides visual styling from level with display-scale sizing.',
    children: 'Heading content.',
    accessibilityLevel: 'aria-level override when different from level for document outline.',
    color: 'Text color.',
    display: "Display type; overridden to 'block' when maxLines>0 or hasCapsize.",
    maxLines: 'Max lines before truncation; 0=none. Shows tooltip if truncated.',
    hasTruncateTooltip: 'Tooltip for truncated text; true=default position, false=disabled, or LayerPlacement.',
    wordBreak: "Word break behavior; defaults 'break-all' for single-line, 'break-word' otherwise.",
    textWrap: 'Text wrapping behavior.',
    hasCapsize: 'Optical alignment via text-box-trim; forces block display.',
    hasStrikethrough: 'Strikethrough text decoration.',
    id: 'HTML id attribute.',
  },
};
