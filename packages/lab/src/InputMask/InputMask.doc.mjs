// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @type {import('@astryxdesign/cli/authoring').ComponentDoc} */
export const docs = {
  name: 'InputMask',
  displayName: 'Input Mask',
  category: 'Data Input',
  keywords: [
    'mask',
    'masked',
    'input',
    'phone',
    'zip',
    'postal',
    'ssn',
    'credit card',
    'format',
    'pattern',
    'digits',
  ],
  props: [
    {
      name: 'mask',
      type: '{pattern: string, placeholder?: string}',
      description:
        "The mask to apply: a pattern where `#` marks a digit slot and every other character is inserted literally (e.g. {pattern: '###-##-####'}). placeholder sets the ghost character for unfilled slots.",
      required: true,
    },
    {
      name: 'label',
      type: 'string',
      description:
        'Label text for the input. Always rendered for accessibility.',
      required: true,
    },
    {
      name: 'value',
      type: 'string',
      description:
        "The current value as raw digits only, no literal characters — '5551234567', never '(555) 123-4567'. The component renders the formatted view. Omit to leave the component uncontrolled.",
    },
    {
      name: 'defaultValue',
      type: 'string',
      description:
        'Initial raw digits for uncontrolled use, read once on mount. When value is provided the component is controlled and this prop is ignored.',
    },
    {
      name: 'onChange',
      type: '(value: string, e: ChangeEvent<HTMLInputElement>) => void',
      description:
        'Fired when the digits change. Receives raw digits, not the formatted display value. Rejected keystrokes (letters, overflow) do not fire it.',
    },
    {
      name: 'changeAction',
      type: '(value: string, e: ChangeEvent<HTMLInputElement>) => void | Promise<void>',
      description:
        'Async action after onChange (if not prevented). Shows the typed value optimistically with a spinner while pending; a rejected action settles, reverts the optimistic value, and is reported via devError.',
    },
    {
      name: 'formatHint',
      type: 'string | false',
      description:
        "Screen-reader hint describing the expected format, wired into aria-describedby. Defaults to an auto-generated example like 'Format: (555) 555-5555'; pass a string to replace it or false to omit it.",
    },
    {
      name: 'autoComplete',
      type: 'string',
      description:
        "Autocomplete attribute for the input. Defaults to 'off' so browser autofill does not fight the mask; pass e.g. 'tel-national' or 'postal-code' where autofill genuinely helps.",
    },
    {
      name: 'isLabelHidden',
      type: 'boolean',
      description: 'Visually hides the label; keeps screen reader access.',
      default: 'false',
    },
    {
      name: 'description',
      type: 'string',
      description: 'Description text between the label and input.',
    },
    {
      name: 'isOptional',
      type: 'boolean',
      description:
        'Shows an "Optional" indicator. Mutually exclusive with isRequired.',
      default: 'false',
    },
    {
      name: 'isRequired',
      type: 'boolean',
      description:
        'Shows a "Required" indicator and sets aria-required. Mutually exclusive with isOptional.',
      default: 'false',
    },
    {
      name: 'isDisabled',
      type: 'boolean',
      description: 'Disables the input.',
      default: 'false',
    },
    {
      name: 'isReadOnly',
      type: 'boolean',
      description:
        'Read-only: the formatted value stays visible and submits, but cannot be edited.',
      default: 'false',
    },
    {
      name: 'disabledMessage',
      type: 'string',
      description:
        'Explains why the input is disabled. With isDisabled, shows a tooltip on hover/focus and keeps the input focusable via aria-disabled.',
    },
    {
      name: 'status',
      type: "{type: 'error' | 'warning' | 'success', message?: string}",
      description:
        'Validation status: colored border and icon. Error sets aria-invalid; the message is announced via aria-describedby.',
    },
    {
      name: 'statusVariant',
      type: "'attached' | 'detached' | 'tooltip'",
      description: 'How the status message is placed relative to the input.',
      default: "'attached'",
    },
    {
      name: 'size',
      type: "'sm' | 'md' | 'lg'",
      description: 'Size variant of the input.',
      default: "'md'",
    },
    {
      name: 'isLoading',
      type: 'boolean',
      description: 'Loading state with spinner and aria-busy.',
      default: 'false',
    },
    {
      name: 'width',
      type: 'number | string',
      description:
        'Width of the whole field (label, control, status stay aligned).',
    },
    {
      name: 'labelTooltip',
      type: 'string',
      description: 'Tooltip text in an info icon at the end of the label.',
    },
    {
      name: 'hasClear',
      type: 'boolean',
      description:
        'Shows a clear button when a value is set; clears to an empty string and refocuses the input.',
      default: 'false',
    },
    {
      name: 'hasAutoFocus',
      type: 'boolean',
      description: 'Autofocuses the input on mount.',
      default: 'false',
    },
    {
      name: 'htmlName',
      type: 'string',
      description:
        'HTML name attribute for form submission. Note: the submitted value is the formatted display string.',
    },
    {
      name: 'onEnter',
      type: '() => void',
      description: 'Fired when the user presses Enter.',
    },
    {
      name: 'onKeyDown',
      type: '(e: KeyboardEvent<HTMLInputElement>) => void',
      description: 'Fired on keydown events on the input.',
    },
  ],
  usage: {
    description:
      'A masked text input for values with a fixed shape — phone numbers, ZIP codes, SSNs, card numbers — expressed as a `#`-digit pattern. It constrains entry in real time — digits format as they are typed, literal characters (dashes, parens, spaces) insert themselves, and the remaining shape stays visible as a dimmed ghost after the caret. The caret behaves like a plain input: mid-value edits, backspacing through literals, and messy pastes all land in the right slot. The value contract is raw digits in, raw digits out; the component owns formatting. The expected format is announced to assistive technology via an auto-generated aria-describedby hint, and there is no placeholder prop — the ghost is the placeholder.',
    bestPractices: [
      {
        guidance: true,
        description:
          'Store and submit the raw digits your onChange receives; format at the edges. The mask can change later without invalidating stored values.',
      },
      {
        guidance: true,
        description:
          'Keep the auto format hint unless the description already states the format; screen reader users hear the expected shape before typing.',
      },
      {
        guidance: true,
        description:
          'Express any fixed shape as a {pattern} — ZIP+4, serial numbers, sort codes — and share recurring patterns as app-level constants.',
      },
      {
        guidance: false,
        description:
          'Use InputMask for variable-length values — currency amounts, international phone numbers, or Amex-style cards. Patterns are fixed-length; use TextInput or NumberInput with validation instead.',
      },
      {
        guidance: false,
        description:
          'Reformat TextInput values in onChange by hand; without caret management the cursor jumps to the end on every mid-value edit. That failure mode is why this component exists.',
      },
    ],
  },
  theming: {
    targets: [
      {
        className: 'astryx-input-mask',
        visualProps: [],
      },
    ],
  },
};

/** @type {import('@astryxdesign/cli/authoring').ComponentDoc} */
export const docsZh = {
  name: 'InputMask',
  displayName: 'Input Mask',
  props: [
    {
      name: 'mask',
      type: '{pattern: string, placeholder?: string}',
      description: '要应用的掩码模式：`#` 表示数字位，其余字符按字面插入。',
      required: true,
    },
    {
      name: 'label',
      type: 'string',
      description: '输入框的标签文本。始终渲染以保证无障碍访问。',
      required: true,
    },
    {
      name: 'value',
      type: 'string',
      description:
        "当前值，仅包含原始数字（不含字面字符）——如 '5551234567'，而非 '(555) 123-4567'。省略则为非受控模式。",
    },
    {
      name: 'defaultValue',
      type: 'string',
      description:
        '非受控模式的初始原始数字，仅在挂载时读取一次；提供 value 时组件为受控，此项被忽略。',
    },
    {
      name: 'onChange',
      type: '(value: string, e: ChangeEvent<HTMLInputElement>) => void',
      description: '数字变化时触发。参数为原始数字，而非格式化后的显示值。',
    },
    {
      name: 'changeAction',
      type: '(value: string, e: ChangeEvent<HTMLInputElement>) => void | Promise<void>',
      description:
        'onChange 之后的异步操作。等待期间乐观显示输入值并展示加载图标；操作被拒绝时会恢复并通过 devError 报告。',
    },
    {
      name: 'formatHint',
      type: 'string | false',
      description:
        '向屏幕阅读器描述期望格式的提示，接入 aria-describedby。默认自动生成示例；传入字符串可替换，传入 false 可省略。',
    },
    {
      name: 'hasClear',
      type: 'boolean',
      description: '有值时显示清除按钮；点击后清空并让输入框重新获得焦点。',
      default: 'false',
    },
    {
      name: 'status',
      type: "{type: 'error' | 'warning' | 'success', message?: string}",
      description: '校验状态：彩色边框与图标。error 会设置 aria-invalid。',
    },
    {
      name: 'size',
      type: "'sm' | 'md' | 'lg'",
      description: '输入框尺寸。',
      default: "'md'",
    },
  ],
  usage: {
    description:
      'A masked text input for values with a fixed shape — phone numbers, ZIP codes, SSNs, card numbers — expressed as a `#`-digit pattern. Digits format as they are typed; literals insert themselves; the remaining shape stays visible as a ghost. Raw digits in, raw digits out.',
    bestPractices: [
      {
        guidance: true,
        description:
          'Store and submit the raw digits your onChange receives; format at the edges.',
      },
      {
        guidance: false,
        description:
          'Use InputMask for variable-length values; patterns are fixed-length.',
      },
    ],
  },
};

/** @type {import('@astryxdesign/cli/authoring').ComponentTranslationDoc} */
export const docsDense = {
  description:
    'Masked text input for fixed-shape values: formats digits while typing through a `#` pattern (phone, ZIP, SSN, card, …); raw digits in and out.',
  usage: {
    description:
      'Real-time input constraint: digits format as typed, literals (dashes, parens) auto-insert, remaining shape shows as an aria-hidden ghost after the caret. Caret survives mid-value edits, backspace-through-literals, and messy pastes. value/onChange carry raw digits only; the component owns formatting. Format announced via auto aria-describedby hint. No placeholder prop — the ghost is the placeholder.',
    bestPractices: [
      {guidance: true, description: 'Store raw digits; format at the edges.'},
      {
        guidance: true,
        description: 'Keep the auto format hint for screen reader users.',
      },
      {
        guidance: false,
        description:
          'Use for variable-length values (currency, intl phone, Amex); patterns are fixed-length.',
      },
      {
        guidance: false,
        description:
          'Hand-reformat TextInput in onChange; the caret jumps without mask-aware repositioning.',
      },
    ],
  },
  propDescriptions: {
    mask: '{pattern, placeholder?} where # = digit slot, rest literal.',
    label: 'Label text; always rendered for a11y.',
    value:
      "Raw digits only ('5551234567'), never formatted; omit for uncontrolled.",
    defaultValue: 'Initial raw digits for uncontrolled use; value wins.',
    onChange:
      'Fires with raw digits when they change; rejected keystrokes do not fire.',
    changeAction:
      'Async action after onChange; optimistic + spinner while pending; rejection settles, reverts, reports via devError.',
    formatHint:
      "Auto 'Format: (555) 555-5555' describedby hint; string replaces, false omits.",
    autoComplete: "Autocomplete attribute; default 'off'.",
    hasClear: 'Clear button when value set; clears and refocuses.',
    status:
      'Validation status; error sets aria-invalid; message joins aria-describedby.',
    size: "Input size 'sm'|'md'|'lg'.",
  },
};
