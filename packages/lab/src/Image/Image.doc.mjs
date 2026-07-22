// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @type {import('../../core/src/docs-types').ComponentDoc} */

export const docs = {
  name: 'Image',
  displayName: 'Image',
  category: 'Content',
  keywords: [
    'image',
    'img',
    'photo',
    'picture',
    'media',
    'fallback',
    'skeleton',
    'lazy',
    'preview',
    'lightbox',
    'zoom',
    'hero',
    'gallery',
  ],
  props: [
    {
      name: 'src',
      type: 'string',
      description: 'Image source URL.',
      required: true,
    },
    {
      name: 'alt',
      type: 'string',
      description:
        'Alt text describing the image. Pass an empty string for purely decorative images so the error placeholder stays silent too.',
      required: true,
    },
    {
      name: 'ratio',
      type: 'number',
      description:
        'Width/height ratio for the image box (e.g. 16/9). When set, the image is laid out inside an AspectRatio container and fills it per fit. When omitted, the image renders at its intrinsic size, capped by maxWidth.',
    },
    {
      name: 'fit',
      type: "'cover' | 'contain'",
      description:
        "How the image fills its ratio box: 'cover' fills and crops, 'contain' letterboxes. Only applies when ratio is set.",
      default: "'cover'",
    },
    {
      name: 'radius',
      type: "'none' | 'inner' | 'element' | 'container' | 'full'",
      description:
        "Corner radius token role applied to the image frame: 'inner' for corners nested inside padded containers, 'element' for control-scale tiles, 'container' for card/panel-scale surfaces, 'full' for pills and circles.",
      default: "'none'",
    },
    {
      name: 'maxWidth',
      type: 'number | string',
      description:
        'Caps the rendered width (number = px, string = CSS value) and centers the image horizontally. Pairs with intrinsic (ratio-less) layout for logos and figures.',
    },
    {
      name: 'fallbackSrc',
      type: 'string',
      description:
        'Replacement source attempted when src fails to load. A value equal to src, or an empty string, is treated as absent.',
    },
    {
      name: 'fallback',
      type: 'ReactNode',
      description:
        'Custom content rendered when every source has failed. Defaults to a neutral placeholder that exposes alt via role="img".',
    },
    {
      name: 'loading',
      type: "'lazy' | 'eager'",
      description: 'Native image loading strategy.',
      default: "'lazy'",
    },
    {
      name: 'hasPreview',
      type: 'boolean',
      description:
        'Wraps the image in a button (aria-haspopup="dialog") that opens a fullscreen Lightbox preview.',
      default: 'false',
    },
    {
      name: 'previewCaption',
      type: 'ReactNode',
      description: 'Caption shown below the image inside the Lightbox preview.',
    },
    {
      name: 'previewLabel',
      type: 'string',
      description:
        "Accessible name for the preview trigger button. When omitted, the image's alt names the trigger; decorative images (alt=\"\") fall back to 'View larger image' so the button is never nameless.",
    },
    {
      name: 'xstyle',
      type: 'StyleXStyles',
      description:
        'StyleX styles for layout customization (margins, positioning, sizing). Must be a stylex.create() value, not an inline style object like style={{}}.',
    },
  ],
  theming: {
    targets: [{className: 'astryx-image', visualProps: ['radius']}],
    vars: [
      {
        name: '--_image-radius',
        description: 'Border radius of the image frame',
        default: 'var(--radius-none)',
        private: true,
      },
    ],
    derived: [{property: 'borderRadius', vars: ['--_image-radius']}],
  },
  usage: {
    description:
      'A content image with the behaviors a bare img cannot provide: a skeleton while it loads, a graceful fallback chain when it fails (fallbackSrc, then fallback, then a neutral placeholder), and an optional click-to-zoom Lightbox preview. Use it for heroes, product galleries, media cards, and figures instead of a raw img with hand-written fill/cap/radius CSS.',
    bestPractices: [
      {
        guidance: true,
        description:
          'Set ratio for content images so the box is reserved before the image loads and layout never shifts.',
      },
      {
        guidance: true,
        description:
          'Provide fallbackSrc (or fallback) for user-generated or remote images that can break.',
      },
      {
        guidance: true,
        description:
          "Match radius to the surface scale: 'container' at card/hero scale, 'element' for small tiles.",
      },
      {
        guidance: false,
        description:
          'Wrap Image in your own AspectRatio; pass ratio instead so loading and error states stay inside the box.',
      },
      {
        guidance: false,
        description:
          'Use hasPreview for images that are links or trigger selection; it is only for view-larger zoom.',
      },
    ],
  },
};

/** @type {import('../../core/src/docs-types').ComponentDoc} */
export const docsZh = {
  name: 'Image',
  displayName: 'Image',
  props: [
    {
      name: 'src',
      type: 'string',
      description: '图片源 URL。',
      required: true,
    },
    {
      name: 'alt',
      type: 'string',
      description:
        '描述图片的替代文本。纯装饰性图片请传入空字符串，错误占位符也会保持静默。',
      required: true,
    },
    {
      name: 'ratio',
      type: 'number',
      description:
        '图片容器的宽高比（如 16/9）。设置后图片置于 AspectRatio 容器内并按 fit 填充；省略时图片按固有尺寸渲染，受 maxWidth 限制。',
    },
    {
      name: 'fit',
      type: "'cover' | 'contain'",
      description:
        "图片如何填充比例容器：'cover' 填满并裁剪，'contain' 完整显示留白。仅在设置 ratio 时生效。",
      default: "'cover'",
    },
    {
      name: 'radius',
      type: "'none' | 'inner' | 'element' | 'container' | 'full'",
      description:
        "应用于图片外框的圆角令牌角色：'inner' 用于嵌套在有内边距容器中的角，'element' 用于控件级小图块，'container' 用于卡片/面板级表面，'full' 用于胶囊和圆形。",
      default: "'none'",
    },
    {
      name: 'maxWidth',
      type: 'number | string',
      description:
        '限制渲染宽度（数字 = px，字符串 = CSS 值）并水平居中。与无 ratio 的固有尺寸布局配合用于 logo 和插图。',
    },
    {
      name: 'fallbackSrc',
      type: 'string',
      description:
        'src 加载失败时尝试的替代源。与 src 相同的值或空字符串视为未提供。',
    },
    {
      name: 'fallback',
      type: 'ReactNode',
      description:
        '所有源都失败时渲染的自定义内容。默认是一个通过 role="img" 暴露 alt 的中性占位符。',
    },
    {
      name: 'loading',
      type: "'lazy' | 'eager'",
      description: '原生图片加载策略。',
      default: "'lazy'",
    },
    {
      name: 'hasPreview',
      type: 'boolean',
      description:
        '将图片包裹在按钮（aria-haspopup="dialog"）中，点击打开全屏 Lightbox 预览。',
      default: 'false',
    },
    {
      name: 'previewCaption',
      type: 'ReactNode',
      description: 'Lightbox 预览中显示在图片下方的说明文字。',
    },
    {
      name: 'previewLabel',
      type: 'string',
      description:
        '预览触发按钮的无障碍名称。省略时按钮名称取自图片的 alt；装饰性图片（alt=""）会回退到 \'View larger image\'，确保按钮始终有名称。',
    },
    {
      name: 'xstyle',
      type: 'StyleXStyles',
      description:
        '用于布局自定义的 StyleX 样式（外边距、定位、尺寸）。必须是 stylex.create() 的值，而非内联样式对象如 style={{}}。',
    },
  ],
  theming: {
    targets: [{className: 'astryx-image', visualProps: ['radius']}],
    vars: [
      {
        name: '--_image-radius',
        description: 'Border radius of the image frame',
        default: 'var(--radius-none)',
        private: true,
      },
    ],
    derived: [{property: 'borderRadius', vars: ['--_image-radius']}],
  },
  usage: {
    description:
      'A content image with the behaviors a bare img cannot provide: a skeleton while it loads, a graceful fallback chain when it fails (fallbackSrc, then fallback, then a neutral placeholder), and an optional click-to-zoom Lightbox preview. Use it for heroes, product galleries, media cards, and figures instead of a raw img with hand-written fill/cap/radius CSS.',
    bestPractices: [
      {
        guidance: true,
        description:
          'Set ratio for content images so the box is reserved before the image loads and layout never shifts.',
      },
      {
        guidance: true,
        description:
          'Provide fallbackSrc (or fallback) for user-generated or remote images that can break.',
      },
      {
        guidance: true,
        description:
          "Match radius to the surface scale: 'container' at card/hero scale, 'element' for small tiles.",
      },
      {
        guidance: false,
        description:
          'Wrap Image in your own AspectRatio; pass ratio instead so loading and error states stay inside the box.',
      },
      {
        guidance: false,
        description:
          'Use hasPreview for images that are links or trigger selection; it is only for view-larger zoom.',
      },
    ],
  },
};

/** @type {import('../../core/src/docs-types').TranslationDoc} */
export const docsDense = {
  description:
    'Content image: skeleton while loading, fallback chain on error, optional Lightbox preview; ratio box or intrinsic + maxWidth.',
  usage: {
    description:
      'First-party content image: skeleton while loading, fallbackSrc → fallback → placeholder on error, optional Lightbox zoom. Replaces raw img + hand-written fill/cap/radius CSS in heroes, galleries, media cards, figures.',
    bestPractices: [
      {
        guidance: true,
        description: 'Set ratio so the box is reserved and layout never shifts.',
      },
      {
        guidance: true,
        description: 'Give remote/user-generated images fallbackSrc or fallback.',
      },
      {
        guidance: true,
        description:
          "radius: 'container' at card/hero scale, 'element' for small tiles.",
      },
      {
        guidance: false,
        description: 'Wrap Image in your own AspectRatio — pass ratio instead.',
      },
      {
        guidance: false,
        description:
          'hasPreview for links or selection; it is view-larger zoom only.',
      },
    ],
  },
  propDescriptions: {
    src: 'Image source URL.',
    alt: 'Required alt text; empty string for decorative.',
    ratio: 'Width/height ratio; wraps image in AspectRatio.',
    fit: "'cover' crops, 'contain' letterboxes; needs ratio.",
    radius: 'Frame radius token role: none|inner|element|container|full.',
    maxWidth: 'Caps width (px or CSS value), centers horizontally.',
    fallbackSrc:
      'Replacement source tried when src fails; === src or "" treated as absent.',
    fallback: 'Custom node when all sources fail.',
    loading: "Native strategy: 'lazy' (default) | 'eager'.",
    hasPreview: 'Button trigger + fullscreen Lightbox zoom.',
    previewCaption: 'Caption below the image in the Lightbox.',
    previewLabel:
      "Trigger button name; defaults to 'View larger image' when alt is empty.",
    xstyle: 'StyleX layout styles; must be stylex.create() value.',
  },
};
