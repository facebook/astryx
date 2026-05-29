// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @type {import('../docs-types').ComponentDoc} */

export const docs = {
  name: 'FileInput',
  displayName: 'File Input',
  category: 'Inputs',
  keywords: ["fileinput","file","upload","drag","drop","dropzone","attachment","browse"],
  props: [
    {
      name: 'label',
      type: 'string',
      description:
        'Accessible label for the file input.',
      required: true,
    },
    {
      name: 'value',
      type: 'File | File[] | null',
      description: 'Currently selected file(s). Controlled component.',
      required: true,
    },
    {
      name: 'onChange',
      type: '(files: File | File[] | null) => void',
      description: 'Callback fired when files are selected or removed.',
      required: true,
    },
    {
      name: 'changeAction',
      type: '(files: File | File[] | null) => Promise<void>',
      description:
        'Async change action (React 19 transitions pattern). Use for immediate upload on file selection.',
    },
    {
      name: 'accept',
      type: 'string',
      description:
        'Accepted file types. Uses the HTML accept attribute format (e.g. "image/*", ".pdf,.doc").',
    },
    {
      name: 'isMultiple',
      type: 'boolean',
      description: 'Whether multiple files can be selected. When true, value and onChange use File[] instead of File.',
      default: 'false',
    },
    {
      name: 'maxSize',
      type: 'number',
      description: 'Maximum file size in bytes. Files exceeding this are rejected with an error status.',
    },
    {
      name: 'maxFiles',
      type: 'number',
      description: 'Maximum number of files (only applies when isMultiple is true).',
    },
    {
      name: 'isLabelHidden',
      type: 'boolean',
      description:
        'Visually hides the label while keeping it accessible to screen readers.',
      default: 'false',
    },
    {
      name: 'description',
      type: 'string',
      description: 'Description text displayed between the label and input.',
    },
    {
      name: 'isOptional',
      type: 'boolean',
      description:
        'Displays an "Optional" indicator next to the label. Mutually exclusive with isRequired.',
      default: 'false',
    },
    {
      name: 'isRequired',
      type: 'boolean',
      description:
        'Displays a "Required" indicator next to the label and sets aria-required. Mutually exclusive with isOptional.',
      default: 'false',
    },
    {
      name: 'isDisabled',
      type: 'boolean',
      description:
        'Disables the input, preventing interaction and dimming the element.',
      default: 'false',
    },
    {
      name: 'isLoading',
      type: 'boolean',
      description:
        'Puts the input in a loading state, showing a spinner and setting aria-busy.',
      default: 'false',
    },
    {
      name: 'placeholder',
      type: 'string',
      description: 'Placeholder text shown when no file is selected.',
      default: '"Choose file" or "Choose files"',
    },
    {
      name: 'mode',
      type: "'input' | 'dropzone'",
      description: "Visual mode. 'input' is a compact inline style; 'dropzone' is a larger area with drag-and-drop support.",
      default: "'input'",
    },
    {
      name: 'status',
      type: "{type: 'error' | 'warning' | 'success', message?: string}",
      description:
        'Validation status — applies a colored border. If message is provided, displays a floating message below the input. Error type also sets aria-invalid.',
    },
    {
      name: 'labelTooltip',
      type: 'string',
      description:
        'Tooltip text displayed in an info icon at the end of the label.',
    },
  ],
  theming: {
    targets: [
      {className: 'xds-file-input', visualProps: ['mode', 'status']},
    ],
  },
  usage: {
    description:
      'FileInput provides file upload with optional drag-and-drop support. Use it for single or multiple file selection with built-in validation for file type, size, and count. Pair with validation status for upload feedback.',
    bestPractices: [
      {guidance: true, description: 'Always specify an accept prop to guide users toward valid file types.'},
      {guidance: true, description: 'Use maxSize and maxFiles to prevent oversized uploads — the component handles validation and error display automatically.'},
      {guidance: true, description: 'Add a description to communicate constraints like file size limits or accepted formats.'},
      {guidance: true, description: 'Use changeAction for immediate upload workflows that benefit from optimistic UI.'},
      {guidance: false, description: "Don't use FileInput for directory or folder uploads — that is not supported in v1."},
      {guidance: false, description: "Don't avoid dropzone mode unless space is very constrained — drag-and-drop is the expected interaction for file uploads."},
    ],
    anatomy: [
      {name: 'Label', required: true, description: 'Text that identifies the field. Always rendered for accessibility even when visually hidden.'},
      {name: 'Description', required: false, description: 'Helper text between the label and the drop zone explaining accepted formats or size limits.'},
      {name: 'Drop zone', required: true, description: 'The clickable area for file selection. In dropzone mode, also accepts dragged files.'},
      {name: 'Upload icon', required: false, description: 'An arrow icon in the drop zone hinting at the upload action.'},
      {name: 'Placeholder', required: false, description: 'Hint text shown when no files are selected.'},
      {name: 'File name display', required: false, description: 'Shows the name(s) of selected files.'},
      {name: 'Clear button', required: false, description: 'A close button that removes selected files and returns focus to the input.'},
      {name: 'Spinner', required: false, description: 'Loading indicator that appears during async upload actions.'},
      {name: 'Status message', required: false, description: 'Validation feedback showing error, warning, or success with a message.'},
    ],
  },
};

/** @type {import('../docs-types').ComponentDoc} */
export const docsZh = {
  name: 'FileInput',
  displayName: 'File Input',
  props: [
    {
      name: 'label',
      type: 'string',
      description: '文件输入框的无障碍标签。',
      required: true,
    },
    {
      name: 'value',
      type: 'File | File[] | null',
      description: '当前选中的文件。受控组件。',
      required: true,
    },
    {
      name: 'onChange',
      type: '(files: File | File[] | null) => void',
      description: '文件选择或移除时触发的回调。',
      required: true,
    },
    {
      name: 'accept',
      type: 'string',
      description: '接受的文件类型。使用 HTML accept 属性格式。',
    },
    {
      name: 'isMultiple',
      type: 'boolean',
      description: '是否可以选择多个文件。',
      default: 'false',
    },
    {
      name: 'maxSize',
      type: 'number',
      description: '最大文件大小（字节）。超过此限制的文件将被拒绝。',
    },
    {
      name: 'maxFiles',
      type: 'number',
      description: '最大文件数（仅在 isMultiple 为 true 时适用）。',
    },
    {
      name: 'isLabelHidden',
      type: 'boolean',
      description: '视觉上隐藏标签，保持屏幕阅读器可访问。',
      default: 'false',
    },
    {
      name: 'description',
      type: 'string',
      description: '显示在标签和输入框之间的描述文本。',
    },
    {
      name: 'isDisabled',
      type: 'boolean',
      description: '禁用输入框，阻止交互并使元素变暗。',
      default: 'false',
    },
    {
      name: 'isLoading',
      type: 'boolean',
      description: '加载状态，显示旋转器并设置 aria-busy。',
      default: 'false',
    },
    {
      name: 'placeholder',
      type: 'string',
      description: '未选择文件时显示的占位符文本。',
    },
    {
      name: 'mode',
      type: "'input' | 'dropzone'",
      description: "视觉模式。'input' 为紧凑内联样式；'dropzone' 为支持拖放的较大区域。",
      default: "'input'",
    },
    {
      name: 'status',
      type: "{type: 'error' | 'warning' | 'success', message?: string}",
      description: '验证状态。',
    },
  ],
  theming: {
    targets: [
      {className: 'xds-file-input', visualProps: ['mode', 'status']},
    ],
  },
  usage: {
    description:
      'FileInput provides file upload with optional drag-and-drop support. Use it for single or multiple file selection with built-in validation for file type, size, and count. Pair with validation status for upload feedback.',
    bestPractices: [
      {guidance: true, description: 'Always specify an accept prop to guide users toward valid file types.'},
      {guidance: true, description: 'Use maxSize and maxFiles to prevent oversized uploads.'},
      {guidance: true, description: 'Add a description to communicate constraints.'},
      {guidance: false, description: "Don't use FileInput for directory uploads."},
      {guidance: false, description: "Don't use mode='input' unless space is very constrained — dropzone mode provides a better experience."},
    ],
    anatomy: [
      {name: 'Label', required: true, description: 'Text identifying the field.'},
      {name: 'Drop zone', required: true, description: 'Clickable area for file selection.'},
      {name: 'Placeholder', required: false, description: 'Hint text when no files selected.'},
      {name: 'File name display', required: false, description: 'Shows selected file names.'},
      {name: 'Clear button', required: false, description: 'Removes selected files.'},
    ],
  },
};

/** @type {import('../docs-types').TranslationDoc} */
export const docsDense = {
  description: 'File input w/ input/dropzone modes, validation, label, description, status.',
  usage: {
    description:
      'FileInput provides file upload with optional drag-and-drop support. Use it for single or multiple file selection with built-in validation for file type, size, and count.',
    bestPractices: [
      {guidance: true, description: 'Always specify an accept prop to guide users toward valid file types.'},
      {guidance: true, description: 'Use maxSize and maxFiles to prevent oversized uploads.'},
      {guidance: true, description: 'Add a description to communicate constraints.'},
      {guidance: false, description: "Don't use FileInput for directory uploads."},
      {guidance: false, description: "Don't use mode='input' unless space is very constrained — dropzone mode provides a better experience."},
    ],
    anatomy: [
      {name: 'Label', required: true, description: 'Text identifying the field.'},
      {name: 'Drop zone', required: true, description: 'Clickable area for file selection.'},
      {name: 'Placeholder', required: false, description: 'Hint text when no files selected.'},
      {name: 'File name display', required: false, description: 'Shows selected file names.'},
      {name: 'Clear button', required: false, description: 'Removes selected files.'},
    ],
  },
  propDescriptions: {
    label: 'Accessible label for the file input.',
    value: 'Currently selected file(s). Controlled.',
    onChange: 'Fired when files are selected or removed.',
    changeAction: 'Async action after onChange. For immediate upload.',
    accept: 'Accepted file types (HTML accept format).',
    isMultiple: 'Allow multiple file selection.',
    maxSize: 'Max file size in bytes. Rejects oversized files.',
    maxFiles: 'Max file count (isMultiple only).',
    isLabelHidden: 'Visually hides label; keeps screen reader access.',
    description: 'Description text between label+input.',
    isOptional: 'Shows "Optional" indicator.',
    isRequired: 'Shows "Required" indicator+sets aria-required.',
    isDisabled: 'Disables input, prevents interaction.',
    isLoading: 'Loading state w/ spinner+aria-busy.',
    placeholder: 'Placeholder when no files selected.',
    mode: "Visual mode: 'input' (compact) or 'dropzone' (drag-and-drop).",
    status: 'Validation status; colored border. Message floats below.',
    labelTooltip: 'Tooltip in info icon at label end.',
  },
};
