// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @type {import('../docs-types').ComponentDoc} */

export const docs = {
  name: 'Container',
  displayName: 'Container',
  group: 'Layout',
  category: 'Layout',
  keywords: ["container","page","column","max-width","maxwidth","centered","gutter","wrapper","content width","margin auto"],
  props: [
    {
      name: 'maxWidth',
      type: 'SizeValue',
      description: 'Maximum width of the centered column (px or CSS value).',
      default: '1280',
    },
    {
      name: 'gutter',
      type: "'fluid' | 0 | 0.5 | 1 | 1.5 | 2 | 3 | 4 | 5 | 6 | 8 | 10",
      description:
        'Horizontal gutter (padding-inline). "fluid" is a viewport-relative clamp between spacing tokens that tightens on small screens; spacing steps give a fixed gutter.',
      default: "'fluid'",
    },
    {
      name: 'as',
      type: "'div' | 'section' | 'main' | 'article' | 'header' | 'footer'",
      description: 'HTML tag to render. Neutral div by default; pass a landmark tag when the container is also the section boundary.',
      default: "'div'",
    },
    {
      name: 'children',
      type: 'ReactNode',
      description: 'Content to render inside the centered column.',
    },
    {
      name: 'ref',
      type: 'React.Ref<HTMLElement>',
      description: 'Ref forwarded to the root element.',
    },
    {
      name: 'xstyle',
      type: 'StyleXStyles',
      description:
        'StyleX styles for layout customization (margins, positioning, sizing). Must be a stylex.create() value, not an inline style object like style={{}}.',
    },
  ],
  playground: {
    defaults: {
      maxWidth: 640,
      children: [
        {__element: 'Card', props: {padding: 4}, children: 'Centered content column'},
      ],
    },
  },
  theming: {
    targets: [
      {className: 'astryx-container'},
    ],
  },
  usage: {
    description:
      'Container is the canonical page wrapper: a horizontally centered column with a max-width and side gutters that shrink on small screens. Use it to constrain page or section content to a readable width.',
    bestPractices: [
      {guidance: true, description: 'Use one Container per page region and keep maxWidth consistent across pages, so content aligns from section to section.'},
      {guidance: true, description: 'Keep the default fluid gutter — it tracks the viewport and stays theme-controlled. Reach for a spacing step only when a design calls for a fixed gutter.'},
      {guidance: true, description: 'Combine with Section for backgrounds: full-bleed Section for the color band, Container inside it for the content column.'},
      {guidance: false, description: 'Use Container to give content a background or padding block. It is a width primitive; use Section or Card for surfaces.'},
      {guidance: false, description: 'Nest Containers. One centered column per region is enough; nesting multiplies gutters.'},
    ],
    anatomy: [
      {name: 'Column', required: true, description: 'The rendered element: full-width until maxWidth, centered via margin-inline auto, with the gutter as padding-inline.'},
      {name: 'Content', required: true, description: 'Any children. Laid out normally inside the column.'},
    ],
  },
};

/** @type {import('../docs-types').ComponentDoc} */
export const docsZh = {
  name: 'Container',
  displayName: 'Container',
  usage: {
    description:
      'Container 是标准的页面包装器：一个水平居中的内容列，带有最大宽度和随小屏幕收窄的两侧留白。用它将页面或区块内容约束在可读宽度内。',
    bestPractices: [
      {guidance: true, description: '每个页面区域使用一个 Container，并在各页面间保持一致的 maxWidth，使内容在区块之间对齐。'},
      {guidance: true, description: '保留默认的流式留白——它跟随视口变化并由主题控制。仅当设计需要固定留白时才使用间距步进值。'},
      {guidance: true, description: '与 Section 组合实现背景：外层用全宽 Section 铺色带，内层用 Container 承载内容列。'},
      {guidance: false, description: '不要用 Container 给内容添加背景或纵向内边距。它是宽度原语；表面请使用 Section 或 Card。'},
      {guidance: false, description: '不要嵌套 Container。每个区域一个居中列即可；嵌套会叠加留白。'},
    ],
  },
  props: [
    {name: 'maxWidth', type: 'number | string', description: '居中列的最大宽度（px 或 CSS 值）。', default: '1280'},
    {name: 'gutter', type: "'fluid' | 间距步进", description: '水平留白（padding-inline）。"fluid" 为基于间距令牌的视口相关 clamp，在小屏幕上收窄；间距步进值为固定留白。', default: "'fluid'"},
    {name: 'as', type: "'div' | 'section' | 'main' | 'article' | 'header' | 'footer'", description: '渲染的 HTML 标签。默认是中性的 div；当容器同时是区块边界时传入地标标签。', default: "'div'"},
    {name: 'children', type: 'ReactNode', description: '在居中列内渲染的内容。'},
    {
      name: 'xstyle',
      type: 'StyleXStyles',
      description:
        '用于布局自定义的 StyleX 样式（外边距、定位、尺寸）。必须是 stylex.create() 的值，不能是 style={{}} 这样的内联样式对象。',
    },
  ],
  theming: {
    targets: [
      {className: 'astryx-container'},
    ],
  },
};

/** @type {import('../docs-types').TranslationDoc} */
export const docsDense = {
  description: 'centered max-width column w/ fluid side gutters — the canonical page container',
  usage: {
    description:
      'Container centers a max-width content column with side gutters that shrink on small screens. The canonical page wrapper.',
    bestPractices: [
      {guidance: true, description: 'One Container per page region; keep maxWidth consistent across pages so sections align.'},
      {guidance: true, description: 'Keep the default fluid gutter (viewport-tracking, theme-controlled); use a spacing step only for fixed gutters.'},
      {guidance: true, description: 'Combine with Section for backgrounds: full-bleed Section for the band, Container inside for the column.'},
      {guidance: false, description: 'Use Container for backgrounds/vertical padding. Width primitive only; use Section or Card for surfaces.'},
      {guidance: false, description: 'Nest Containers — one centered column per region; nesting multiplies gutters.'},
    ],
  },
  propDescriptions: {
    maxWidth: 'max column width (px or CSS)',
    gutter: "'fluid' clamp between spacing tokens, or fixed spacing step",
    as: 'rendered tag; div default, landmark tags available',
    children: 'content inside the centered column',
    xstyle: 'StyleX styles for layout (margins, positioning, sizing); must be stylex.create() value',
  },
};
