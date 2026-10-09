// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Icon consumer documentation
 * @input Semantic/direct artwork, independent requests and owner-declared role policy
 * @output Public props, sizing, finite role/state boundaries and accessible-name guidance
 * @position Builder-facing source contract; component participation remains owner-declared
 */

/** @type {import('@astryxdesign/cli/authoring').ComponentAnatomyElement[]} */
const anatomy = [
  {
    name: 'Glyph',
    required: true,
    description: 'Visual symbol rendered for the selected icon.',
  },
];

/** @type {import('@astryxdesign/cli/authoring').ComponentDoc} */

export const docs = {
  name: 'Icon',
  displayName: 'Icon',
  category: 'Content',
  keywords: [
    'icon',
    'svg',
    'glyph',
    'symbol',
    'pictogram',
    'graphic',
    'vector',
  ],
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
      description:
        'Semantic icon name or SVG component. Valid semantic names: close, chevronDown, chevronLeft, chevronRight, chevronsLeft, chevronsRight, check, success, error, warning, info, calendar, clock, externalLink, menu, moreHorizontal, search, upload, arrowUp, arrowDown, arrowsUpDown, funnel, eyeSlash, viewColumns, copy, checkDouble, wrench, stop, microphone. For any icon not in this list, pass an SVG component directly (e.g. import from lucide-react or @heroicons/react). Note: this prop is called `icon`, not `name`.',
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
      type: 'IconSize',
      description:
        'Built-in xsm/sm/md/lg or an admitted application icon-size name. An explicit value wins. In an explicitly participating component role, the theme roleSizeOverrides choice wins over the owner default; otherwise the nearest owning-component default wins, then md. Explicit and standalone icons use active theme dimension overrides. Implicit built-in sizes inside existing, nonparticipating components keep their released rem scaling; omitted overrides and built-in null clears keep that scaling too.',
      default: "Contextual; otherwise 'md'",
    },
    {
      name: 'appearance',
      type: 'IconAppearance',
      description:
        "An admitted supplied-artwork appearance. Explicit intent wins over the participating role's effective-state choice, then per-size choice, then theme default. Unsupported branches fall back to supplied artwork; ordinary direct SVG components do not receive this prop.",
    },
    {
      name: 'weight',
      type: 'IconWeight',
      description:
        'An admitted exact or numeric-range artwork weight. Explicit intent wins over the theme default or per-size choice. Fractional numeric values are preserved for supplied range renderers; ordinary direct SVG components do not receive this prop.',
    },
    {
      name: 'label',
      type: 'string',
      description:
        'Accessible name for a MEANINGFUL, standalone icon (a status glyph or icon-only indicator with no adjacent text). Setting it exposes the icon to screen readers as role="img" with this text as the accessible name (aria-label) and removes the default aria-hidden. Omit it (default) for decorative icons and the icon stays hidden from assistive tech (aria-hidden="true"). This is the accessible-name / alt-text prop for icons: one prop instead of manually setting aria-label + role + aria-hidden. An empty string is treated as decorative. Do not set it when an interactive parent (Button, IconButton, link) already names the control.',
    },
    {
      name: 'xstyle',
      type: 'StyleXStyles',
      description:
        "StyleX styles for customization (color, size, opacity). Folded into the icon's own stylex.props() call so it composes with the base color/size styles. Must be a stylex.create() value, not an inline style object like style={{}}.",
    },
  ],
  theming: {
    targets: [{className: 'astryx-icon', visualProps: ['color', 'size']}],
  },
  usage: {
    description:
      'Icons are small visual symbols that represent actions, objects, or concepts. They improve scannability and reinforce meaning alongside text. Supports both direct SVG components and semantic icon names that adapt to the active theme.',
    anatomy,
    bestPractices: [
      {
        guidance: true,
        description:
          'Use semantic icon names when available; they adapt to theme changes automatically.',
      },
      {
        guidance: true,
        description:
          "Override icons through the theme, not globally: defineTheme({icons: {close: <XMarkIcon />}}) scopes the swap to the active <Theme>, and extends shallow-merges it into derived themes. registerIcons() mutates a process-wide registry and warns in dev, so keep it for app bootstrap rather than making it a library's theming seam.",
      },
      {
        guidance: true,
        description:
          'Component source slots map to shared IconName or null through componentIcons. A {slot: true} declaration changes only source selection. Finite states participate only after the owner calls declareComponentIconRole with a typed defaultSize and exhaustive statePrecedence; the active theme validates the resolved size. getComponentIconState selects the first active state, or undefined. No Core component is enrolled by this source contract. Icon has no new slot, state, request or defaultSize props; role rendering stays private. See astryx docs icons for the focused contract.',
      },
      {
        guidance: true,
        description:
          'Pair icons with text labels for accessibility; icon-only elements need an accessible label.',
      },
      {
        guidance: true,
        description:
          'For a meaningful standalone icon (no adjacent text), give it an accessible name via the `label` prop: it sets role="img" + aria-label and unhides the icon.',
      },
      {
        guidance: true,
        description:
          'Use color tokens for icon colors, not hardcoded hex values.',
      },
      {
        guidance: true,
        description:
          'Be mindful of context; decorative icons in compact components can distract rather than help.',
      },
      {
        guidance: false,
        description:
          'Use icons as the sole means of conveying meaning; always provide a text alternative.',
      },
      {
        guidance: false,
        description:
          'Resize icons with arbitrary pixel values; use the provided size props.',
      },
      {
        guidance: false,
        description:
          'Mix icon styles (e.g. outline and filled) within the same context.',
      },
      {
        guidance: false,
        description:
          'Render raw SVG elements; always wrap in Icon for consistent sizing and color.',
      },
      {
        guidance: false,
        description:
          'Pass a `name` prop; Icon uses `icon` (not `name`) to specify which icon to render.',
      },
    ],
  },
};

/** @type {import('@astryxdesign/cli/authoring').ComponentDoc} */
export const docsZh = {
  name: 'Icon',
  displayName: 'Icon',
  props: [
    {
      name: 'icon',
      type: 'IconName | ComponentType<SVGProps>',
      description:
        '语义图标名称或 SVG 组件。有效语义名称：close, chevronDown, chevronLeft, chevronRight, chevronsLeft, chevronsRight, check, success, error, warning, info, calendar, clock, externalLink, menu, moreHorizontal, search, upload, arrowUp, arrowDown, arrowsUpDown, funnel, eyeSlash, viewColumns, copy, checkDouble, wrench, stop, microphone。列表之外的图标请直接传入 SVG 组件。',
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
      type: 'IconSize',
      description:
        '内置 xsm/sm/md/lg 或应用声明的图标尺寸名称。显式值优先；明确参与的组件角色先使用主题 roleSizeOverrides，再使用角色默认值。其他情况使用所属组件默认值，最后为 md。显式尺寸和独立图标使用当前主题的尺寸覆盖；未参与角色协议的现有组件隐式提供的内置尺寸保留原有 rem 缩放。省略覆盖或将内置尺寸覆盖设为 null 时也保留原有缩放。',
      default: "上下文默认值；否则为 'md'",
    },
    {
      name: 'appearance',
      type: 'IconAppearance',
      description:
        '已声明的图标外观。显式请求优先，其次为参与角色的有效状态、按最终尺寸设置的值、主题默认值。没有对应分支时使用提供的回退图形。普通直接 SVG 组件不会收到此属性。',
    },
    {
      name: 'weight',
      type: 'IconWeight',
      description:
        '已声明的精确字重或数值范围字重。显式请求优先于主题默认值或按尺寸设置的值；提供的范围渲染组件收到原始小数值。普通直接 SVG 组件不会收到此属性。',
    },
    {
      name: 'label',
      type: 'string',
      description:
        '有含义的独立图标的可访问名称（无相邻文字的状态图标或纯图标指示器）。设置后会将图标以 role="img" 暴露给辅助技术，并以该文本作为可访问名称（aria-label），同时移除默认的 aria-hidden。省略（默认）用于装饰性图标，图标对辅助技术保持隐藏（aria-hidden="true"）。空字符串按装饰性处理。当交互式父元素（Button、IconButton、链接）已命名该控件时请勿设置。',
    },
    {
      name: 'xstyle',
      type: 'StyleXStyles',
      description:
        '用于自定义的 StyleX 样式（颜色、尺寸、不透明度）。会并入图标自身的 stylex.props() 调用，从而与基础的颜色/尺寸样式组合。必须是 stylex.create() 的值，而不是像 style={{}} 这样的内联样式对象。',
    },
  ],
  theming: {
    targets: [{className: 'astryx-icon', visualProps: ['color', 'size']}],
  },
  usage: {
    description:
      'Icons are small visual symbols that represent actions, objects, or concepts. They improve scannability and reinforce meaning alongside text. Supports both direct SVG components and semantic icon names that adapt to the active theme.',
    bestPractices: [
      {
        guidance: true,
        description:
          'Use semantic icon names when available; they adapt to theme changes automatically.',
      },
      {
        guidance: true,
        description:
          'Component source slots map to shared IconName or null through componentIcons. A {slot: true} declaration changes only source selection. Finite states participate only after the owner calls declareComponentIconRole with a typed defaultSize and exhaustive statePrecedence; the active theme validates the resolved size. getComponentIconState selects the first active state, or undefined. No Core component is enrolled by this source contract. Icon has no new slot, state, request or defaultSize props; role rendering stays private. See astryx docs icons for the focused contract.',
      },
      {
        guidance: true,
        description:
          'Pair icons with text labels for accessibility; icon-only elements need an accessible label.',
      },
      {
        guidance: true,
        description:
          'Use color tokens for icon colors, not hardcoded hex values.',
      },
      {
        guidance: true,
        description:
          'Be mindful of context; decorative icons in compact components can distract rather than help.',
      },
      {
        guidance: false,
        description:
          'Use icons as the sole means of conveying meaning; always provide a text alternative.',
      },
      {
        guidance: false,
        description:
          'Resize icons with arbitrary pixel values; use the provided size props.',
      },
      {
        guidance: false,
        description:
          'Mix icon styles (e.g. outline and filled) within the same context.',
      },
      {
        guidance: false,
        description:
          'Render raw SVG elements; always wrap in Icon for consistent sizing and color.',
      },
      {
        guidance: false,
        description:
          'Pass a `name` prop; Icon uses `icon` (not `name`) to specify which icon to render.',
      },
    ],
  },
};

/** @type {import('@astryxdesign/cli/authoring').ComponentTranslationDoc} */
export const docsDense = {
  description:
    'Renders icons w/ Astryx design system colors + sizes. Supports direct SVG icon components + semantic icon names that adapt to active theme.',
  usage: {
    description:
      'Icons are small visual symbols that represent actions, objects, or concepts. They improve scannability and reinforce meaning alongside text. Supports both direct SVG components and semantic icon names that adapt to the active theme.',
    anatomy,
    bestPractices: [
      {
        guidance: true,
        description:
          'Use semantic icon names when available; they adapt to theme changes automatically.',
      },
      {
        guidance: true,
        description:
          'Override icons via theme, not globally: defineTheme({icons: {close: <XMarkIcon />}}) scopes the swap to the active <Theme>; extends shallow-merges into derived themes. registerIcons() mutates a global registry and warns in dev: app bootstrap only, not a library theming seam.',
      },
      {
        guidance: true,
        description:
          'Component source slots map to shared IconName or null through componentIcons. A {slot: true} declaration changes only source selection. Finite states participate only after the owner calls declareComponentIconRole with a typed defaultSize and exhaustive statePrecedence; the active theme validates the resolved size. getComponentIconState selects the first active state, or undefined. No Core component is enrolled by this source contract. Icon has no new slot, state, request or defaultSize props; role rendering stays private. See astryx docs icons for the focused contract.',
      },
      {
        guidance: true,
        description:
          'Pair icons with text labels for accessibility; icon-only elements need an accessible label.',
      },
      {
        guidance: true,
        description:
          'For a meaningful standalone icon (no adjacent text), set an accessible name via `label`: sets role="img" + aria-label, unhides icon.',
      },
      {
        guidance: true,
        description:
          'Use color tokens for icon colors, not hardcoded hex values.',
      },
      {
        guidance: true,
        description:
          'Be mindful of context; decorative icons in compact components can distract rather than help.',
      },
      {
        guidance: false,
        description:
          'Use icons as the sole means of conveying meaning; always provide a text alternative.',
      },
      {
        guidance: false,
        description:
          'Resize icons with arbitrary pixel values; use the provided size props.',
      },
      {
        guidance: false,
        description:
          'Mix icon styles (e.g. outline and filled) within the same context.',
      },
      {
        guidance: false,
        description:
          'Render raw SVG elements; always wrap in Icon for consistent sizing and color.',
      },
      {
        guidance: false,
        description:
          '`name` prop, which does not exist. Use `icon` to specify which icon to render.',
      },
    ],
  },
  propDescriptions: {
    icon: 'Semantic icon name or SVG component. Valid names: close, chevronDown, chevronLeft, chevronRight, chevronsLeft, chevronsRight, check, success, error, warning, info, calendar, clock, externalLink, menu, moreHorizontal, search, upload, arrowUp, arrowDown, arrowsUpDown, funnel, eyeSlash, viewColumns, copy, checkDouble, wrench, stop, microphone. For others, pass an SVG component.',
    color: 'Color variant mapped to Astryx icon color tokens.',
    size: 'admitted icon size; explicit wins, then participating theme role size/owner default or legacy context, then md; nonparticipating implicit built-ins retain rem scaling',
    appearance:
      'Admitted supplied-artwork appearance; explicit > participating effective state > bySize > default; not forwarded to ordinary direct SVGs.',
    weight:
      'Admitted exact/range artwork weight; explicit beats theme default/bySize; fractional range values preserved; not forwarded to ordinary direct SVGs.',
    label:
      'Accessible name for a meaningful, standalone icon. Sets role="img" + aria-label and drops the default aria-hidden. Omit (default) for decorative icons (stays aria-hidden). Empty string = decorative. The accessible-name/alt-text prop for icons.',
    xstyle:
      'StyleX styles (color, size, opacity) via stylex.create(); composes with the base color/size styles.',
  },
};
