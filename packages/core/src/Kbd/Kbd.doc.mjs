/** @type {import('../docs-types').ComponentDoc} */

export const docs = {
  name: 'Kbd',
  keywords: ["kbd","keyboard","shortcut","hotkey","keybinding","keystroke","keycombo","modifier","accelerator"],
  props: [
    {
      name: 'keys',
      type: 'string',
      description:
        'Keyboard shortcut string. Use "+" to separate keys. Special keys: mod (Cmd on Mac), ctrl, alt, shift, enter, backspace, escape, tab, up, down, left, right.',
      required: true,
    },
    {
      name: 'xstyle',
      type: 'StyleXStyles',
      description:
        'StyleX styles for layout customization (margins, positioning, sizing). Must be a stylex.create() value — not an inline style object like style={{}}.',
    },
    {
      name: 'className',
      type: 'string',
      description:
        'CSS class name for the root element. Prefer xstyle for styling — className is provided for integration with non-StyleX systems.',
    },
    {
      name: 'style',
      type: 'CSSProperties',
      description:
        'Inline styles for the root element. Prefer xstyle for styling — inline styles bypass StyleX optimization.',
    },
  ],
  theming: {
    targets: [{className: 'xds-kbd'}],
  },
  usage: {
    description: 'Displays a keyboard shortcut as styled key badges. Use Kbd in tooltips, menus, and documentation to visually communicate key combinations to users.',
    bestPractices: [
      { guidance: true, description: 'Place keyboard shortcuts near the action they describe, such as in a tooltip or menu item.' },
      { guidance: true, description: 'Use the "mod" key name for platform-adaptive display — it renders as ⌘ on Mac and Ctrl on other platforms.' },
      { guidance: false, description: 'Use Kbd as the only way to discover an action — keyboard shortcuts should supplement visible labels and controls.' },
    ],
  },
};

/** @type {import('../docs-types').ComponentDoc} */
export const docsZh = {
  name: 'Kbd',
  props: [
    {
      name: 'keys',
      type: 'string',
      description:
        '键盘快捷键字符串。使用 "+" 分隔各按键。特殊按键：mod（Mac 上为 Cmd）、ctrl、alt、shift、enter、backspace、escape、tab、up、down、left、right。',
      required: true,
    },
    {
      name: 'xstyle',
      type: 'StyleXStyles',
      description:
        '用于布局自定义的 StyleX 样式（边距、定位、尺寸）。必须是 stylex.create() 的值 — 这不能是 style={{}} 这样的内联样式对象。',
    },
    {
      name: 'className',
      type: 'string',
      description:
        '根元素的 CSS 类名。建议优先使用 xstyle 进行样式设置 — className 用于与非 StyleX 系统的集成。',
    },
    {
      name: 'style',
      type: 'CSSProperties',
      description:
        '根元素的内联样式。建议优先使用 xstyle 进行样式设置 — 内联样式会绕过 StyleX 优化。',
    },
  ],
  theming: {
    targets: [{className: 'xds-kbd'}],
  },
  usage: {
    description: 'Displays a keyboard shortcut as styled key badges. Use Kbd in tooltips, menus, and documentation to visually communicate key combinations to users.',
    bestPractices: [
      { guidance: true, description: 'Place keyboard shortcuts near the action they describe, such as in a tooltip or menu item.' },
      { guidance: true, description: 'Use the "mod" key name for platform-adaptive display — it renders as ⌘ on Mac and Ctrl on other platforms.' },
      { guidance: false, description: 'Use Kbd as the only way to discover an action — keyboard shortcuts should supplement visible labels and controls.' },
    ],
  },
};

/** @type {import('../docs-types').TranslationDoc} */
export const docsDense = {
  description:
    'Displays keyboard shortcut as styled <kbd> elements. Use in tooltips, menus + docs to show key combinations.',
  usage: {
    description: 'Displays a keyboard shortcut as styled key badges. Use Kbd in tooltips, menus, and documentation to visually communicate key combinations to users.',
    bestPractices: [
      { guidance: true, description: 'Place keyboard shortcuts near the action they describe, such as in a tooltip or menu item.' },
      { guidance: true, description: 'Use the "mod" key name for platform-adaptive display — it renders as ⌘ on Mac and Ctrl on other platforms.' },
      { guidance: false, description: 'Use Kbd as the only way to discover an action — keyboard shortcuts should supplement visible labels and controls.' },
    ],
  },
  propDescriptions: {
    keys: 'Shortcut string. "+" separates keys. Special: mod (Cmd on Mac), ctrl, alt, shift, enter, backspace, escape, tab, up, down, left, right.',
    xstyle: 'StyleX styles for layout customization. Must be stylex.create() value.',
    className: 'CSS class for root element. Prefer xstyle; className for non-StyleX integration.',
    style: 'Inline styles for root element. Prefer xstyle; inline styles bypass StyleX optimization.',
  },
};
