// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @type {import('../docs-types').ComponentDoc} */

export const docs = {
  name: 'Badge',
  displayName: 'Badge',
  category: 'Feedback & Status',
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
      slotElements: [{__element: 'XDSIcon', props: {icon: 'check', size: 'sm'}}],
    },
  ],
  playground: {
    defaults: {
      label: 'Badge',
      variant: 'neutral',
    },
  },
  theming: {
    targets: [
      {className: 'xds-badge', visualProps: ['variant']},
    ],
  },
  usage: {
    description:
      'Badge highlights a status or category at a glance. Use it sparingly — only when a value represents a distinct state (Active, Failed) or a grouping tag (Engineering, Design). Most metadata (dates, durations, counts, descriptions) should be plain description text, not badges.',
    bestPractices: [
      {guidance: true, description: 'Every status badge steals attention. Only badge states where the user needs to notice or act — errors, warnings, items requiring follow-up. If no action is needed, plain text is fine.'},
      {guidance: true, description: 'Use success, warning, and error variants only for system status that demands attention — "Failed", "Degraded", "Action Required". These have bold solid backgrounds designed to stand out.'},
      {guidance: true, description: 'Use color variants (blue, purple, teal, etc.) for category tags that group or classify items — team names, content types, priority levels.'},
      {guidance: true, description: 'Keep labels to one or two words. If you need more detail, put it in surrounding text instead of the badge.'},
      {guidance: true, description: 'Add an icon when it helps identify the badge type quickly, but always include a text label alongside it.'},
      {guidance: false, description: 'Apply a "success" badge to every healthy/active/normal item. If all rows show green "Active" badges, none stand out — the badge adds noise, not information. Show only the states that need user attention (errors, warnings, pending actions).'},
      {guidance: false, description: 'Use badges for metadata. Durations ("6h window"), counts ("12 trigger types"), dates, and descriptions are not statuses or categories — use description text (XDSText with type="supporting") instead.'},
      {guidance: false, description: 'Use semantic status variants (success, warning, error, info) for categories or informational content. These are visually loud and should only indicate system state.'},
      {guidance: false, description: 'Repeat the same badge in every row of a table or list. If the same value appears in most rows, it\'s not adding information — use plain text for common states and reserve badges for the exceptional ones.'},
      {guidance: false, description: 'Make badges clickable — they are read-only indicators. Use a button or link if the user needs to take action.'},
    ],
    anatomy: [
      {name: 'Icon', required: false, description: 'An optional leading icon that helps identify the badge type at a glance.'},
      {name: 'Label', required: true, description: 'The text or number shown inside the badge.'},
    ],
  },
};

/** @type {import('../docs-types').ComponentDoc} */
export const docsZh = {
  name: 'Badge',
  displayName: 'Badge',
  usage: {
    description:
      'Badge highlights a status or category at a glance. Use it sparingly — only when a value represents a distinct state (Active, Failed) or a grouping tag (Engineering, Design). Most metadata (dates, durations, counts, descriptions) should be plain description text, not badges.',
    bestPractices: [
      {guidance: true, description: 'Every status badge steals attention. Only badge states where the user needs to notice or act — errors, warnings, items requiring follow-up. If no action is needed, plain text is fine.'},
      {guidance: true, description: 'Use success, warning, and error variants only for system status that demands attention — "Failed", "Degraded", "Action Required". These have bold solid backgrounds designed to stand out.'},
      {guidance: true, description: 'Use color variants (blue, purple, teal, etc.) for category tags that group or classify items — team names, content types, priority levels.'},
      {guidance: true, description: 'Keep labels to one or two words. If you need more detail, put it in surrounding text instead of the badge.'},
      {guidance: true, description: 'Add an icon when it helps identify the badge type quickly, but always include a text label alongside it.'},
      {guidance: false, description: 'Apply a "success" badge to every healthy/active/normal item. If all rows show green "Active" badges, none stand out — the badge adds noise, not information. Show only the states that need user attention (errors, warnings, pending actions).'},
      {guidance: false, description: 'Use badges for metadata. Durations ("6h window"), counts ("12 trigger types"), dates, and descriptions are not statuses or categories — use description text (XDSText with type="supporting") instead.'},
      {guidance: false, description: 'Use semantic status variants (success, warning, error, info) for categories or informational content. These are visually loud and should only indicate system state.'},
      {guidance: false, description: 'Repeat the same badge in every row of a table or list. If the same value appears in most rows, it\'s not adding information — use plain text for common states and reserve badges for the exceptional ones.'},
      {guidance: false, description: 'Make badges clickable — they are read-only indicators. Use a button or link if the user needs to take action.'},
    ],
    anatomy: [
      {name: 'Icon', required: false, description: 'An optional leading icon that helps identify the badge type at a glance.'},
      {name: 'Label', required: true, description: 'The text or number shown inside the badge.'},
    ],
  },
  props: [
    {
      name: 'variant',
      type:
        "'neutral' | 'info' | 'success' | 'warning' | 'error' | 'blue' | 'cyan' | 'green' | 'orange' | 'pink' | 'purple' | 'red' | 'teal' | 'yellow'",
      description: '视觉样式变体。语义变体使用实色背景，非语义颜色变体使用浅色背景配彩色文字。',
      default: "'neutral'",
    },
    {name: 'label', type: 'ReactNode', description: '徽章文本内容。'},
    {name: 'icon', type: 'ReactNode', description: '可选的前置图标。'},
  ],
  theming: {
    targets: [
      {
        className: 'xds-badge',
        visualProps: [
          'variant',
        ],
      },
    ],
  },
};

/** @type {import('../docs-types').TranslationDoc} */
export const docsDense = {
  description: 'highlights status/category tag; not for general metadata',
  usage: {
    description:
      'Badge is for status (Active, Failed) + category tags (Engineering, Design); not for metadata like dates, durations, counts, descriptions — use XDSText w/ type="supporting" for those.',
    bestPractices: [
      {guidance: true, description: 'only badge states needing user action — errors, warnings, follow-up items; if no action needed, plain text is fine'},
      {guidance: true, description: 'use success/warning/error only for system status demanding attention (Failed, Degraded, Action Required); bold solid backgrounds designed to stand out'},
      {guidance: true, description: 'use color variants (blue, purple, teal, etc.) for category tags — team names, content types, priority levels'},
      {guidance: true, description: 'keep labels to 1–2 words; put detail in surrounding text instead of badge'},
      {guidance: true, description: 'add icon when it helps identify badge type; always include text label alongside it'},
      {guidance: false, description: 'apply "success" to every healthy/normal item; if most rows show green "Active", none stand out — only badge exceptions needing attention'},
      {guidance: false, description: 'use badges for metadata; durations, counts, dates, descriptions are not statuses — use XDSText w/ type="supporting" instead'},
      {guidance: false, description: 'use semantic status variants (success, warning, error, info) for categories; these are visually loud + should only indicate system state'},
      {guidance: false, description: 'repeat same badge in every row; if same value appears in most rows, use plain text — reserve badges for exceptional states'},
      {guidance: false, description: 'make badges clickable — they are read-only; use button/link for actions'},
    ],
    anatomy: [
      {name: 'Icon', required: false, description: 'optional leading icon for quick identification'},
      {name: 'Label', required: true, description: 'text/number shown inside badge'},
    ],
  },
  propDescriptions: {
    variant: 'visual style; semantic variants (neutral, info, success, warning, error) use solid backgrounds; color variants use tinted backgrounds w/ colored text',
    label: 'badge text content',
    icon: 'optional leading icon',
  },
};
