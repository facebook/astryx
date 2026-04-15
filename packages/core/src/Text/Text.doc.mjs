/** @type {import('../docs-types').ComponentDoc} */

export const docs = {
  name: 'Text',
  description:
    'Typography components for the XDS design system, including semantic body text, headings, and a wrapper for applying typography styles to native HTML.',
  showcase: {
    aspectRatio: 1,
    code: '<XDSText type="body">Hello world</XDSText>',
  },
  keywords: ["text","typography","label","paragraph","heading","caption","font","body","subtitle"],  features: [
    'Semantic text types (body, large, label, supporting, code) driven by theme tokens',
    'Headings use native h1–h6 elements with optional aria-level override for decoupled visual vs document hierarchy',
    'Line-clamp truncation with automatic overflow-detecting tooltip',
    'Optical alignment (text-box-trim / capsize) for precise vertical rhythm',
    'Tabular number support for aligned numeric data',
    'All typography driven by CSS custom properties — fully themeable per-component',
  ],
  theming: {
    targets: [
      {className: 'xds-heading', visualProps: ['level', 'color']},
      {className: 'xds-text', visualProps: ['type', 'color']},
    ],
  },
  accessibility: [
    'XDSHeading renders the correct semantic h1–h6 element based on the `level` prop.',
    'When `accessibilityLevel` differs from `level`, `aria-level` is set so screen readers announce the correct document outline position while preserving the visual style.',
    'Truncated text sets a native `title` attribute as a fallback, and also lazily renders an XDSTooltip for sighted keyboard users.',
  ],
  components: [
    {
      name: 'XDSText',
      description:
        'Semantic body text component that renders text with type-based styling from the theme, with optional truncation, decoration, and layout props.',      props: [
        {
          name: 'type',
          type: "'body' | 'large' | 'label' | 'supporting' | 'code'",
          description:
            'Semantic text type. Determines size, weight, and line-height from the theme.',
          required: true,
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
      description:
        'Semantic heading component that renders h1–h6 elements with themed styling, themed sizing via type scale tokens, and line-clamp truncation.',
      props: [
        {
          name: 'level',
          type: '1 | 2 | 3 | 4 | 5 | 6',
          description:
            'Visual heading level. Determines both the HTML element (h1–h6) and the styling from the theme.',
          required: true,
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
    summary: 'Typography components for body text, headings, and semantic text rendering.',
  },
};

/** @type {import('../docs-types').ComponentDoc} */
export const docsZh = {
  name: 'Text',
  description:
    'XDS 设计系统的排版组件，包括语义化正文文本、标题以及将排版样式应用于原生 HTML 的包装器。',
  features: [
    '语义化文本类型（body、large、label、supporting、code），由主题令牌驱动',
    '标题使用原生 h1–h6 元素，支持可选的 aria-level 覆盖，实现视觉层级与文档层级的解耦',
    '行截断，带自动溢出检测工具提示',
    '光学对齐（text-box-trim / capsize），实现精确的垂直节奏',
    '表格数字支持，用于对齐的数值数据',
    '所有排版由 CSS 自定义属性驱动 — 每个组件均可完全主题化',
  ],
  theming: {
    targets: [
      {className: 'xds-heading', visualProps: ['level', 'color']},
      {className: 'xds-text', visualProps: ['type', 'color']},
    ],
  },
  accessibility: [
    'XDSHeading 根据 `level` 属性渲染正确的语义化 h1–h6 元素。',
    '当 `accessibilityLevel` 与 `level` 不同时，会设置 `aria-level`，使屏幕阅读器播报正确的文档大纲位置，同时保留视觉样式。',
    '截断文本设置原生 `title` 属性作为后备方案，并为有视力的键盘用户延迟渲染 XDSTooltip。',
  ],
  components: [
    {
      name: 'XDSText',
      description:
        '语义化正文文本组件，使用来自主题的基于类型的样式渲染文本，支持可选的截断、装饰和布局属性。',
      props: [
        {
          name: 'type',
          type: "'body' | 'large' | 'label' | 'supporting' | 'code'",
          description:
            '语义化文本类型。从主题中确定大小、字重和行高。',
          required: true,
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
      description:
        '语义化标题组件，渲染带主题样式的 h1–h6 元素，支持可选的编辑风格比例和行截断。',
      props: [
        {
          name: 'level',
          type: '1 | 2 | 3 | 4 | 5 | 6',
          description:
            '视觉标题级别。同时决定 HTML 元素（h1–h6）和来自主题的样式。',
          required: true,
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
};

/** @type {import('../docs-types').TranslationDoc} */
export const docsDense = {
  description: 'Typography components: semantic body text, headings, wrapper for applying typography styles to native HTML.',
  features: [
    'Semantic text types (body, large, label, supporting, code) driven by theme tokens',
    'Headings use native h1\u20136 w/ optional aria-level override for decoupled visual vs document hierarchy',
    'Line-clamp truncation w/ automatic overflow-detecting tooltip',
    'Optical alignment (text-box-trim / capsize) for precise vertical rhythm',
    'Tabular number support for aligned numeric data',
    'All typography driven by CSS custom properties; fully themeable per-component',
  ],
  accessibility: [
    'XDSHeading renders correct semantic h1\u20136 based on level prop.',
    'When accessibilityLevel differs from level, aria-level set for correct document outline.',
    'Truncated text sets native title attr as fallback + lazily renders XDSTooltip for keyboard users.',
  ],
  components: [
    {
      name: 'XDSText',
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
      description: 'Semantic h1\u20136 w/ themed styling, themed sizing via type scale tokens, line-clamp truncation.',
      propDescriptions: {
        level: 'Visual heading level; determines HTML element + styling from theme.',
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