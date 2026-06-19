// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @type {import('../docs-types').ComponentDoc} */

export const docs = {
  name: 'Icon',
  displayName: 'Icon',
  category: 'Content',
  keywords: ["icon","svg","glyph","symbol","pictogram","graphic","vector"],
  props: [
    {
      name: 'icon',
      type: 'XDSIconName | ComponentType<SVGProps>',
      description: 'Semantic icon name or SVG component. Run `npx xds docs icons` for valid names. Note: this prop is called `icon`, not `name`.',
      required: true,
    },
    {
      name: 'color',
      type: "'primary' | 'secondary' | 'tertiary' | 'disabled' | 'accent' | 'success' | 'error' | 'warning' | 'inherit'",
      description: 'Color variant mapped to XDS icon color tokens.',
      default: "'inherit'",
    },
    {
      name: 'size',
      type: "'xsm' | 'sm' | 'md' | 'lg'",
      description: 'Icon size.',
      default: "'md'",
    },
  ],
  theming: {
    targets: [
      {className: 'xds-icon', visualProps: ['color', 'size']},
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
      { guidance: false, description: 'Pass a `name` prop \u2014 XDSIcon uses `icon` (not `name`) to specify which icon to render.' },
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
      type: 'XDSIconName | ComponentType<SVGProps>',
      description: '语义图标名称或 SVG 组件。运行 `npx xds docs icons` 查看可用名称。',
      required: true,
    },
    {
      name: 'color',
      type: "'primary' | 'secondary' | 'tertiary' | 'disabled' | 'accent' | 'success' | 'error' | 'warning' | 'inherit'",
      description: '映射到 XDS 图标颜色令牌的颜色变体。',
      default: "'inherit'",
    },
    {
      name: 'size',
      type: "'xsm' | 'sm' | 'md' | 'lg'",
      description: '图标尺寸。',
      default: "'md'",
    },
  ],
  theming: {
    targets: [
      {className: 'xds-icon', visualProps: ['color', 'size']},
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
      { guidance: false, description: 'Pass a `name` prop \u2014 XDSIcon uses `icon` (not `name`) to specify which icon to render.' },
    ],
  },
};

/** @type {import('../docs-types').TranslationDoc} */
export const docsDense = {
  description:
    'Renders icons w/ XDS design system colors + sizes. Supports direct SVG icon components + semantic icon names that adapt to active theme.',
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
      { guidance: false, description: '`name` prop \u2014 does not exist. Use `icon` to specify which icon to render.' },
    ],
  },
  propDescriptions: {
    icon: 'Semantic icon name or SVG component. See `npx xds docs icons`.',
    color: 'Color variant mapped to XDS icon color tokens.',
    size: 'Icon size.',
  },
};
