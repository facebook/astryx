/** @type {import('../docs-types').ComponentDoc} */

export const docs = {
  name: 'Thumbnail',
  description:
    'A square preview card for image attachments. Shows a skeleton shimmer while uploading, the image on success, or a placeholder icon when no source is provided.',
  showcase: {
    aspectRatio: 1,
    code: '<XDSThumbnail src="https://via.placeholder.com/80" alt="Preview" />',
  },
  keywords: ["thumbnail","attachment","preview","image","upload","dismiss","remove","loading"],
  features: [
    'Square 1:1 aspect ratio via CSS aspect-ratio',
    'Skeleton shimmer during upload (isLoading)',
    'Upload overlay with spinner when isLoading + src',
    'Image preview with object-fit: cover',
    'APCA-based luminance detection for adaptive remove button contrast',
    'Concentric radius: button radius derived from container radius minus inset',
    'Hover shadow on interactive thumbnails (onClick)',
    'Label shown as tooltip on hover, used as aria-label',
    'Placeholder icon when no src',
    'Disabled state blocks all interactions and reduces opacity',
  ],
  props: [
    {
      name: 'src',
      type: 'string',
      description: 'Image source URL.',
    },
    {
      name: 'alt',
      type: 'string',
      description: 'Alt text for the image.',
    },
    {
      name: 'label',
      type: 'string',
      description: 'Accessible label (e.g. file name). Shown as tooltip on hover.',
    },
    {
      name: 'onRemove',
      type: '(e: React.MouseEvent) => void',
      description: 'Callback for the overlaid remove button.',
    },
    {
      name: 'onClick',
      type: '(e: React.MouseEvent) => void',
      description: 'Click handler. Adds button semantics and hover shadow.',
    },
    {
      name: 'isLoading',
      type: 'boolean',
      description: 'Shows skeleton (no src) or upload overlay (with src).',
      default: 'false',
    },
    {
      name: 'isDisabled',
      type: 'boolean',
      description: 'Whether the thumbnail is disabled.',
      default: 'false',
    },
    {
      name: 'xstyle',
      type: 'StyleXStyles',
      description: 'StyleX styles for layout customization (margins, positioning, sizing). Must be a stylex.create() value — not an inline style object like style={{}}.',
    },
    {
      name: 'className',
      type: 'string',
      description: 'CSS class name for the root element. Prefer xstyle for styling — className is provided for integration with non-StyleX systems.',
    },
    {
      name: 'style',
      type: 'CSSProperties',
      description: 'Inline styles for the root element. Prefer xstyle for styling — inline styles bypass StyleX optimization.',
    },
    {
      name: 'data-testid',
      type: 'string',
      description: 'Test selector for automated testing frameworks.',
    },
  ],  theming: {
    targets: [
      {className: 'xds-thumbnail'},
    ],
  },
  accessibility: [
    'label prop provides aria-label for the thumbnail and its remove button.',
    'onClick renders as a button for keyboard and screen reader access.',
    'Remove button uses aria-label derived from the label prop.',
  ],
};

/** @type {import('../docs-types').TranslationDoc} */
export const docsZh = {
  description:
    '图片附件的方形预览卡片。上传时显示骨架屏动画，成功时显示图片，无图片源时显示占位图标。',
  features: [
    '通过 CSS aspect-ratio 实现 1:1 正方形比例',
    '上传时骨架屏闪烁效果（isLoading）',
    'isLoading + src 时显示上传覆盖层和加载指示器',
    '通过 object-fit: cover 预览图片',
    '基于 APCA 亮度检测的自适应移除按钮对比度',
    '同心圆角：按钮圆角由容器圆角减去内边距推导',
    '可交互缩略图（onClick）的悬停阴影',
    '标签作为悬停提示工具和 aria-label 显示',
    '无 src 时显示占位图标',
    '禁用状态阻止所有交互并降低不透明度',
  ],
  propDescriptions: {
    src: '图片源 URL。',
    alt: '图片的替代文本。',
    label: '无障碍标签（如文件名）。悬停时以提示工具显示。',
    onRemove: '覆盖层移除按钮的回调。',
    onClick: '点击处理器。添加按钮语义和悬停阴影。',
    isLoading: '显示骨架屏（无 src）或上传覆盖层（有 src）。',
    isDisabled: '是否禁用缩略图。',
    xstyle: '用于布局自定义的 StyleX 样式。必须是 stylex.create() 的值，而非内联样式对象。',
    className: '根元素的 CSS 类名。建议使用 xstyle。',
    style: '根元素的内联样式。建议使用 xstyle。',
    'data-testid': '用于自动化测试框架的测试选择器。',
  },
  accessibility: [
    'label 属性为缩略图及其移除按钮提供 aria-label。',
    'onClick 渲染为按钮以支持键盘和屏幕阅读器访问。',
    '移除按钮使用从 label 属性推导的 aria-label。',
  ],
};

export const docsDense = {
  n: 'Thumbnail',
  d: 'Square preview card for image attachments. Skeleton shimmer on upload, image on success, placeholder when no src.',
  kw: ['thumbnail', 'attachment', 'preview', 'image', 'upload', 'dismiss', 'remove', 'loading'],
  f: [
    '1:1 aspect-ratio. Skeleton shimmer (isLoading). Upload overlay w/ spinner.',
    'APCA luminance for adaptive remove button contrast. Concentric radius.',
    'Hover shadow on onClick. Tooltip from label. Placeholder icon when no src.',
    'Disabled state blocks interactions, reduces opacity.',
  ],
  p: {
    src: 'Image source URL.',
    alt: 'Alt text for image.',
    label: 'Accessible label (file name). Tooltip on hover, aria-label.',
    onRemove: '(e) => void. Overlaid remove button callback.',
    onClick: '(e) => void. Adds button semantics + hover shadow.',
    isLoading: 'Skeleton (no src) or upload overlay (with src). Default: false.',
    isDisabled: 'Disabled state. Default: false.',
    xstyle: 'stylex.create() for layout.',
    className: 'CSS class. Prefer xstyle.',
    style: 'Inline styles. Prefer xstyle.',
    'data-testid': 'Test selector.',
  },
  ex: [
    '<XDSThumbnail src="/photo.jpg" alt="Vacation" label="vacation.jpg" onRemove={() => {}} />',
    '<XDSThumbnail src="/preview.png" alt="Preview" onClick={openLightbox} />',
  ],
};
