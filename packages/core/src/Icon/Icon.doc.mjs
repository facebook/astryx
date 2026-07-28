// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @type {import('../docs-types').ComponentDoc} */

export const docs = {
  name: 'Icon',
  displayName: 'Icon',
  category: 'Content',
  keywords: ["icon","svg","glyph","symbol","pictogram","graphic","vector"],
  playground: {
    // `icon` is required and its type can't be auto-generated, so the
    // properties-tab preview showed "Missing: icon". Seed a valid semantic
    // icon name so the interactive preview renders.
    defaults: {
      icon: 'search',
    },
  },
  props: [
    {
      name: 'icon',
      type: 'IconName | ComponentType<SVGProps>',
      description: 'Semantic icon name or SVG component. Valid semantic names: close, chevronDown, chevronLeft, chevronRight, check, success, error, warning, info, calendar, clock, externalLink, menu, moreHorizontal, search, arrowUp, arrowDown, arrowsUpDown, funnel, eyeSlash, viewColumns, copy, checkDouble, wrench, stop, microphone. For any icon not in this list, pass an SVG component directly (e.g. import from lucide-react or @heroicons/react). Note: this prop is called `icon`, not `name`.',
      required: true,
    },
    {
      name: 'color',
      type: "'primary' | 'secondary' | 'tertiary' | 'disabled' | 'accent' | 'success' | 'error' | 'warning' | 'inherit'",
      description: 'Color variant mapped to Astryx icon color tokens.',
      default: "'inherit'",
    },
    {
      name: 'size',
      type: "'xsm' | 'sm' | 'md' | 'lg'",
      description: 'Icon size.',
      default: "'md'",
    },
    {
      name: 'label',
      type: 'string',
      description: 'Accessible name for a MEANINGFUL, standalone icon (a status glyph or icon-only indicator with no adjacent text). Setting it exposes the icon to screen readers as role="img" with this text as the accessible name (aria-label) and removes the default aria-hidden. Omit it (default) for decorative icons and the icon stays hidden from assistive tech (aria-hidden="true"). This is the accessible-name / alt-text prop for icons: one prop instead of manually setting aria-label + role + aria-hidden. An empty string is treated as decorative. Do not set it when an interactive parent (Button, IconButton, link) already names the control.',
    },
  ],
  theming: {
    targets: [
      {className: 'astryx-icon', visualProps: ['color', 'size']},
    ],
  },
  usage: {
    description: 'Icons are small visual symbols that represent actions, objects, or concepts. They improve scannability and reinforce meaning alongside text. Supports both direct SVG components and semantic icon names that adapt to the active theme.',
    bestPractices: [
      { guidance: true, description: 'Use semantic icon names when available; they adapt to theme changes automatically.' },
      { guidance: true, description: 'Pair icons with text labels for accessibility; icon-only elements need an accessible label.' },
      { guidance: true, description: 'For a meaningful standalone icon (no adjacent text), give it an accessible name via the `label` prop: it sets role="img" + aria-label and unhides the icon.' },
      { guidance: true, description: 'Use color tokens for icon colors, not hardcoded hex values.' },
      { guidance: true, description: 'Be mindful of context; decorative icons in compact components can distract rather than help.' },
      { guidance: false, description: 'Use icons as the sole means of conveying meaning; always provide a text alternative.' },
      { guidance: false, description: 'Resize icons with arbitrary pixel values; use the provided size props.' },
      { guidance: false, description: 'Mix icon styles (e.g. outline and filled) within the same context.' },
      { guidance: false, description: 'Render raw SVG elements; always wrap in Icon for consistent sizing and color.' },
      { guidance: false, description: 'Pass a `name` prop; Icon uses `icon` (not `name`) to specify which icon to render.' },
    ],
  },
};

/** @type {import('../docs-types').ComponentDoc} */
export const docsZh = {
  name: 'Icon',
  displayName: 'Icon',
  props: [
    {
      name: 'icon',
      type: 'IconName | ComponentType<SVGProps>',
      description: '语义图标名称或 SVG 组件。有效语义名称：close, chevronDown, chevronLeft, chevronRight, check, success, error, warning, info, calendar, clock, externalLink, menu, moreHorizontal, search, arrowUp, arrowDown, arrowsUpDown, funnel, eyeSlash, viewColumns, copy, checkDouble, wrench, stop, microphone。列表之外的图标请直接传入 SVG 组件。',
      required: true,
    },
    {
      name: 'color',
      type: "'primary' | 'secondary' | 'tertiary' | 'disabled' | 'accent' | 'success' | 'error' | 'warning' | 'inherit'",
      description: '映射到 Astryx 图标颜色令牌的颜色变体。',
      default: "'inherit'",
    },
    {
      name: 'size',
      type: "'xsm' | 'sm' | 'md' | 'lg'",
      description: '图标尺寸。',
      default: "'md'",
    },
    {
      name: 'label',
      type: 'string',
      description: '有含义的独立图标的可访问名称（无相邻文字的状态图标或纯图标指示器）。设置后会将图标以 role="img" 暴露给辅助技术，并以该文本作为可访问名称（aria-label），同时移除默认的 aria-hidden。省略（默认）用于装饰性图标，图标对辅助技术保持隐藏（aria-hidden="true"）。空字符串按装饰性处理。当交互式父元素（Button、IconButton、链接）已命名该控件时请勿设置。',
    },
  ],
  theming: {
    targets: [
      {className: 'astryx-icon', visualProps: ['color', 'size']},
    ],
  },
  usage: {
    description: 'Icons are small visual symbols that represent actions, objects, or concepts. They improve scannability and reinforce meaning alongside text. Supports both direct SVG components and semantic icon names that adapt to the active theme.',
    bestPractices: [
      { guidance: true, description: 'Use semantic icon names when available; they adapt to theme changes automatically.' },
      { guidance: true, description: 'Pair icons with text labels for accessibility; icon-only elements need an accessible label.' },
      { guidance: true, description: 'Use color tokens for icon colors, not hardcoded hex values.' },
      { guidance: true, description: 'Be mindful of context; decorative icons in compact components can distract rather than help.' },
      { guidance: false, description: 'Use icons as the sole means of conveying meaning; always provide a text alternative.' },
      { guidance: false, description: 'Resize icons with arbitrary pixel values; use the provided size props.' },
      { guidance: false, description: 'Mix icon styles (e.g. outline and filled) within the same context.' },
      { guidance: false, description: 'Render raw SVG elements; always wrap in Icon for consistent sizing and color.' },
      { guidance: false, description: 'Pass a `name` prop; Icon uses `icon` (not `name`) to specify which icon to render.' },
    ],
  },
};

/** @type {import('../docs-types').TranslationDoc} */
export const docsDense = {
  description:
    'Renders icons w/ Astryx design system colors + sizes. Supports direct SVG icon components + semantic icon names that adapt to active theme.',
  usage: {
    description: 'Icons are small visual symbols that represent actions, objects, or concepts. They improve scannability and reinforce meaning alongside text. Supports both direct SVG components and semantic icon names that adapt to the active theme.',
    bestPractices: [
      { guidance: true, description: 'Use semantic icon names when available; they adapt to theme changes automatically.' },
      { guidance: true, description: 'Pair icons with text labels for accessibility; icon-only elements need an accessible label.' },
      { guidance: true, description: 'For a meaningful standalone icon (no adjacent text), set an accessible name via `label`: sets role="img" + aria-label, unhides icon.' },
      { guidance: true, description: 'Use color tokens for icon colors, not hardcoded hex values.' },
      { guidance: true, description: 'Be mindful of context; decorative icons in compact components can distract rather than help.' },
      { guidance: false, description: 'Use icons as the sole means of conveying meaning; always provide a text alternative.' },
      { guidance: false, description: 'Resize icons with arbitrary pixel values; use the provided size props.' },
      { guidance: false, description: 'Mix icon styles (e.g. outline and filled) within the same context.' },
      { guidance: false, description: 'Render raw SVG elements; always wrap in Icon for consistent sizing and color.' },
      { guidance: false, description: '`name` prop, which does not exist. Use `icon` to specify which icon to render.' },
    ],
  },
  propDescriptions: {
    icon: 'Semantic icon name or SVG component. Valid names: close, chevronDown, chevronLeft, chevronRight, check, success, error, warning, info, calendar, clock, externalLink, menu, moreHorizontal, search, arrowUp, arrowDown, arrowsUpDown, funnel, eyeSlash, viewColumns, copy, checkDouble, wrench, stop, microphone. For others, pass an SVG component.',
    color: 'Color variant mapped to Astryx icon color tokens.',
    size: 'Icon size.',
    label: 'Accessible name for a meaningful, standalone icon. Sets role="img" + aria-label and drops the default aria-hidden. Omit (default) for decorative icons (stays aria-hidden). Empty string = decorative. The accessible-name/alt-text prop for icons.',
  },
};
