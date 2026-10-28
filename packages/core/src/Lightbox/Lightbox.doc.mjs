// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @type {import('@astryxdesign/cli/authoring').ComponentAnatomyElement[]} */
const anatomy = [
  {
    name: 'Viewer overlay',
    required: true,
    description:
      'Full-viewport dialog overlay that contains the active media and controls.',
  },
  {
    name: 'Media',
    required: true,
    description: 'Active image or video presented inside the viewer.',
  },
  {
    name: 'Close button',
    required: true,
    description: 'Button that closes the viewer.',
  },
  {
    name: 'Previous button',
    required: false,
    description: 'Gallery button that moves to the previous media item.',
  },
  {
    name: 'Next button',
    required: false,
    description: 'Gallery button that moves to the next media item.',
  },
  {
    name: 'Caption',
    required: false,
    description: 'Caller-provided caption displayed below the active media.',
  },
  {
    name: 'Counter',
    required: false,
    description: 'Current position and total shown in gallery mode.',
  },
];

/** @type {import('@astryxdesign/cli/authoring').ComponentDoc} */

export const docs = {
  name: 'Lightbox',
  displayName: 'Lightbox',
  category: 'Overlay',
  keywords: [
    'lightbox',
    'image',
    'video',
    'viewer',
    'gallery',
    'zoom',
    'fullscreen',
    'media',
    'photo',
    'preview',
  ],
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
      description:
        'Callback when the lightbox open state changes: the Close button, Escape, a tap beside the media, dragging a photo down from its fitted size (with a finger, a mouse, a pen or a trackpad), or pinching it in from there (or a ctrl-wheel out).',
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
      description:
        "Media to display. Pass a single object for one item, or an array for gallery mode with prev/next navigation (a swipe, a mouse drag or a trackpad's sideways scroll moves between items too). Each item is {src: string, alt: string, caption?: ReactNode, type?: 'image' | 'video'}; type defaults to 'image', and zoom/pan is disabled for 'video'.",
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
      description:
        'Callback when the gallery index changes: prev/next, the arrow keys, or a swipe.',
    },
    {
      name: 'hasZoom',
      type: 'boolean',
      description:
        'Enable zoom (images only): pinch (or ctrl-wheel), or double-tap or double-click to zoom in at that point and back; Enter/Space/+/- zoom 2× about the centre and back. When zoomed, drag or scroll to pan, with momentum, or use arrow keys. A tap or a click on the photo hides the controls and turns the background black (so does a zoom in by a finger or a pointer); the next tap or click, a return to the fitted size, or a keyboard focus on a control brings them back. A pinch in from the fitted size shrinks the photo, and closes the viewer once it goes below about 93.5 % (into its thumbnail when experimental gives one) unless it is opened again by 5 % before the lift.',
      default: 'false',
    },
    {
      name: 'defaultIndex',
      type: 'number',
      description:
        'Initial image index in gallery mode for uncontrolled usage.',
      default: '0',
    },
    {
      name: 'hasAutoPlay',
      type: 'boolean',
      description:
        'Automatically start video playback when a video media item is shown.',
      default: 'false',
    },
    {
      name: 'experimental',
      type: '{sourceFor?: (index: number) => HTMLElement | null}',
      stability: 'experimental',
      description:
        "Experimental options: anything in this object may change or be removed in a patch release. sourceFor: The element an item opens from and closes into, usually its thumbnail: on a touch screen the photo zooms out of it on open and back into it on close (for the item showing then), and a photo dragged down lands in it; a tap or a drag that lands while the photo zooms open is held, so it neither closes the viewer nor reaches the page, while keys and screen readers stay live. With a mouse the viewer opens and closes at once, as before. Return null when there is none or it is off screen. Without it, on a touch screen the element that opened the viewer is the opened item's source when it shows a picture. Without experimental, the viewer opens and closes plainly. Proposed; pending owner review.",
    },
    {
      name: 'xstyle',
      type: 'StyleXStyles',
      description:
        'StyleX styles for layout customization. Must be stylex.create() value.',
    },
  ],
  theming: {
    targets: [{className: 'astryx-lightbox', visualProps: []}],
  },
  usage: {
    anatomy,
    description:
      'A fullscreen overlay for viewing images and videos at full resolution. Supports single-item and gallery modes with prev/next navigation and swiping, optional zoom and pan for images, and native video controls.',
    bestPractices: [
      {
        guidance: true,
        description:
          'Always provide alt text for every image for screen reader accessibility.',
      },
      {
        guidance: true,
        description:
          'Use gallery mode with onIndexChange for multi-image sets.',
      },
      {
        guidance: true,
        description:
          'Enable hasZoom only when viewing high-resolution images that benefit from close inspection.',
      },
      {
        guidance: false,
        description:
          'Use the lightbox for non-image content; it is specialized for images.',
      },
      {
        guidance: false,
        description:
          'Nest interactive content inside captions; keep them plain text.',
      },
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
        src: '/template-assets/light-scene-horizontal-1.png',
        alt: 'Coastal shoreline with ocean waves',
        caption:
          'A scenic coastline with waves rolling onto a sandy beach beneath a clear sky.',
      },
    },
  },
};

/** @type {import('@astryxdesign/cli/authoring').ComponentDoc} */
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
      description:
        '灯箱打开状态变化时的回调：关闭按钮、Esc 键、点按媒体旁空白处、从适合大小向下拖动照片（手指、鼠标、触控笔或触控板均可），或从适合大小向内捏合照片（或按住 Ctrl 向外滚动滚轮）。',
      required: true,
    },
    {
      name: 'media',
      type: 'LightboxMedia | LightboxMedia[]',
      description:
        "要显示的媒体。传入单个对象或数组（用于画廊模式的上一张/下一张导航；滑动、鼠标拖动或触控板横向滚动也可在各项之间切换）。每项为 {src, alt, caption?, type?: 'image' | 'video'}；type 默认为 'image'，'video' 禁用缩放/平移。",
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
      description:
        '启用缩放（仅图片）：双指捏合（或按住 Ctrl 滚动滚轮），或双点按、双击在该处放大并还原；Enter/Space/+/- 键以中心放大 2 倍并还原。缩放后可拖动或滚动平移（带惯性），或用方向键平移。点按或单击照片会隐藏控件并使背景变黑（手指或指针放大时也是如此）；再次点按或单击、还原到适合大小或用键盘聚焦控件会让控件重新出现。从适合大小双指向内捏合会缩小照片；一旦小于约 93.5%，除非松开前又张开 5%，查看器就会关闭（experimental 提供缩略图时缩回其中）。',
      default: 'false',
    },
    {
      name: 'experimental',
      type: '{sourceFor?: (index: number) => HTMLElement | null}',
      stability: 'experimental',
      description:
        '实验性选项：此对象中的任何内容都可能在补丁版本中更改或移除。sourceFor：某一项打开时放大自、关闭时缩回的元素（通常是其缩略图），仅在触屏上；向下拖动的照片也会落入其中。照片放大打开期间，落下的点按或拖动会被拦截，既不会关闭查看器，也不会触及页面；键盘和读屏软件不受影响。使用鼠标时，查看器照常立即打开和关闭。没有或不在屏幕上时返回 null。未提供时，在触屏上，若打开查看器的元素显示图片，则它是所打开项的来源。不传 experimental 时，查看器照常打开和关闭。',
    },
    {
      name: 'xstyle',
      type: 'StyleXStyles',
      description:
        '用于布局自定义的 StyleX 样式。必须是 stylex.create() 的值。',
    },
  ],
  theming: {
    targets: [{className: 'astryx-lightbox', visualProps: []}],
  },
  usage: {
    anatomy,
    description:
      'A fullscreen overlay for viewing images and videos at full resolution. Supports single-item and gallery modes with prev/next navigation and swiping, optional zoom and pan for images, and native video controls.',
    bestPractices: [
      {
        guidance: true,
        description:
          'Always provide alt text for every image for screen reader accessibility.',
      },
      {
        guidance: true,
        description:
          'Use gallery mode with onIndexChange for multi-image sets.',
      },
      {
        guidance: true,
        description:
          'Enable hasZoom only when viewing high-resolution images that benefit from close inspection.',
      },
      {
        guidance: false,
        description:
          'Use the lightbox for non-image content; it is specialized for images.',
      },
      {
        guidance: false,
        description:
          'Nest interactive content inside captions; keep them plain text.',
      },
    ],
  },
};

/** @type {import('@astryxdesign/cli/authoring').ComponentTranslationDoc} */
export const docsDense = {
  description:
    'Fullscreen overlay for viewing images and videos at full resolution with gallery navigation and zoom.',
  usage: {
    anatomy,
    description:
      'A fullscreen overlay for viewing images and videos at full resolution. Supports single-item and gallery modes with prev/next navigation and swiping, optional zoom and pan for images, and native video controls.',
    bestPractices: [
      {guidance: true, description: 'Always provide alt text for every image.'},
      {
        guidance: true,
        description:
          'Use gallery mode with onIndexChange for multi-image sets.',
      },
      {
        guidance: true,
        description:
          'Enable hasZoom only when viewing high-resolution images that benefit from close inspection.',
      },
      {
        guidance: false,
        description: 'Use for non-image content; specialized for images.',
      },
      {
        guidance: false,
        description:
          'Nest interactive content inside captions; keep them plain text.',
      },
    ],
  },
  propDescriptions: {
    isOpen: 'Whether the lightbox is open.',
    onOpenChange:
      'Callback when open state changes (including a photo dragged down or pinched in).',
    media: 'Single media object or array for gallery mode.',
    index: 'Current index in gallery mode.',
    onIndexChange:
      'Callback when gallery index changes (buttons, keys or a swipe).',
    hasZoom:
      'Enable zoom (pinch or ctrl-wheel, double-tap or double-click, Enter/Space, or +/-) and pan (drag, scroll or arrow keys) for images; a tap or click on the photo hides the controls, and a pinch in closes the viewer.',
    experimental:
      'Experimental options, which may change in a patch release: sourceFor, the element an item zooms out of on open and back into on close on a touch screen (its thumbnail).',
    xstyle: 'StyleX styles for layout customization.',
  },
};
