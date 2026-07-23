// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @type {import('../docs-types').ComponentDoc} */

export const docs = {
  name: 'Lightbox',
  displayName: 'Lightbox',
  category: 'Overlay',
  keywords: ["lightbox","image","video","viewer","gallery","zoom","fullscreen","media","photo","preview"],
  props: [
    {
      name: 'isOpen',
      type: 'boolean',
      description: 'Whether the lightbox is open.',
      required: true,
    },
    {
      name: 'onOpenChange',
      type: '(isOpen: boolean) => void',
      description: 'Callback when the lightbox open state changes.',
      required: true,
    },
    {
      name: 'media',
      // Left as the named type on purpose: the shape carries `caption?:
      // ReactNode`, so spelling it out makes the docsite playground parse the
      // whole prop as an editable *string*, which would feed the preview text
      // where a media object belongs. The shape and its legal values live in
      // the description instead (#1645).
      type: 'LightboxMedia | LightboxMedia[]',
      description: "Media to display. Pass a single object for one item, or an array for gallery mode with prev/next navigation. Each item is {src: string, alt: string, caption?: ReactNode, type?: 'image' | 'video'}; type defaults to 'image', and zoom/pan is disabled for 'video'.",
      required: true,
    },
    {
      name: 'index',
      type: 'number',
      description: 'Current index in gallery mode (when media is an array).',
    },
    {
      name: 'onIndexChange',
      type: '(index: number) => void',
      description: 'Callback when the gallery index changes via prev/next navigation.',
    },
    {
      name: 'hasZoom',
      type: 'boolean',
      description: 'Enable zoom on double-click (images only). When zoomed, drag to pan.',
      default: 'false',
    },
    {
      name: 'xstyle',
      type: 'StyleXStyles',
      description: 'StyleX styles for layout customization. Must be stylex.create() value.',
    },
  ],
  theming: {
    targets: [
      {className: 'astryx-lightbox', visualProps: []},
    ],
  },
  usage: {
    description:
      'A fullscreen overlay for viewing images and videos at full resolution. Supports single-item and gallery modes with prev/next navigation, optional zoom and pan for images, and native video controls.',
    bestPractices: [
      { guidance: true, description: 'Always provide alt text for every image for screen reader accessibility.' },
      { guidance: true, description: 'Use gallery mode with onIndexChange for multi-image sets.' },
      { guidance: true, description: 'Enable hasZoom only when viewing high-resolution images that benefit from close inspection.' },
      { guidance: false, description: 'Use the lightbox for non-image content; it is specialized for images.' },
      { guidance: false, description: 'Nest interactive content inside captions; keep them plain text.' },
    ],
  },
  // The lightbox opens via showModal() and renders nothing while closed —
  // overlay mode gives the Properties preview an open trigger instead of an
  // empty stage, mirroring MobileNav (#3616).
  playground: {
    overlay: true,
    defaults: {
      isOpen: false,
      media: {
        src: 'https://lookaside.facebook.com/assets/astryx/light-scene-horizontal-1.png',
        alt: 'Coastal shoreline with ocean waves',
        caption: 'A scenic coastline with waves rolling onto a sandy beach beneath a clear sky.',
      },
    },
  },
};

/** @type {import('../docs-types').ComponentDoc} */
export const docsZh = {
  name: 'Lightbox',
  displayName: 'Lightbox',
  props: [
    {
      name: 'isOpen',
      type: 'boolean',
      description: '灯箱是否打开。',
      required: true,
    },
    {
      name: 'onOpenChange',
      type: '(isOpen: boolean) => void',
      description: '灯箱打开状态变化时的回调。',
      required: true,
    },
    {
      name: 'media',
      type: 'LightboxMedia | LightboxMedia[]',
      description: "要显示的媒体。传入单个对象或数组（用于画廊模式的上一张/下一张导航）。每项为 {src, alt, caption?, type?: 'image' | 'video'}；type 默认为 'image'，'video' 禁用缩放/平移。",
      required: true,
    },
    {
      name: 'index',
      type: 'number',
      description: '画廊模式中当前索引。',
    },
    {
      name: 'onIndexChange',
      type: '(index: number) => void',
      description: '通过上一张/下一张导航更改画廊索引时的回调。',
    },
    {
      name: 'hasZoom',
      type: 'boolean',
      description: '启用双击缩放（仅图片）。缩放后可拖动平移。',
      default: 'false',
    },
    {
      name: 'xstyle',
      type: 'StyleXStyles',
      description: '用于布局自定义的 StyleX 样式。必须是 stylex.create() 的值。',
    },
  ],
  theming: {
    targets: [
      {className: 'astryx-lightbox', visualProps: []},
    ],
  },
  usage: {
    description:
      'A fullscreen overlay for viewing images and videos at full resolution. Supports single-item and gallery modes with prev/next navigation, optional zoom and pan for images, and native video controls.',
    bestPractices: [
      { guidance: true, description: 'Always provide alt text for every image for screen reader accessibility.' },
      { guidance: true, description: 'Use gallery mode with onIndexChange for multi-image sets.' },
      { guidance: true, description: 'Enable hasZoom only when viewing high-resolution images that benefit from close inspection.' },
      { guidance: false, description: 'Use the lightbox for non-image content; it is specialized for images.' },
      { guidance: false, description: 'Nest interactive content inside captions; keep them plain text.' },
    ],
  },
};

/** @type {import('../docs-types').TranslationDoc} */
export const docsDense = {
  description: 'Fullscreen overlay for viewing images and videos at full resolution with gallery navigation and zoom.',
  usage: {
    description:
      'A fullscreen overlay for viewing images and videos at full resolution. Supports single-item and gallery modes with prev/next navigation, optional zoom and pan for images, and native video controls.',
    bestPractices: [
      { guidance: true, description: 'Always provide alt text for every image.' },
      { guidance: true, description: 'Use gallery mode with onIndexChange for multi-image sets.' },
      { guidance: true, description: 'Enable hasZoom only when viewing high-resolution images that benefit from close inspection.' },
      { guidance: false, description: 'Use for non-image content; specialized for images.' },
      { guidance: false, description: 'Nest interactive content inside captions; keep them plain text.' },
    ],
  },
  propDescriptions: {
    isOpen: 'Whether the lightbox is open.',
    onOpenChange: 'Callback when open state changes.',
    media: 'Single media object or array for gallery mode.',
    index: 'Current index in gallery mode.',
    onIndexChange: 'Callback when gallery index changes.',
    hasZoom: 'Enable double-click zoom and drag pan (images only).',
    xstyle: 'StyleX styles for layout customization.',
  },
};
