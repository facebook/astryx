/** @type {import('../docs-types').ComponentDoc} */

export const docs = {
  name: 'Toast',
  keywords: ["toast","notification","snackbar","alert","message","feedback","status"],

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
    description:
      'Toast is a transient notification that appears briefly to confirm an action or surface non-critical information. Use it for save confirmations, undo opportunities, or status updates that do not require user interaction.',
    bestPractices: [
      { guidance: true, description: 'Keep toast messages short and actionable so users can read them before they auto-dismiss.' },
      { guidance: true, description: 'Include an undo action in the endContent slot for reversible operations.' },
      { guidance: false, description: 'Use a toast for critical errors or information that requires user acknowledgment — use Banner instead.' },
      { guidance: false, description: 'Stack multiple toasts for the same event — use uniqueID to deduplicate.' },
    ],
  },
};

// -------------------------------------------------------
// Auto-generated translations below. Do not edit manually.
// Regenerate with the dense compression protocol.
// See .context/decisions/dense-compression-protocol.md
// -------------------------------------------------------

/** @type {import('../docs-types').TranslationDoc} */
export const docsZh = {
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
    description:
      'Toast is a transient notification that appears briefly to confirm an action or surface non-critical information. Use it for save confirmations, undo opportunities, or status updates that do not require user interaction.',
    bestPractices: [
      { guidance: true, description: 'Keep toast messages short and actionable so users can read them before they auto-dismiss.' },
      { guidance: true, description: 'Include an undo action in the endContent slot for reversible operations.' },
      { guidance: false, description: 'Use a toast for critical errors or information that requires user acknowledgment — use Banner instead.' },
      { guidance: false, description: 'Stack multiple toasts for the same event — use uniqueID to deduplicate.' },
    ],
  },
};

/** @type {import('../docs-types').TranslationDoc} */
export const docsDense = {
  description:
    'toast notification w/ auto-dismiss, stacking, dedup, smooth animations; XDSMediaTheme inverted surface',
  usage: {
    description:
      'Toast is a transient notification that appears briefly to confirm an action or surface non-critical information. Use it for save confirmations, undo opportunities, or status updates that do not require user interaction.',
    bestPractices: [
      { guidance: true, description: 'Keep toast messages short and actionable so users can read them before they auto-dismiss.' },
      { guidance: true, description: 'Include an undo action in the endContent slot for reversible operations.' },
      { guidance: false, description: 'Use a toast for critical errors or information that requires user acknowledgment — use Banner instead.' },
      { guidance: false, description: 'Stack multiple toasts for the same event — use uniqueID to deduplicate.' },
    ],
  },
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
};
