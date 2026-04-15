/** @type {import('../docs-types').ComponentDoc} */

export const docs = {
  name: 'Kbd',
  description:
    'Displays a keyboard shortcut as styled <kbd> elements. Use in tooltips, menus, and documentation to show key combinations.',
  showcase: {
    aspectRatio: 1,
    code: '<XDSKbd>⌘K</XDSKbd>',
  },
  keywords: ["kbd","keyboard","shortcut","hotkey","keybinding","keystroke","keycombo","modifier","accelerator"],
  features: [
    'Key parsing — splits "mod+k" into individual styled <kbd> elements',
    'Modifier symbols — maps mod/ctrl/alt/shift/enter/backspace/escape/arrows to platform symbols',
    'Inline display — renders as inline-flex for use inside text, tooltips, and menus',
    'Accessible — aria-hidden="true" since shortcuts are supplementary to visible labels',
  ],
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
  accessibility: [
    'Renders with aria-hidden="true" — keyboard shortcuts are visual hints, not primary content',
    'Uses semantic <kbd> elements for each key',
  ],
  keyboard: 'Not interactive — purely presentational',
  notes: [
    'Fixed 20px height with min-width 20px per key badge',
    'Uses --color-background-body background and --color-text-secondary text color',
    'Key display symbols follow macOS conventions (⌘, ⌥, ⇧, ⌃)',
  ],
  usage: {
    summary: 'Displays a keyboard shortcut as styled key elements.',
    content: `## When to use

- Showing keyboard shortcuts in tooltips, menus, and documentation.`,
  },
};

/** @type {import('../docs-types').ComponentDoc} */
export const docsZh = {
  name: 'Kbd',
  description:
    '将键盘快捷键显示为样式化的 <kbd> 元素。适用于工具提示、菜单和文档中展示按键组合。',
  features: [
    '按键解析 — 将 "mod+k" 拆分为独立的样式化 <kbd> 元素',
    '修饰符符号 — 将 mod/ctrl/alt/shift/enter/backspace/escape/箭头键映射为平台符号',
    '内联显示 — 以 inline-flex 方式渲染，适用于文本、工具提示和菜单中',
    '无障碍 — 使用 aria-hidden="true"，因为快捷键是可见标签的补充信息',
  ],
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
  accessibility: [
    '使用 aria-hidden="true" 渲染 — 键盘快捷键是视觉提示，不是主要内容',
    '每个按键使用语义化的 <kbd> 元素',
  ],
  keyboard: '非交互式 — 纯展示用途',
  notes: [
    '固定 20px 高度，每个按键徽章最小宽度 20px',
    '使用 --color-background-body 背景色和 --color-text-secondary 文字颜色',
    '按键显示符号遵循 macOS 惯例（⌘、⌥、⇧、⌃）',
  ],
};

/** @type {import('../docs-types').TranslationDoc} */
export const docsDense = {
  description:
    'Displays keyboard shortcut as styled <kbd> elements. Use in tooltips, menus + docs to show key combinations.',
  features: [
    'Key parsing; splits "mod+k" into individual styled <kbd> elements',
    'Modifier symbols; maps mod/ctrl/alt/shift/enter/backspace/escape/arrows to platform symbols',
    'Inline display; renders as inline-flex for use inside text, tooltips + menus',
    'Accessible; aria-hidden="true" since shortcuts supplementary to visible labels',
  ],
  notes: [
    'Fixed 20px height w/ min-width 20px per key badge',
    'Uses --color-background-body background + --color-text-secondary text color',
    'Key display symbols follow macOS conventions (\u2318, \u2325, \u21e7, \u2303)',
  ],
  accessibility: [
    'Renders w/ aria-hidden="true"; keyboard shortcuts are visual hints, not primary content',
    'Uses semantic <kbd> elements for each key',
  ],
  keyboard: 'Not interactive; purely presentational',
  propDescriptions: {
    keys: 'Shortcut string. "+" separates keys. Special: mod (Cmd on Mac), ctrl, alt, shift, enter, backspace, escape, tab, up, down, left, right.',
    xstyle: 'StyleX styles for layout customization. Must be stylex.create() value.',
    className: 'CSS class for root element. Prefer xstyle; className for non-StyleX integration.',
    style: 'Inline styles for root element. Prefer xstyle; inline styles bypass StyleX optimization.',
  },
};
