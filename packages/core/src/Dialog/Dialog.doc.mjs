/** @type {import('../docs-types').ComponentDoc} */

export const docs = {
  name: 'Dialog',
  keywords: ["dialog","modal","popup","overlay","lightbox","alert","confirm","prompt","backdrop","focus trap"],
  theming: {
    container: true,
    targets: [
      {className: 'xds-dialog', visualProps: ['variant']},
    ],
    vars: [
      {name: '--_dialog-radius', description: 'Border radius of the dialog', default: 'var(--radius-container)', private: true},
    ],
    derived: [
      {property: 'borderRadius', vars: ['--_dialog-radius']},
      {property: 'padding', expand: 'container'},
    ],
  },
  components: [
    {
      name: 'XDSDialog',
      description: 'Modal dialog using the native <dialog> element.',
      props: [
        {
          name: 'isOpen',
          type: 'boolean',
          description: 'Whether the dialog is open (required).',
          required: true,
        },
        {
          name: 'onOpenChange',
          type: '(isOpen: boolean) => unknown',
          description: 'Callback when dialog visibility changes (required).',
          required: true,
        },
        {
          name: 'children',
          type: 'ReactNode',
          description: 'Dialog content.',
          required: true,
        },
        {
          name: 'width',
          type: 'number | string',
          description: 'Width of the dialog in pixels or any CSS value.',
          default: '400',
        },
        {
          name: 'maxHeight',
          type: 'number | string',
          description: 'Maximum height of the dialog.',
          default: "'75vh'",
        },
        {
          name: 'position',
          type: 'XDSDialogPosition',
          description:
            'Static position for the dialog; centered by default when omitted.',
        },
        {
          name: 'variant',
          type: "'standard' | 'fullscreen'",
          description:
            'Dialog variant — fullscreen expands to fill the entire viewport.',
          default: "'standard'",
        },
        {
          name: 'purpose',
          type: "'required' | 'form' | 'info'",
          description:
            'Controls dismissal behavior: required disables Escape and backdrop click; form disables backdrop click after interaction; info allows both.',
          default: "'info'",
        },
      ],    },
    {
      name: 'XDSDialogHeader',
      description:
        'Header for dialogs with a title, optional subtitle, close button, and start/end content slots.',
      props: [
        {
          name: 'title',
          type: 'string',
          description: 'Dialog title (receives focus on open).',
        },
        {
          name: 'subtitle',
          type: 'string',
          description: 'Subtitle below the title.',
        },
        {
          name: 'onOpenChange',
          type: '(isOpen: boolean) => unknown',
          description:
            'Close button callback (no button if omitted).',
        },
        {
          name: 'startContent',
          type: 'ReactNode',
          description:
            'Content before the title (e.g., a back button).',
        },
        {
          name: 'endContent',
          type: 'ReactNode',
          description:
            'Content after the title, before close button.',
        },
        {
          name: 'hasDivider',
          type: 'boolean',
          description: 'Adds border at the bottom edge.',
          default: 'true',
        },
      ],
    },
  ],
  usage: {
    description: 'Dialog displays a modal overlay that blocks interaction with the page until the user responds. Use it for delete confirmations, edit forms, terms acceptance, or any decision that should not be skipped.',
    bestPractices: [
      { guidance: true, description: 'Choose the right purpose: info for dismissable content, form to prevent accidental backdrop dismissal, required when the user must respond.' },
      { guidance: true, description: 'Include a clear title in the header so users immediately understand what the dialog is asking.' },
      { guidance: true, description: 'Use purpose="form" for dialogs with inputs so the user can\'t accidentally lose data by clicking the backdrop.' },
      { guidance: true, description: 'Keep dialogs focused on a single task — if the content grows beyond what fits, consider a full page instead.' },
      { guidance: false, description: 'Use a dialog for simple messages that could be shown inline or as a toast notification.' },
      { guidance: false, description: 'Nest dialogs inside other dialogs — restructure the flow into steps within a single dialog instead.' },
      { guidance: false, description: 'Use the fullscreen variant for simple confirmations — it is meant for complex content like editors or long forms.' },
    ],
    anatomy: [
      {name: 'Header', required: true, description: 'Title, optional subtitle, and close button. The title receives focus on open for accessibility.'},
      {name: 'Body', required: true, description: 'The main content area — text, forms, lists, or any layout.'},
      {name: 'Footer', required: false, description: 'Action buttons like Save/Cancel or Accept/Decline, aligned to the end.'},
      {name: 'Backdrop', required: true, description: 'Semi-transparent overlay behind the dialog that blocks page interaction.'},
    ],
  },
};

/** @type {import('../docs-types').ComponentDoc} */
export const docsZh = {
  name: 'Dialog',
  theming: {
    container: true,
    targets: [
      {className: 'xds-dialog', visualProps: ['variant']},
    ],
    vars: [
      {name: '--_dialog-radius', description: 'Border radius of the dialog', default: 'var(--radius-container)', private: true},
    ],
    derived: [
      {property: 'borderRadius', vars: ['--_dialog-radius']},
      {property: 'padding', expand: 'container'},
    ],
  },
  components: [
    {
      name: 'XDSDialog',
      description: '使用原生 <dialog> 元素的模态对话框。',
      props: [
        {
          name: 'isOpen',
          type: 'boolean',
          description: '对话框是否打开（必填）。',
          required: true,
        },
        {
          name: 'onOpenChange',
          type: '(isOpen: boolean) => unknown',
          description: '对话框可见性变化时的回调（必填）。',
          required: true,
        },
        {
          name: 'children',
          type: 'ReactNode',
          description: '对话框内容。',
          required: true,
        },
        {
          name: 'width',
          type: 'number | string',
          description: '对话框的宽度，单位为像素或任意 CSS 值。',
          default: '400',
        },
        {
          name: 'maxHeight',
          type: 'number | string',
          description: '对话框的最大高度。',
          default: "'75vh'",
        },
        {
          name: 'position',
          type: 'XDSDialogPosition',
          description:
            '对话框的静态定位；省略时默认居中。',
        },
        {
          name: 'variant',
          type: "'standard' | 'fullscreen'",
          description:
            '对话框变体 - fullscreen 会扩展至填满整个视口。',
          default: "'standard'",
        },
        {
          name: 'purpose',
          type: "'required' | 'form' | 'info'",
          description:
            '控制关闭行为：required 禁用 Escape 和遮罩层点击；form 在交互后禁用遮罩层点击；info 两者都允许。',
          default: "'info'",
        },
      ],
    },
    {
      name: 'XDSDialogHeader',
      description:
        '对话框头部，包含标题、可选副标题、关闭按钮以及首尾内容插槽。',
      props: [
        {
          name: 'title',
          type: 'string',
          description: '对话框标题（打开时获得焦点）。',
        },
        {
          name: 'subtitle',
          type: 'string',
          description: '标题下方的副标题。',
        },
        {
          name: 'onOpenChange',
          type: '(isOpen: boolean) => unknown',
          description:
            '关闭按钮的回调（省略时不显示按钮）。',
        },
        {
          name: 'startContent',
          type: 'ReactNode',
          description:
            '标题之前的内容（例如返回按钮）。',
        },
        {
          name: 'endContent',
          type: 'ReactNode',
          description:
            '标题之后、关闭按钮之前的内容。',
        },
        {
          name: 'hasDivider',
          type: 'boolean',
          description: '在底部边缘添加分隔线。',
          default: 'true',
        },
      ],
    },
  ],
  usage: {
    description: 'Dialog displays a modal overlay that blocks interaction with the page until the user responds. Use it for delete confirmations, edit forms, terms acceptance, or any decision that should not be skipped.',
    bestPractices: [
      { guidance: true, description: 'Choose the right purpose: info for dismissable content, form to prevent accidental backdrop dismissal, required when the user must respond.' },
      { guidance: true, description: 'Include a clear title in the header so users immediately understand what the dialog is asking.' },
      { guidance: true, description: 'Use purpose="form" for dialogs with inputs so the user can\'t accidentally lose data by clicking the backdrop.' },
      { guidance: true, description: 'Keep dialogs focused on a single task — if the content grows beyond what fits, consider a full page instead.' },
      { guidance: false, description: 'Use a dialog for simple messages that could be shown inline or as a toast notification.' },
      { guidance: false, description: 'Nest dialogs inside other dialogs — restructure the flow into steps within a single dialog instead.' },
      { guidance: false, description: 'Use the fullscreen variant for simple confirmations — it is meant for complex content like editors or long forms.' },
    ],
    anatomy: [
      {name: 'Header', required: true, description: 'Title, optional subtitle, and close button. The title receives focus on open for accessibility.'},
      {name: 'Body', required: true, description: 'The main content area — text, forms, lists, or any layout.'},
      {name: 'Footer', required: false, description: 'Action buttons like Save/Cancel or Accept/Decline, aligned to the end.'},
      {name: 'Backdrop', required: true, description: 'Semi-transparent overlay behind the dialog that blocks page interaction.'},
    ],
  },
};

/** @type {import('../docs-types').TranslationDoc} */
export const docsDense = {
  description: 'modal overlay that blocks page interaction until the user responds',
  usage: {
    description: 'Dialog displays a modal overlay that blocks page interaction. Use for delete confirmations, edit forms, terms acceptance.',
    bestPractices: [
      { guidance: true, description: 'Pick the right purpose: info=dismissable, form=no backdrop dismiss, required=must respond.' },
      { guidance: true, description: 'Clear title in header. Use purpose="form" for dialogs with inputs.' },
      { guidance: false, description: 'Use for simple messages — use inline or toast instead. Don\'t nest dialogs.' },
      { guidance: false, description: 'Fullscreen for simple confirmations — it\'s for complex content like editors.' },
    ],
  },
  components: [
    {
      name: 'XDSDialog',
      description: 'modal dialog using native <dialog>',
      propDescriptions: {
        isOpen: 'dialog open state',
        onOpenChange: 'callback on visibility change',
        children: 'dialog content',
        width: 'dialog width (px or CSS)',
        maxHeight: 'max dialog height',
        position: 'static position; centered by default',
        variant: 'standard or fullscreen (fills viewport)',
        purpose: 'dismissal behavior: required=no dismiss; form=no backdrop after interaction; info=both allowed',
      },
    },
    {
      name: 'XDSDialogHeader',
      description: 'dialog header w/ title, optional subtitle, close button, start/end content slots',
      propDescriptions: {
        title: 'dialog title (receives focus on open)',
        subtitle: 'subtitle below title',
        onOpenChange: 'close button callback (omit=no button)',
        startContent: 'content before title (e.g. back button)',
        endContent: 'content after title, before close button',
        hasDivider: 'bottom border',
      },
    },
  ],
};
