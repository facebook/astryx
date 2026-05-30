// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @type {import('../docs-types').ComponentDoc} */

export const docs = {
  name: 'Toast',
  displayName: 'Toast',
  group: 'Toast',
  category: 'Communications',
  hiddenComponents: ['ToastViewport'],
  keywords: ["toast","notification","snackbar","alert","message","feedback","status"],

  props: [
    {
      name: 'body',
      type: 'ReactNode',
      description: 'Primary message content.',
      required: true,
      slotElements: [{__element: 'XDSText', props: {type: 'body'}, children: 'Toast message'}],
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
      slotElements: [
        {__element: 'XDSIcon', props: {icon: 'chevronDown', size: 'sm'}},
        {__element: 'XDSBadge', props: {label: '3'}},
      ],
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
      'Toast shows a brief, non-blocking notification to confirm an action or present temporary information. Use it for scenarios where the user needs feedback but not a decision, such as saving, deleting, or changing a status.\n\nFor production use, prefer the `useXDSToast()` hook — it handles positioning, stacking, auto-dismiss, and deduplication via `XDSToastViewport`. The `XDSToast` component renders the visual toast element inline and is useful for previews, documentation, and static showcases where the viewport lifecycle is not needed.',
    bestPractices: [
      {guidance: true, description: 'Keep messages short - only a few words that tell the user what happened, like "Changes saved" or "Message sent".'},
      {guidance: true, description: 'Add an undo action in the endContent slot for reversible operations like deleting an item, so the user can recover without navigating away.'},
      {guidance: true, description: 'Use uniqueID to deduplicate toasts that fire from repeated actions, like clicking a save button multiple times.'},
      {guidance: true, description: 'Use error type for failures that need attention but not immediate action — it persists until dismissed so the user won\'t miss it.'},
      {guidance: false, description: 'Don\'t use a toast for critical errors that block the user — use Banner for persistent, in-context messaging that requires acknowledgment.'},
      {guidance: false, description: 'Don\'t put long or multi-line content in a toast — it disappears after 5 seconds and the user may not finish reading.'},
      {guidance: false, description: 'Don\'t show form validation errors as toasts — use inline field validation so the user can see exactly which field needs fixing.'},
    ],
    anatomy: [
      {name: 'Body', required: true, description: 'The primary message text describing what happened or what the user should know.'},
      {name: 'End content', required: false, description: 'A trailing action like an Undo button or a link, placed after the body text.'},
      {name: 'Dismiss button', required: true, description: 'A close button that lets the user manually dismiss the toast before auto-hide.'},
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
      'Toast 显示简短的非阻塞通知，用于确认操作或呈现临时信息。适用于用户需要反馈但不需要做决定的场景，如保存、删除或状态变更。\n\n生产环境中推荐使用 `useXDSToast()` hook——它通过 `XDSToastViewport` 处理定位、堆叠、自动关闭和去重。`XDSToast` 组件以内联方式渲染 toast 视觉元素，适用于预览、文档和静态展示。',
    bestPractices: [
      {guidance: true, description: '保持消息简短——只需几个词告诉用户发生了什么，如"更改已保存"或"消息已发送"。'},
      {guidance: true, description: '在 endContent 插槽中添加撤销操作，用于可逆操作如删除项目，让用户无需导航即可恢复。'},
      {guidance: true, description: '使用 uniqueID 去重重复操作触发的 toast，如多次点击保存按钮。'},
      {guidance: true, description: '对需要关注但不需要立即操作的错误使用 error 类型——它会持续显示直到关闭。'},
      {guidance: false, description: '不要对阻塞用户的严重错误使用 toast——使用 Banner 进行持久的上下文消息传递。'},
      {guidance: false, description: '不要在 toast 中放置长内容或多行内容——它会在5秒后消失，用户可能来不及阅读。'},
      {guidance: false, description: '不要将表单验证错误显示为 toast——使用内联字段验证让用户看到具体哪个字段需要修复。'},
    ],
    anatomy: [
      {name: '正文', required: true, description: '描述发生了什么或用户应该知道什么的主要消息文本。'},
      {name: '尾部内容', required: false, description: '正文后的尾随操作，如撤销按钮或链接。'},
      {name: '关闭按钮', required: true, description: '让用户在自动隐藏前手动关闭 toast 的关闭按钮。'},
    ],
  },
};

/** @type {import('../docs-types').TranslationDoc} */
export const docsDense = {
  description:
    'toast notification w/ auto-dismiss, stacking, dedup, smooth animations; XDSMediaTheme inverted surface',
  usage: {
    description:
      'Brief non-blocking notification for action confirmations and temporary info. Use where user needs feedback not decisions — saves, deletes, status changes. useXDSToast() hook for production (positioning, stacking, auto-dismiss, dedup via XDSToastViewport). XDSToast renders inline for previews/docs/static showcases.',
    bestPractices: [
      {guidance: true, description: 'Short messages — a few words: "Changes saved", "Message sent".'},
      {guidance: true, description: 'Undo action in endContent for reversible ops like deletes.'},
      {guidance: true, description: 'uniqueID to dedup repeated action toasts.'},
      {guidance: true, description: 'Error type for failures needing attention — persists until dismissed.'},
      {guidance: false, description: 'Don\'t use for critical blocking errors — use Banner for persistent in-context messaging.'},
      {guidance: false, description: 'Don\'t put long/multi-line content — disappears in 5s, user may not finish reading.'},
      {guidance: false, description: 'Don\'t show form validation errors — use inline field validation instead.'},
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
