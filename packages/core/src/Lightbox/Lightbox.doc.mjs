// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @type {import('../docs-types').ComponentDoc} */

export const docs = {
  name: 'Lightbox',
  displayName: 'Lightbox',
  category: 'Containers',
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
      type: 'XDSLightboxMedia | XDSLightboxMedia[]',
      description: 'Media to display. Pass a single object for one item, or an array for gallery mode with prev/next navigation. Each item has src, alt, optional caption and type.',
      required: true,
    },
    {
      name: 'index',
      type: 'number',
      description: 'Current index in gallery mode (when media is an array).',
      default: '0',
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
      {className: 'xds-lightbox', visualProps: []},
    ],
  },
  usage: {
    description:
      'A fullscreen overlay for viewing images and videos at full resolution. Supports single-item and gallery modes with prev/next navigation, optional zoom and pan for images, and native video controls.',
    bestPractices: [
      { guidance: true, description: 'Always provide alt text for every image for screen reader accessibility.' },
      { guidance: true, description: 'Use gallery mode with onIndexChange for multi-image sets.' },
      { guidance: true, description: 'Enable hasZoom only when viewing high-resolution images that benefit from close inspection.' },
      { guidance: false, description: 'Use the lightbox for non-image content — it is specialized for images.' },
      { guidance: false, description: 'Nest interactive content inside captions — keep them plain text.' },
    ],
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
      type: 'XDSLightboxMedia | XDSLightboxMedia[]',
      description: '要显示的媒体。传入单个对象或数组（用于画廊模式的上一张/下一张导航）。',
      required: true,
    },
    {
      name: 'index',
      type: 'number',
      description: '画廊模式中当前索引。',
      default: '0',
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
      {className: 'xds-lightbox', visualProps: []},
    ],
  },
  usage: {
    description:
      'A fullscreen overlay for viewing images and videos at full resolution. Supports single-item and gallery modes with prev/next navigation, optional zoom and pan for images, and native video controls.',
    bestPractices: [
      { guidance: true, description: 'Always provide alt text for every image for screen reader accessibility.' },
      { guidance: true, description: 'Use gallery mode with onIndexChange for multi-image sets.' },
      { guidance: true, description: 'Enable hasZoom only when viewing high-resolution images that benefit from close inspection.' },
      { guidance: false, description: 'Use the lightbox for non-image content — it is specialized for images.' },
      { guidance: false, description: 'Nest interactive content inside captions — keep them plain text.' },
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
      { guidance: false, description: 'Use for non-image content — specialized for images.' },
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
