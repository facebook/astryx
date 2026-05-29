// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @type {import('../docs-types').ComponentDoc} */

export const docs = {
  name: 'Text',
  displayName: 'Text',
  category: 'Communications',
  keywords: ["text","typography","label","paragraph","heading","caption","font","body","subtitle"],
  playground: {
    defaults: {
      children: 'The quick brown fox jumps over the lazy dog.',
      type: 'body',
    },
  },
  theming: {
    targets: [
      {className: 'xds-heading', visualProps: ['level', 'color']},
      {className: 'xds-text', visualProps: ['type', 'color']},
    ],
  },
  components: [
    {
      name: 'XDSText',
      displayName: 'Text',
      description:
        'Semantic body text component that renders text with type-based styling from the theme, with optional truncation, decoration, and layout props.',      props: [
        {
          name: 'type',
          type: "'body' | 'large' | 'label' | 'supporting' | 'code'",
          description:
            'Semantic text type. Determines size, weight, and line-height from the theme.',
          default: "'body'",
        },
        {
          name: 'children',
          type: 'ReactNode',
          description: 'Text content.',
          required: true,
        },
        {
          name: 'size',
          type: "'4xs' | '3xs' | '2xs' | 'xsm' | 'sm' | 'base' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl'",
          description:
            'Explicit font size override. Overrides the size from `type` but preserves other type properties. Prefer using `type` alone.',
        },
        {
          name: 'color',
          type: "'primary' | 'secondary' | 'disabled' | 'placeholder' | 'active' | 'inherit'",
          description:
            "Text color. Defaults to 'secondary' for the 'supporting' type, 'primary' for all others.",
        },
        {
          name: 'weight',
          type: "'normal' | 'medium' | 'semibold' | 'bold'",
          description: 'Font weight override.',
        },
        {
          name: 'display',
          type: "'inline' | 'block'",
          description:
            "Display type. Silently overridden to 'block' when maxLines > 0 or hasCapsize is true.",
          default: "'inline'",
        },
        {
          name: 'as',
          type: "'span' | 'p' | 'div' | 'label'",
          description: 'HTML element to render.',
          default: "'span'",
        },
        {
          name: 'maxLines',
          type: 'number',
          description:
            'Maximum lines before truncation. 0 means no truncation. When set, shows a tooltip on hover if content is truncated.',
          default: '0',
        },
        {
          name: 'hasTruncateTooltip',
          type: 'boolean | LayerPlacement',
          description:
            'Controls tooltip behavior for truncated text. true shows the tooltip at the default position, false disables it, or a LayerPlacement string sets a specific position.',
          default: 'true',
        },
        {
          name: 'wordBreak',
          type: "'break-word' | 'break-all'",
          description:
            "Word break behavior when truncating. Defaults to 'break-all' for single-line truncation, 'break-word' otherwise.",
        },
        {
          name: 'textWrap',
          type: "'wrap' | 'nowrap' | 'balance' | 'pretty'",
          description: 'Text wrapping behavior.',
        },
        {
          name: 'hasCapsize',
          type: 'boolean',
          description:
            'Enable optical alignment using text-box-trim. Forces block display.',
          default: 'false',
        },
        {
          name: 'hasStrikethrough',
          type: 'boolean',
          description: 'Apply strikethrough text decoration.',
          default: 'false',
        },
        {
          name: 'hasTabularNumbers',
          type: 'boolean',
          description:
            'Use tabular (monospace) numbers for aligned numeric data.',
          default: 'false',
        },
        {
          name: 'id',
          type: 'string',
          description: 'HTML id attribute.',
        },
        {
          name: 'xstyle',
          type: 'StyleXStyles',
          description:
            'StyleX styles for layout customization (margins, positioning, sizing). Must be a stylex.create() value — not an inline style object like style={{}}.',
        },
      ],
    },
    {
      name: 'XDSHeading',
      displayName: 'Heading',
      description:
        'Semantic heading component that renders h1–h6 elements with themed styling, themed sizing via type scale tokens, and line-clamp truncation.',
      props: [
        {
          name: 'level',
          type: '1 | 2 | 3 | 4 | 5 | 6',
          description:
            'Heading level. Determines the semantic HTML element (h1–h6) and the visual styling from the theme (unless `type` is set).',
          required: true,
        },
        {
          name: 'type',
          type: "'display-1' | 'display-2' | 'display-3'",
          description:
            'Display type variant. Overrides the visual styling from `level` with display-scale sizing (larger, lighter weight, tighter line-height). The `level` still determines the HTML element for accessibility. Use for hero banners, marketing headlines, and data callouts.',
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
          description:
            'Accessibility level override. When set and different from `level`, applies `aria-level` so the document outline differs from the visual style.',
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
          description:
            "Display type. Silently overridden to 'block' when maxLines > 0 or hasCapsize is true.",
          default: "'block'",
        },
        {
          name: 'maxLines',
          type: 'number',
          description:
            'Maximum lines before truncation. 0 means no truncation. When set, shows a tooltip on hover if content is truncated.',
          default: '0',
        },
        {
          name: 'hasTruncateTooltip',
          type: 'boolean | LayerPlacement',
          description:
            'Controls tooltip behavior for truncated text. true shows the tooltip at the default position, false disables it, or a LayerPlacement string sets a specific position.',
          default: 'true',
        },
        {
          name: 'wordBreak',
          type: "'break-word' | 'break-all'",
          description:
            "Word break behavior when truncating. Defaults to 'break-all' for single-line truncation, 'break-word' otherwise.",
        },
        {
          name: 'textWrap',
          type: "'wrap' | 'nowrap' | 'balance' | 'pretty'",
          description: 'Text wrapping behavior.',
        },
        {
          name: 'hasCapsize',
          type: 'boolean',
          description:
            'Enable optical alignment using text-box-trim. Forces block display.',
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
    },
  ],
  usage: {
    description:
      'Text renders styled body text and headings from the theme. Use XDSText with a semantic type for body copy, labels, and captions, and XDSHeading for section titles that output the correct h1\u2013h6 element.',
    bestPractices: [
      { guidance: true, description: 'Pick a semantic type (body, label, supporting, large, code) instead of manually setting size and weight \u2014 the theme handles the details.' },
      { guidance: true, description: 'Set accessibilityLevel on XDSHeading when the visual level differs from the document outline so screen readers announce the correct hierarchy.' },
      { guidance: true, description: 'Use maxLines with a number to truncate long content \u2014 a tooltip appears automatically on hover so no text is lost.' },
      { guidance: true, description: 'Enable hasTabularNumbers for columns of numeric data so digits align vertically across rows.' },
      { guidance: false, description: 'Override size and weight when a semantic type already matches \u2014 extra overrides fight the theme and break when themes change.' },
      { guidance: false, description: 'Skip heading levels in the document outline \u2014 go h1 then h2 then h3, never h1 then h3.' },
      { guidance: false, description: 'Use raw HTML tags like <p>, <h1>\u2013<h6>, or <span> for text \u2014 XDSText and XDSHeading apply the correct theme tokens automatically.' },
    ],
  },
};

/** @type {import('../docs-types').ComponentDoc} */
export const docsZh = {
  name: 'Text',
  displayName: 'Text',
  theming: {
    targets: [
      {className: 'xds-heading', visualProps: ['level', 'color']},
      {className: 'xds-text', visualProps: ['type', 'color']},
    ],
  },
  components: [
    {
      name: 'XDSText',
      displayName: 'Text',
      description:
        '语义化正文文本组件，使用来自主题的基于类型的样式渲染文本，支持可选的截断、装饰和布局属性。',
      props: [
        {
          name: 'type',
          type: "'body' | 'large' | 'label' | 'supporting' | 'code'",
          description:
            '语义化文本类型。从主题中确定大小、字重和行高。',
          default: "'body'",
        },
        {
          name: 'children',
          type: 'ReactNode',
          description: '文本内容。',
          required: true,
        },
        {
          name: 'size',
          type: "'4xs' | '3xs' | '2xs' | 'xsm' | 'sm' | 'base' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl'",
          description:
            '显式字体大小覆盖。覆盖来自 `type` 的大小但保留其他类型属性。建议单独使用 `type`。',
        },
        {
          name: 'color',
          type: "'primary' | 'secondary' | 'disabled' | 'placeholder' | 'active' | 'inherit'",
          description:
            "文本颜色。'supporting' 类型默认为 'secondary'，其他类型默认为 'primary'。",
        },
        {
          name: 'weight',
          type: "'normal' | 'medium' | 'semibold' | 'bold'",
          description: '字重覆盖。',
        },
        {
          name: 'display',
          type: "'inline' | 'block'",
          description:
            "显示类型。当 maxLines > 0 或 hasCapsize 为 true 时，会静默覆盖为 'block'。",
          default: "'inline'",
        },
        {
          name: 'as',
          type: "'span' | 'p' | 'div' | 'label'",
          description: '要渲染的 HTML 元素。',
          default: "'span'",
        },
        {
          name: 'maxLines',
          type: 'number',
          description:
            '截断前的最大行数。0 表示不截断。设置后，如果内容被截断，悬停时会显示工具提示。',
          default: '0',
        },
        {
          name: 'hasTruncateTooltip',
          type: 'boolean | LayerPlacement',
          description:
            '控制截断文本的工具提示行为。true 在默认位置显示工具提示，false 禁用它，或者 LayerPlacement 字符串设置特定位置。',
          default: 'true',
        },
        {
          name: 'wordBreak',
          type: "'break-word' | 'break-all'",
          description:
            "截断时的断词行为。单行截断默认为 'break-all'，其他情况默认为 'break-word'。",
        },
        {
          name: 'textWrap',
          type: "'wrap' | 'nowrap' | 'balance' | 'pretty'",
          description: '文本换行行为。',
        },
        {
          name: 'hasCapsize',
          type: 'boolean',
          description:
            '使用 text-box-trim 启用光学对齐。强制块级显示。',
          default: 'false',
        },
        {
          name: 'hasStrikethrough',
          type: 'boolean',
          description: '应用删除线文本装饰。',
          default: 'false',
        },
        {
          name: 'hasTabularNumbers',
          type: 'boolean',
          description:
            '使用表格（等宽）数字以实现对齐的数值数据。',
          default: 'false',
        },
        {
          name: 'id',
          type: 'string',
          description: 'HTML id 属性。',
        },
        {
          name: 'xstyle',
          type: 'StyleXStyles',
          description:
            '用于布局自定义的 StyleX 样式（外边距、定位、尺寸）。必须是 stylex.create() 的值，而非内联样式对象如 style={{}}。',
        },
      ],
    },
    {
      name: 'XDSHeading',
      displayName: 'Heading',
      description:
        '语义化标题组件，渲染带主题样式的 h1–h6 元素，支持可选的编辑风格比例和行截断。',
      props: [
        {
          name: 'level',
          type: '1 | 2 | 3 | 4 | 5 | 6',
          description:
            '标题级别。决定语义 HTML 元素（h1–h6）和来自主题的样式（除非设置了 `type`）。',
          required: true,
        },
        {
          name: 'type',
          type: "'display-1' | 'display-2' | 'display-3'",
          description:
            '展示类型变体。用展示级别的大小（更大、更轻的字重、更紧的行高）覆盖来自 `level` 的视觉样式。`level` 仍然决定用于无障碍的 HTML 元素。用于英雄横幅、营销标题和数据提示。',
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
          description:
            '无障碍级别覆盖。当设置且与 `level` 不同时，应用 `aria-level` 使文档大纲与视觉样式不同。',
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
          description:
            "显示类型。当 maxLines > 0 或 hasCapsize 为 true 时，会静默覆盖为 'block'。",
          default: "'block'",
        },
        {
          name: 'maxLines',
          type: 'number',
          description:
            '截断前的最大行数。0 表示不截断。设置后，如果内容被截断，悬停时会显示工具提示。',
          default: '0',
        },
        {
          name: 'hasTruncateTooltip',
          type: 'boolean | LayerPlacement',
          description:
            '控制截断文本的工具提示行为。true 在默认位置显示工具提示，false 禁用它，或者 LayerPlacement 字符串设置特定位置。',
          default: 'true',
        },
        {
          name: 'wordBreak',
          type: "'break-word' | 'break-all'",
          description:
            "截断时的断词行为。单行截断默认为 'break-all'，其他情况默认为 'break-word'。",
        },
        {
          name: 'textWrap',
          type: "'wrap' | 'nowrap' | 'balance' | 'pretty'",
          description: '文本换行行为。',
        },
        {
          name: 'hasCapsize',
          type: 'boolean',
          description:
            '使用 text-box-trim 启用光学对齐。强制块级显示。',
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
    },
  ],
  usage: {
    description:
      'Text renders styled body text and headings from the theme. Use XDSText with a semantic type for body copy, labels, and captions, and XDSHeading for section titles that output the correct h1\u2013h6 element.',
    bestPractices: [
      { guidance: true, description: 'Pick a semantic type (body, label, supporting, large, code) instead of manually setting size and weight \u2014 the theme handles the details.' },
      { guidance: true, description: 'Set accessibilityLevel on XDSHeading when the visual level differs from the document outline so screen readers announce the correct hierarchy.' },
      { guidance: true, description: 'Use maxLines with a number to truncate long content \u2014 a tooltip appears automatically on hover so no text is lost.' },
      { guidance: true, description: 'Enable hasTabularNumbers for columns of numeric data so digits align vertically across rows.' },
      { guidance: false, description: 'Override size and weight when a semantic type already matches \u2014 extra overrides fight the theme and break when themes change.' },
      { guidance: false, description: 'Skip heading levels in the document outline \u2014 go h1 then h2 then h3, never h1 then h3.' },
      { guidance: false, description: 'Use raw HTML tags like <p>, <h1>\u2013<h6>, or <span> for text \u2014 XDSText and XDSHeading apply the correct theme tokens automatically.' },
    ],
  },
};

/** @type {import('../docs-types').TranslationDoc} */
export const docsDense = {
  description: 'semantic body text + headings w/ theme-driven type scale, truncation, tabular numbers',
  usage: {
    description:
      'Text renders styled body text and headings. XDSText for body copy with semantic types, XDSHeading for h1\u2013h6 with theme tokens.',
    bestPractices: [
      { guidance: true, description: 'Semantic type (body, label, supporting, large, code) instead of manual size/weight.' },
      { guidance: true, description: 'accessibilityLevel on XDSHeading when visual level differs from document outline.' },
      { guidance: true, description: 'maxLines for truncation \u2014 tooltip shows full text on hover.' },
      { guidance: true, description: 'hasTabularNumbers for aligned numeric columns.' },
      { guidance: false, description: 'Override size/weight when a semantic type already matches.' },
      { guidance: false, description: 'Skip heading levels \u2014 sequential h1 \u2192 h2 \u2192 h3.' },
      { guidance: false, description: 'Raw <p>/<h1>/<span> \u2014 use XDSText/XDSHeading for theme tokens.' },
    ],
  },
  components: [
    {
      name: 'XDSText',
      displayName: 'Text',
      description: 'Semantic body text w/ type-based theme styling, optional truncation, decoration, layout props.',
      propDescriptions: {
        type: 'Semantic text type; determines size, weight, line-height from theme.',
        children: 'Text content.',
        size: 'Explicit font size override; overrides type size but preserves other properties. Prefer type alone.',
        color: "Text color; defaults 'secondary' for supporting, 'primary' for others.",
        weight: 'Font weight override.',
        display: "Display type; overridden to 'block' when maxLines>0 or hasCapsize.",
        as: 'HTML element to render.',
        maxLines: 'Max lines before truncation; 0=none. Shows tooltip if truncated.',
        hasTruncateTooltip: 'Tooltip for truncated text; true=default position, false=disabled, or LayerPlacement.',
        wordBreak: "Word break behavior; defaults 'break-all' for single-line, 'break-word' otherwise.",
        textWrap: 'Text wrapping behavior.',
        hasCapsize: 'Optical alignment via text-box-trim; forces block display.',
        hasStrikethrough: 'Strikethrough text decoration.',
        hasTabularNumbers: 'Tabular (monospace) numbers for aligned data.',
        id: 'HTML id attribute.',
        xstyle: 'StyleX layout styles; must be stylex.create() value.',
      },
    },
    {
      name: 'XDSHeading',
      displayName: 'Heading',
      description: 'Semantic h1\u20136 w/ themed styling, themed sizing via type scale tokens, line-clamp truncation.',
      propDescriptions: {
        level: 'Heading level; determines HTML element + styling from theme (unless type is set).',
        type: "Display variant (display-1/2/3); overrides visual styling from level with display-scale sizing.",
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
    },
  ],
};