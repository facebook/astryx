/** @type {import('../docs-types').ComponentDoc} */

export const docs = {
  name: 'Badge',
  description:
    'A badge component for displaying status indicators, counts, or labels.',
  showcase: {
    aspectRatio: 1,
    code: '<XDSBadge label="New" />',
  },
  keywords: ["badge","tag","chip","label","status","indicator","count","counter","pill","notification","marker"],
  props: [
    {
      name: 'variant',
      type: "'neutral' | 'info' | 'success' | 'warning' | 'error' | 'blue' | 'cyan' | 'green' | 'orange' | 'pink' | 'purple' | 'red' | 'teal' | 'yellow'",
      description:
        'Visual style variant. Semantic variants (neutral, info, success, warning, error) use solid backgrounds. Non-semantic color variants use tinted backgrounds with colored text for categorization and tagging.',
      default: "'neutral'",
    },
    {
      name: 'label',
      type: 'ReactNode',
      description: 'Badge text content.',
    },
    {
      name: 'icon',
      type: 'ReactNode',
      description: 'Optional leading icon.',
    },
  ],
  theming: {
    targets: [
      {className: 'xds-badge', visualProps: ['variant']},
    ],
  },
  usage: {
    summary: 'Badges display system or categorical information, helping users quickly identify the state of a system, process, or entity, or group items into meaningful categories.',
    content: `## When to use

Badges provide users with clear information about the current or upcoming state of a system, process, or categorization, enabling users to take necessary actions.

There are two types of badges:

- **System status**: Indicate the current, dynamic state of a system, process, or entity. Use semantic colors to convey critical information (e.g., error, warning, success, or active states).
- **Categorical**: Group objects, processes, or entities into static categories. Use non-semantic colors to provide visual distinction without implying criticality.

## When NOT to use

- Don't use badges as filters. Use interactive filters or tabs instead.
- Don't use badges to highlight or draw attention to text. Use plain text for information that doesn't require scanning.

## Best practices

### Color usage

- Do: Use semantic (system status) colors to convey statuses such as active, success, error, or warning.
- Don't: Use categorical colors for system status, as they may not draw enough attention.
- Do: Use non-semantic colors to categorize information.
- Don't: Use system status colors for categorization.
- Do: Use color to draw attention to badges that require user action. Use the default badge color for non-actionable items.
- Don't: Overuse color.

### Icons and labels

- Do: Always pair icons with a clear label.
- Don't: Use icon-only badges, as they can be ambiguous.
- Do: Use concise labels (fewer than 3 words).
- Don't: Use more than 3 words in a badge.

## Placement

- **Headers**: Provide additional context in page or section headers.
- **List items**: Annotate items within lists.
- **Tables**: Highlight specific rows or cells.
- **Tabs and menus**: Annotate tabs or menu items.`,
    anatomy: [
      {name: 'Icon', required: false, description: 'A visual indicator that helps users identify the type of badge.'},
      {name: 'Label', required: true, description: 'A text or numerical label that provides additional context.'},
    ],
  },
};

/** @type {import('../docs-types').ComponentDoc} */
export const docsZh = {
  name: 'Badge',
  description:
    '用于显示状态指示器、计数或标签的徽章组件。',
  props: [
    {
      name: 'variant',
      type: "'neutral' | 'info' | 'success' | 'warning' | 'error' | 'blue' | 'cyan' | 'green' | 'orange' | 'pink' | 'purple' | 'red' | 'teal' | 'yellow'",
      description: '视觉样式变体。语义变体使用实色背景，非语义颜色变体使用浅色背景配彩色文字。',
      default: "'neutral'",
    },
    {
      name: 'label',
      type: 'ReactNode',
      description: '徽章文本内容。',
    },
    {
      name: 'icon',
      type: 'ReactNode',
      description: '可选的前置图标。',
    },
  ],
  theming: {
    targets: [
      {className: 'xds-badge', visualProps: ['variant']},
    ],
  },
};

/** @type {import('../docs-types').TranslationDoc} */
export const docsDense = {
  description: 'badge for status indicators, counts, or labels',
  propDescriptions: {
    variant: 'visual style variant',
    label: 'badge text content',
    icon: 'optional leading icon',
  },
};
