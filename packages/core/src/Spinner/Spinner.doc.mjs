/** @type {import('../docs-types').ComponentDoc} */

export const docs = {
  name: 'Spinner',
  keywords: ["spinner","loader","loading","circular","progress","spin","activity","busy","indeterminate"],
  props: [
    {
      name: 'size',
      type: "'sm' | 'md' | 'lg' | 'xl'",
      description: 'Spinner size (10px, 14px, 18px, 28px).',
      default: "'md'",
    },
    {
      name: 'shade',
      type: "'default' | 'onMedia' | 'subtle'",
      description: 'Color shade: default for light backgrounds, onMedia for dark/accent backgrounds, subtle for inline use in lists.',
      default: "'default'",
    },
    {
      name: 'label',
      type: 'ReactNode',
      description:
        'Visible content below the spinner. String labels auto-set aria-label.',
    },
    {
      name: 'aria-label',
      type: 'string',
      description:
        'Accessible name for screen readers. Defaults to label (if string) or "Loading".',
      default: "'Loading'",
    },
  ],
  theming: {
    targets: [
      {className: 'xds-spinner', visualProps: ['size', 'shade']},
    ],
  },
  usage: {
    description:
      'An animated loading indicator for indeterminate wait states. Use Spinner to signal ongoing processes with unknown duration, such as data fetching or form submission. For loading content of known dimensions, use Skeleton instead.',
    bestPractices: [
      {guidance: true, description: 'Provide a meaningful label to describe what is loading for screen reader users.'},
      {guidance: true, description: 'Choose the appropriate shade — use "onMedia" on dark or accent-colored backgrounds, and "subtle" for inline indicators in lists or text.'},
      {guidance: false, description: 'Use for content areas with known dimensions — use Skeleton to preserve layout instead.'},
      {guidance: false, description: 'Stack multiple Spinners in the same view — use one to represent the overall loading state.'},
    ],
  },
};

/** @type {import('../docs-types').ComponentDoc} */
export const docsZh = {
  name: 'Spinner',
  props: [
    {
      name: 'size',
      type: "'sm' | 'md' | 'lg' | 'xl'",
      description: '旋转器尺寸（10px、14px、18px、28px）。',
      default: "'md'",
    },
    {
      name: 'shade',
      type: "'default' | 'onMedia' | 'subtle'",
      description: '颜色色调：default 用于浅色背景，onMedia 用于深色/强调色背景，subtle 用于列表中的内联使用。',
      default: "'default'",
    },
    {
      name: 'label',
      type: 'ReactNode',
      description: '旋转器下方的可见内容。字符串标签自动设置 aria-label。',
    },
    {
      name: 'aria-label',
      type: 'string',
      description: '屏幕阅读器的无障碍名称。默认为 label（如果是字符串）或 "Loading"。',
      default: "'Loading'",
    },
  ],
  theming: {
    targets: [
      {className: 'xds-spinner', visualProps: ['size', 'shade']},
    ],
  },
  usage: {
    description:
      'An animated loading indicator for indeterminate wait states. Use Spinner to signal ongoing processes with unknown duration, such as data fetching or form submission. For loading content of known dimensions, use Skeleton instead.',
    bestPractices: [
      {guidance: true, description: 'Provide a meaningful label to describe what is loading for screen reader users.'},
      {guidance: true, description: 'Choose the appropriate shade — use "onMedia" on dark or accent-colored backgrounds, and "subtle" for inline indicators in lists or text.'},
      {guidance: false, description: 'Use for content areas with known dimensions — use Skeleton to preserve layout instead.'},
      {guidance: false, description: 'Stack multiple Spinners in the same view — use one to represent the overall loading state.'},
    ],
  },
};

/** @type {import('../docs-types').TranslationDoc} */
export const docsDense = {
  usage: {
    description:
      'An animated loading indicator for indeterminate wait states. Use Spinner to signal ongoing processes with unknown duration, such as data fetching or form submission. For loading content of known dimensions, use Skeleton instead.',
    bestPractices: [
      {guidance: true, description: 'Provide a meaningful label to describe what is loading for screen reader users.'},
      {guidance: true, description: 'Choose the appropriate shade — use "onMedia" on dark or accent-colored backgrounds, and "subtle" for inline indicators in lists or text.'},
      {guidance: false, description: 'Use for content areas with known dimensions — use Skeleton to preserve layout instead.'},
      {guidance: false, description: 'Stack multiple Spinners in the same view — use one to represent the overall loading state.'},
    ],
  },
  propDescriptions: {
    size: 'Spinner size (10px, 14px, 18px, 28px).',
    shade: 'Color shade: default for light backgrounds, onMedia for dark/accent, subtle for inline use.',
    label: 'Visible content below spinner. String auto-sets aria-label.',
    'aria-label': 'A11y name for screen readers. Defaults to label or "Loading".',
  },
};
