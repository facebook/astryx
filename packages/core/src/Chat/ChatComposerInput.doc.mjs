// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @type {import('../docs-types').ComponentDoc} */

export const docs = {
  name: 'ChatComposerInput',
  subComponentOf: 'Chat',
  displayName: 'Chat Composer Input',
  isHiddenFromOverview: true,
  description: "Rich text input for the chat composer. Supports trigger menus (type @ or / to open a typeahead), inline tokens rendered as badges, message history recall with ArrowUp/Down, paste/drop file handling, and a 16px touch-device font-size floor to prevent iOS input zoom. Pass it to ChatComposer's input slot when you need more than a plain textarea.",
  props: [
    {
      name: 'handleRef',
      type: 'React.Ref<ChatComposerInputHandle>',
      description: 'Imperative handle for programmatic control: insertToken, expandToken, insertText, setValue, focus, and getValue. setValue replaces the content synchronously, emits one onChange, re-evaluates the trigger menu, and places the caret at the end when the input has focus.',
    },
    {
      name: 'value',
      type: 'string',
      description: "Controlled input value. The input's internal state stays authoritative while editing — this prop only rewrites the content when it genuinely diverges (external override); echoes of onChange are ignored. Pair with onChange for two-way binding.",
    },
    {
      name: 'onChange',
      type: '(value: string) => void',
      description: 'Called when the input value changes. The serialized string includes token placeholders.',
    },
    {
      name: 'placeholder',
      type: 'string',
      description: 'Placeholder text shown when the input is empty.',
      default: "'Type a message...'",
    },
    {
      name: 'maxRows',
      type: 'number',
      description: 'Maximum visible rows before the input scrolls. Use a lower value in compact layouts.',
      default: '8',
    },
    {
      name: 'triggers',
      type: 'ChatComposerTrigger[]',
      description: 'Trigger definitions for typeahead menus. Each trigger specifies a character (@ or /), a search source, and an onSelect handler that returns the token to insert.',
    },
    {
      name: 'debounceMs',
      type: 'number',
      description: 'Debounce delay for async search sources to avoid excessive network requests.',
      default: '150',
    },
    {
      name: 'hasHistory',
      type: 'boolean',
      description: 'Enable ArrowUp/Down to recall previously submitted messages.',
      default: 'true',
    },
    {
      name: 'label',
      type: 'string',
      description: 'Accessible label announced by screen readers.',
      default: "'Message input'",
    },
    {
      name: 'isDisabled',
      type: 'boolean',
      description: 'Disables the input. Use during streaming or when a prerequisite is unmet.',
      default: 'false',
    },
    {
      name: 'onPaste',
      type: '(event, text) => void',
      description: 'Called when text is pasted. Use to intercept or transform pasted content.',
    },
    {
      name: 'onFiles',
      type: '(files: File[]) => void',
      description: 'Called when files are pasted or dropped onto the input. Use to handle attachments.',
    },
    {
      name: 'onSubmit',
      type: '(value: string) => void',
      description: 'Called when the user presses Enter without Shift. The serialized value includes token placeholders.',
    },
  ],
};

export const docsZh = {
  name: 'ChatComposerInput',
  isHiddenFromOverview: true,
  displayName: 'Chat Composer Input',
  description: '聊天编写器的富文本输入。支持触发菜单（输入 @ 或 / 打开 typeahead）、内联标记徽章、ArrowUp/Down 消息历史回溯、粘贴/拖放文件处理，并在触控设备上将字体大小保持至少 16px 以避免 iOS 输入缩放。当需要普通文本区域以外的功能时，传入 ChatComposer 的 input 插槽。',
  propDescriptions: {
    handleRef: '命令式句柄，用于编程式控制：insertToken、expandToken、insertText、setValue、focus 和 getValue。setValue 同步替换内容、触发一次 onChange、重新评估触发菜单，并在输入框拥有焦点时将光标置于末尾。',
    value: '受控输入值。编辑期间内部状态保持权威——仅当该属性与内部状态确实不同时才重写内容（外部覆盖）；onChange 的回显会被忽略。与 onChange 配对实现双向绑定。',
    onChange: '输入值变更时调用。序列化字符串包含标记占位符。',
    placeholder: '输入为空时显示的占位文本。',
    maxRows: '滚动前的最大可见行数。紧凑布局中使用较小值。',
    triggers: '菜单的触发定义。每个触发器指定字符（@ 或 /）、搜索源和返回要插入标记的 onSelect 处理器。',
    debounceMs: '异步搜索源的去抖动延迟，避免过多网络请求。',
    hasHistory: '启用 ArrowUp/Down 回溯之前提交的消息。',
    label: '屏幕阅读器播报的无障碍标签。',
    isDisabled: '禁用输入。在流式输出期间或前置条件未满足时使用。',
    onPaste: '粘贴文本时调用。用于拦截或转换粘贴内容。',
    onFiles: '粘贴或拖放文件到输入时调用。用于处理附件。',
    onSubmit: '用户不按 Shift 按 Enter 时调用。序列化值包含标记占位符。',
  },
};

export const docsDense = {
  name: 'ChatComposerInput',
  isHiddenFromOverview: true,
  displayName: 'Chat Composer Input',
  description: 'rich input for composer; trigger menus (@/commands), inline tokens, msg history, paste/drop files, 16px touch font-size floor to prevent iOS zoom. Use in ChatComposer input slot when you need more than plain textarea.',
  propDescriptions: {
    handleRef: 'imperative handle (insertToken/expandToken/insertText/setValue/focus/getValue); setValue replaces content sync + one onChange + re-evaluates trigger menu + caret at end when focused',
    value: 'controlled value; internal state authoritative while editing — applied only as genuine external override (onChange echoes ignored); pair w/ onChange',
    onChange: 'value change handler; serialized string includes token placeholders',
    placeholder: 'placeholder when empty',
    maxRows: 'max visible rows before scroll; lower for compact layouts',
    triggers: 'typeahead trigger defs; character(@/)+searchSource+onSelect returning token',
    debounceMs: 'debounce for async search to avoid excess requests',
    hasHistory: 'ArrowUp/Down to recall previous submissions',
    label: 'a11y label for screen readers',
    isDisabled: 'disabled; use during streaming or unmet prereqs',
    onPaste: 'paste handler; intercept/transform pasted content',
    onFiles: 'file paste/drop handler; use for attachments',
    onSubmit: 'Enter w/o Shift handler; serialized value includes token placeholders',
  },
};
