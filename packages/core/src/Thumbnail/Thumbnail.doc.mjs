/** @type {import('../docs-types').ComponentDoc} */

export const docs = {
  name: 'Thumbnail',
  keywords: ["thumbnail","attachment","preview","image","upload","dismiss","remove","loading"],
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
  usage: {
    description:
      'Thumbnail is a square preview card for image attachments, showing a loading skeleton during upload and the image on success. Use it to represent uploaded files, image previews, or media attachments in compact layouts.',
    bestPractices: [
      { guidance: true, description: 'Provide a descriptive label prop so the thumbnail and its remove button are accessible to screen readers.' },
      { guidance: true, description: 'Use the isLoading state to show upload progress rather than displaying a broken or missing image.' },
      { guidance: false, description: 'Use Thumbnail for non-image file types — use a file attachment component with an appropriate icon instead.' },
    ],
  },
};

/** @type {import('../docs-types').TranslationDoc} */
export const docsZh = {
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
  usage: {
    description:
      'Thumbnail is a square preview card for image attachments, showing a loading skeleton during upload and the image on success. Use it to represent uploaded files, image previews, or media attachments in compact layouts.',
    bestPractices: [
      { guidance: true, description: 'Provide a descriptive label prop so the thumbnail and its remove button are accessible to screen readers.' },
      { guidance: true, description: 'Use the isLoading state to show upload progress rather than displaying a broken or missing image.' },
      { guidance: false, description: 'Use Thumbnail for non-image file types — use a file attachment component with an appropriate icon instead.' },
    ],
  },
};

export const docsDense = {
  n: 'Thumbnail',
  d: 'Square preview card for image attachments. Skeleton shimmer on upload, image on success, placeholder when no src.',
  kw: ['thumbnail', 'attachment', 'preview', 'image', 'upload', 'dismiss', 'remove', 'loading'],
  usage: {
    description:
      'Thumbnail is a square preview card for image attachments, showing a loading skeleton during upload and the image on success. Use it to represent uploaded files, image previews, or media attachments in compact layouts.',
    bestPractices: [
      { guidance: true, description: 'Provide a descriptive label prop so the thumbnail and its remove button are accessible to screen readers.' },
      { guidance: true, description: 'Use the isLoading state to show upload progress rather than displaying a broken or missing image.' },
      { guidance: false, description: 'Use Thumbnail for non-image file types — use a file attachment component with an appropriate icon instead.' },
    ],
  },
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
