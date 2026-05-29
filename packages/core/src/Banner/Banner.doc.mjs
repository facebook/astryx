// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @type {import('../docs-types').ComponentDoc} */

export const docs = {
  name: 'Banner',
  displayName: 'Banner',
  category: 'Communications',
  keywords: ["banner","alert","notification","callout","notice","status","message","info","warning","error","success","toast"],
  usage: {
    description:
      'Banner shows a persistent message at the top of a page or section. Use it for form errors, system updates, maintenance notices, or success confirmations that the user needs to see until they act on it.',
    bestPractices: [
      {guidance: true, description: 'Pick a status that matches the message: info for updates, warning for caution, error for problems, success for confirmations.'},
      {guidance: true, description: 'Use the card container inside page content and the section container for full-width messages that span the entire page.'},
      {guidance: true, description: 'Make info and success banners dismissable. Keep error banners visible until the user fixes the issue.'},
      {guidance: true, description: 'Keep titles short and scannable — "Payment failed" not "There was a problem processing your most recent payment."'},
      {guidance: false, description: 'Use Banner for short-lived messages that disappear on their own — use Toast instead.'},
      {guidance: false, description: 'Stack multiple banners with the same status — combine related messages into one banner.'},
    ],
    anatomy: [
      {name: 'Icon', required: true, description: 'Automatically set based on the status (info, warning, error, success).'},
      {name: 'Title', required: false, description: 'The main message. Required if no description is provided.'},
      {name: 'Description', required: false, description: 'Additional detail below the title. Required if no title is provided.'},
      {name: 'Action button', required: false, description: 'A button for the user to act on the message, like "Review" or "Retry".'},
      {name: 'Dismiss button', required: false, description: 'Lets the user close the banner. Enabled by setting isDismissable.'},
      {name: 'Collapsible content', required: false, description: 'Extra detail that expands below the banner header, like a list of errors.'},
    ],
  },

  props: [
    {
      name: 'status',
      type: "'info' | 'warning' | 'error' | 'success'",
      description: 'Status type controlling icon and color.',
      required: true,
    },
    {
      name: 'title',
      type: 'ReactNode',
      description: 'Title text or ReactNode displayed in the header.',
      required: true,
    },
    {
      name: 'description',
      type: 'ReactNode',
      description: 'Description text rendered below the title in the header.',
    },
    {
      name: 'icon',
      type: 'ReactNode',
      description: 'Override the default status icon.',
      slotElements: [{__element: 'XDSIcon', props: {icon: 'check', size: 'sm'}}],
    },
    {
      name: 'isDismissable',
      type: 'boolean',
      description: 'Whether the banner can be dismissed by the user.',
      default: 'false',
    },
    {
      name: 'onDismiss',
      type: '() => void',
      description:
        'Called when the dismiss button is clicked; banner hides itself regardless of whether this is provided.',
    },
    {
      name: 'endContent',
      type: 'ReactNode',
      description:
        'Action content rendered in the header area, end-aligned. Typically a button or link.',
      slotElements: [
        {__element: 'XDSIcon', props: {icon: 'chevronDown', size: 'sm'}},
        {__element: 'XDSBadge', props: {label: '3'}},
      ],
    },
    {
      name: 'container',
      type: "'card' | 'section'",
      description:
        'Container type: card has border-radius; section is full-width with no border-radius for page-level use.',
      default: "'card'",
    },
    {
      name: 'children',
      type: 'ReactNode',
      description:
        'Content rendered in the card-background area below the colored header.',
    },
    {
      name: 'xstyle',
      type: 'StyleXStyles',
      description:
        'StyleX styles for layout customization (margins, positioning, sizing). Must be a stylex.create() value — not an inline style object like style={{}}.',
    },
  ],

  playground: {
    defaults: {
      title: 'System maintenance scheduled',
      description: 'The platform will be briefly unavailable on Sunday from 2–4 AM PST.',
      status: 'info',
    },
  },
  theming: {
    targets: [
      {className: 'xds-banner', visualProps: ['container', 'status']},
      {className: 'xds-banner-icon', visualProps: ['status']},
    ],
    vars: [
      {name: '--_banner-radius', description: 'Border radius (card container only)', default: 'var(--radius-container)', private: true},
    ],
    derived: [
      {property: 'borderRadius', vars: ['--_banner-radius']},
    ],
  },
};

/** @type {import('../docs-types').ComponentDoc} */
export const docsZh = {
  name: 'Banner',
  displayName: 'Banner',
  usage: {
    description:
      'Banner shows a persistent message at the top of a page or section. Use it for form errors, system updates, maintenance notices, or success confirmations that the user needs to see until they act on it.',
    bestPractices: [
      {guidance: true, description: 'Pick a status that matches the message: info for updates, warning for caution, error for problems, success for confirmations.'},
      {guidance: true, description: 'Use the card container inside page content and the section container for full-width messages that span the entire page.'},
      {guidance: true, description: 'Make info and success banners dismissable. Keep error banners visible until the user fixes the issue.'},
      {guidance: true, description: 'Keep titles short and scannable — "Payment failed" not "There was a problem processing your most recent payment."'},
      {guidance: false, description: 'Use Banner for short-lived messages that disappear on their own — use Toast instead.'},
      {guidance: false, description: 'Stack multiple banners with the same status — combine related messages into one banner.'},
    ],
    anatomy: [
      {name: 'Icon', required: true, description: 'Automatically set based on the status (info, warning, error, success).'},
      {name: 'Title', required: false, description: 'The main message. Required if no description is provided.'},
      {name: 'Description', required: false, description: 'Additional detail below the title. Required if no title is provided.'},
      {name: 'Action button', required: false, description: 'A button for the user to act on the message, like "Review" or "Retry".'},
      {name: 'Dismiss button', required: false, description: 'Lets the user close the banner. Enabled by setting isDismissable.'},
      {name: 'Collapsible content', required: false, description: 'Extra detail that expands below the banner header, like a list of errors.'},
    ],
  },
  props: [
    {name: 'status', type: "'info' | 'warning' | 'error' | 'success'", description: '状态类型，控制图标和颜色。', required: true},
    {name: 'title', type: 'ReactNode', description: '显示在头部的标题文本或 ReactNode。', required: true},
    {name: 'description', type: 'ReactNode', description: '渲染在头部标题下方的描述文本。'},
    {name: 'icon', type: 'ReactNode', description: '覆盖默认的状态图标。'},
    {name: 'isDismissable', type: 'boolean', description: '横幅是否可被用户关闭。', default: 'false'},
    {name: 'onDismiss', type: '() => void', description: '点击关闭按钮时调用；无论是否提供此回调，横幅都会自动隐藏。'},
    {name: 'endContent', type: 'ReactNode', description: '渲染在头部区域末端对齐的操作内容，通常是按钮或链接。'},
    {name: 'container', type: "'card' | 'section'", description: '视觉变体：card 带圆角；section 无圆角全宽，适用于页面级场景。', default: "'card'"},
    {name: 'children', type: 'ReactNode', description: '渲染在彩色头部下方卡片背景区域的内容。'},
    {
      name: 'xstyle',
      type: 'StyleXStyles',
      description:
        '用于布局自定义的 StyleX 样式（外边距、定位、尺寸）。必须是 stylex.create() 的值，而非内联样式对象如 style={{}}。',
    },
  ],
  theming: {
    targets: [
      {
        className: 'xds-banner',
        visualProps: [
          'container',
          'status',
        ],
      },
      {
        className: 'xds-banner-icon',
        visualProps: [
          'status',
        ],
      },
    ],
    vars: [
      {name: '--_banner-radius', description: 'Border radius (card container only)', default: 'var(--radius-container)', private: true},
    ],
    derived: [
      {property: 'borderRadius', vars: ['--_banner-radius']},
    ],
  },
};

/** @type {import('../docs-types').TranslationDoc} */
export const docsDense = {
  description: 'persistent message for errors, updates, warnings, or confirmations',
  usage: {
    description:
      'Banner shows a persistent message at the top of a page or section. Use for form errors, system updates, maintenance notices, or success confirmations.',
    bestPractices: [
      {guidance: true, description: 'Match status to message: info for updates, warning for caution, error for problems, success for confirmations.'},
      {guidance: true, description: 'Card container for inline content, section container for full-width page-level messages.'},
      {guidance: true, description: 'Make info/success dismissable. Keep error banners until the issue is fixed.'},
      {guidance: true, description: 'Keep titles short — "Payment failed" not "There was a problem processing your payment."'},
      {guidance: false, description: 'Use for auto-dismissing messages — use Toast instead.'},
      {guidance: false, description: 'Stack multiple banners of the same status — combine into one.'},
    ],
    anatomy: [
      {name: 'Icon', required: true, description: 'Set automatically from status.'},
      {name: 'Title', required: false, description: 'Main message text.'},
      {name: 'Description', required: false, description: 'Detail below title.'},
      {name: 'Action button', required: false, description: 'CTA like Review or Retry.'},
      {name: 'Dismiss button', required: false, description: 'Close button via isDismissable.'},
      {name: 'Collapsible content', required: false, description: 'Expandable detail area.'},
    ],
  },
  propDescriptions: {
    status: 'controls icon+color',
    title: 'title text/ReactNode in header',
    description: 'text below title in header',
    icon: 'override default status icon',
    isDismissable: 'user can dismiss banner',
    onDismiss: 'dismiss callback; banner self-hides regardless',
    endContent: 'end-aligned action in header, typically button/link',
    container: 'card=border-radius; section=full-width no radius for page-level',
    children: 'content in card-bg area below colored header',
    xstyle: 'StyleX layout customization via stylex.create()',
  },
};
