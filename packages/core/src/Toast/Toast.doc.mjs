/** @type {import('../docs-types').ComponentDoc} */

export const docs = {
  name: 'Toast',
  description:
    'Toast notification system with auto-dismiss, stacking, deduplication, and smooth animations. Uses XDSMediaTheme for inverted surface theming.',
  showcase: {
    aspectRatio: 4 / 3,
    code: '<XDSToast message="Saved successfully" />',
  },

  keywords: ["toast","notification","snackbar","alert","message","feedback","status"],
  features: [
    "Types: 'info' (default), 'error'",
    'Auto-dismiss: info toasts dismiss after 5s, error toasts persist',
    'Pause on hover/focus: timer pauses during interaction',
    'Stacking: multiple toasts stack with smooth enter/exit animations',
    'Deduplication: uniqueID with ignore or overwrite collision behavior',
    'Programmatic dismiss: show() returns a dismiss function',
    'End content slot: trailing actions (buttons, links)',
    'Fallback viewport: works without a provider via document.body fallback',
    'Inverted surface: uses XDSMediaTheme for correct colors on dark/light backgrounds',
    'Accessible: role=status/alert, aria-live=polite/assertive',
  ],

  props: [
    {
      name: 'body',
      type: 'ReactNode',
      description: 'Primary message content.',
      required: true,
    },
    {
      name: 'type',
      type: "'info' | 'error'",
      description: 'Toast type controlling background color. Error toasts persist until dismissed.',
      default: "'info'",
    },
    {
      name: 'isAutoHide',
      type: 'boolean',
      description: 'Whether the toast auto-dismisses. Defaults to true for info, false for error.',
    },
    {
      name: 'autoHideDuration',
      type: 'number',
      description: 'Duration in ms before auto-dismiss.',
      default: '5000',
    },
    {
      name: 'endContent',
      type: 'ReactNode',
      description: 'Content rendered at the trailing end (e.g. Undo button, link).',
    },
    {
      name: 'uniqueID',
      type: 'string',
      description: 'Unique identifier for deduplication.',
    },
    {
      name: 'collisionBehavior',
      type: "'overwrite' | 'ignore'",
      description: 'Behavior when a toast with matching uniqueID already exists.',
      default: "'overwrite'",
    },
    {
      name: 'onHide',
      type: '(reason: "auto" | "manual") => void',
      description: 'Callback fired when the toast is removed.',
    },
  ],  theming: {
    targets: [
      {className: 'xds-toast', visualProps: ['type']},
    ],
  },

  usage: {
    summary: 'Transient notification that appears briefly to confirm an action or surface non-critical information.',
    content: `## When to use

- Confirming a completed action (e.g., "Saved successfully").
- Surfacing non-critical, time-sensitive information.
- Providing undo opportunities for reversible actions.

## When NOT to use

- Critical information that requires user action (use Banner instead).
- Persistent messages (use Banner instead).
- Validation errors on form fields (use Field status instead).`,
  },
};

// -------------------------------------------------------
// Auto-generated translations below. Do not edit manually.
// Regenerate with the dense compression protocol.
// See .context/decisions/dense-compression-protocol.md
// -------------------------------------------------------

/** @type {import('../docs-types').TranslationDoc} */
export const docsZh = {
  description:
    'Toast 通知系统，支持自动关闭、堆叠、去重和平滑动画。使用 XDSMediaTheme 进行反转表面主题。',
  features: [
    "类型：'info'（默认）、'error'",
    '自动关闭：info toast 5秒后关闭，error toast 持续显示',
    '悬停/聚焦暂停：交互时计时器暂停',
    '堆叠：多个 toast 以平滑进出动画堆叠',
    '去重：uniqueID 支持 ignore 或 overwrite 碰撞行为',
    '程序化关闭：show() 返回关闭函数',
    '尾部内容插槽：尾随操作（按钮、链接）',
    '回退视口：无需 provider，通过 document.body 回退',
    '反转表面：使用 XDSMediaTheme 在深色/浅色背景上显示正确颜色',
    '无障碍：role=status/alert，aria-live=polite/assertive',
  ],
  propDescriptions: {
    body: '主要消息内容。',
    type: 'Toast 类型，控制背景颜色。error toast 持续显示直到关闭。',
    isAutoHide: '是否自动关闭。info 默认为 true，error 默认为 false。',
    autoHideDuration: '自动关闭前的持续时间（毫秒）。',
    endContent: '尾部渲染的内容（如撤销按钮、链接）。',
    uniqueID: '用于去重的唯一标识符。',
    collisionBehavior: '当已存在相同 uniqueID 的 toast 时的行为。',
    onHide: '当 toast 被移除时触发的回调。',
  },
  usage: {
    summary: '短暂通知，出现片刻以确认操作或显示非关键信息。',
    content: `## 何时使用

- 确认已完成的操作（如"保存成功"）。
- 显示非关键的时效性信息。
- 为可逆操作提供撤销机会。

## 何时不使用

- 需要用户操作的关键信息（使用 Banner）。
- 持久性消息（使用 Banner）。
- 表单字段验证错误（使用 Field 状态）。`,
  },
};

/** @type {import('../docs-types').TranslationDoc} */
export const docsDense = {
  description:
    'toast notification w/ auto-dismiss, stacking, dedup, smooth animations; XDSMediaTheme inverted surface',
  features: [
    "types: info (default), error",
    'auto-dismiss: info 5s, error persists',
    'pause on hover/focus',
    'stacking w/ smooth enter/exit animations',
    'dedup: uniqueID w/ ignore|overwrite collision',
    'programmatic dismiss: show() returns dismiss fn',
    'end content slot: trailing actions',
    'fallback viewport: works w/o provider via document.body',
    'inverted surface: XDSMediaTheme for dark/light bg colors',
    'a11y: role=status/alert, aria-live=polite/assertive',
  ],
  propDescriptions: {
    body: 'primary message content',
    type: 'toast type; controls bg color; error persists until dismissed',
    isAutoHide: 'auto-dismiss; true for info, false for error',
    autoHideDuration: 'ms before auto-dismiss',
    endContent: 'trailing end content (undo btn, link)',
    uniqueID: 'unique id for dedup',
    collisionBehavior: 'behavior when matching uniqueID exists',
    onHide: 'callback when toast removed',
  },
  usage: {
    summary: 'transient notification confirming action or surfacing non-critical info',
    content: `## When to use

- confirm completed action
- non-critical time-sensitive info
- undo opportunities for reversible actions

## When NOT to use

- critical info requiring action (use Banner)
- persistent messages (use Banner)
- form field validation errors (use Field status)`,
  },
};
