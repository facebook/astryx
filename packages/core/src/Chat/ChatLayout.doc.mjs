// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @type {import('@astryxdesign/cli/authoring').ComponentDoc} */

export const docs = {
  name: 'ChatLayout',
  subComponentOf: 'Chat',
  displayName: 'Chat Layout',
  description:
    'Layout shell for full chat interfaces. Messages flow in normal page flow, composer is fixed to the bottom with a frosted glass dock. Set density (compact/balanced/spacious) to control spacing, message max-width, and blur layer sizing. Includes built-in auto-scroll, a "New messages" scroll-to-bottom button, and a frosted glass blur layer behind the composer. By default the layout root is the scroll container; pass scrollRef to delegate scrolling to a parent element or the document body. In Safari on iOS (in the browser and as a home-screen app) and in Firefox for Android, where the visual viewport shrinks for the software keyboard, the composer rides on top of the keyboard, in step with it, and a conversation at its newest message stays there; every way into the composer\u2019s text (a tap, the keyboard\u2019s previous and next buttons, Tab, the input\u2019s focus()) focuses it without scrolling the page. Dragging the conversation down to the composer and lifting the finger there, or flicking toward it, dismisses the keyboard; a release moving back up keeps it (touch only, with no caller control). In Chrome on Android your page\u2019s interactive-widget viewport setting decides where the keyboard leaves the composer (see the browser-support guide).',
  props: [
    {
      name: 'children',
      type: 'ReactNode',
      description:
        'Message content: typically ChatMessageList. Flows naturally in the page and scrolls with the container.',
      required: true,
    },
    {
      name: 'composer',
      type: 'ReactNode',
      description:
        'Composer element: typically ChatComposer. Fixed to the bottom with a frosted glass dock.',
      required: true,
      slotElements: [
        {
          __element: 'TextInput',
          props: {
            label: 'Input',
            placeholder: 'Type here...',
          },
        },
      ],
    },
    {
      name: 'emptyState',
      type: 'ReactNode',
      description:
        'Content shown when children is empty. Centered vertically in the message area.',
      slotElements: [
        {
          __element: 'EmptyState',
          props: {
            title: 'No items',
            description: 'Nothing to show.',
          },
        },
      ],
    },
    {
      name: 'scrollButton',
      type: 'ReactNode | null',
      description:
        'Scroll-to-bottom button rendered above the composer. Defaults to ChatLayoutScrollButton with auto-scroll integration. Pass null to hide.',
    },
    {
      name: 'scrollRef',
      type: 'React.RefObject<HTMLElement | null>',
      description:
        'External scroll container ref. When provided, auto-scroll and scroll-to-bottom target this element instead of the layout root. Use when the chat is embedded in a page where a parent element or the document body scrolls.',
    },
    {
      name: 'density',
      type: "'compact' | 'balanced' | 'spacious'",
      description:
        'Visual density: controls dock padding, message-area max-width and inline padding, and the height of the frosted glass blur layer.',
      default: "'balanced'",
    },
  ],
  usage: {
    description:
      'ChatLayout is the layout shell for full-page chat interfaces. It renders messages in normal page flow and docks the composer to the bottom with a frosted glass blur layer. Set the density prop to control spacing; it defaults to balanced. Use it to wrap ChatMessageList and ChatComposer for a complete chat experience with built-in auto-scroll and a scroll-to-bottom button.',
    bestPractices: [
      {
        guidance: true,
        description:
          'Pass ChatMessageList as children and ChatComposer as the composer prop for a complete chat interface.',
      },
      {
        guidance: true,
        description:
          'Provide an emptyState so new conversations show a prompt instead of a blank screen.',
      },
      {
        guidance: true,
        description:
          'Use scrollRef when the chat is embedded in a page where a parent element handles scrolling.',
      },
      {
        guidance: false,
        description:
          "Don't apply a fixed height on the layout; let it fill its container with flex: 1.",
      },
      {
        guidance: false,
        description:
          "Don't render multiple ChatLayout instances in the same scroll container; each expects to own its scroll context.",
      },
    ],
    anatomy: [
      {
        name: 'Message area',
        required: true,
        description:
          'Scrollable region for messages. Renders children (typically ChatMessageList) in a flex column that pushes content to the bottom when the list is short.',
      },
      {
        name: 'Frosted glass dock',
        required: true,
        description:
          'Sticky or fixed container at the bottom with a backdrop-blur layer. Houses the scroll button and composer, as a group named "Message composer". While a software keyboard is up it rises with the keyboard, and the message area gets room to scroll above it. When the keyboard\u2019s Done ends typing, focus rests on this group (it is no tab stop), so the next tap or Tab starts from the composer.',
      },
      {
        name: 'Scroll-to-bottom button',
        required: false,
        description:
          'Appears when the user scrolls up or new messages arrive. Defaults to ChatLayoutScrollButton; pass null to hide or a custom element to override.',
      },
      {
        name: 'Composer',
        required: true,
        description:
          'The input area for sending messages, typically ChatComposer. Docked at the bottom inside the frosted glass layer.',
      },
      {
        name: 'Empty state',
        required: false,
        description:
          'Centered placeholder shown when no messages exist. Use EmptyState for a consistent look.',
      },
    ],
  },
};

export const docsZh = {
  name: 'ChatLayout',
  displayName: 'Chat Layout',
  description:
    '完整聊天界面的布局外壳。消息在页面中自然流动，编写器固定在底部，带有毛玻璃效果。通过 density 属性控制密度。在 iOS 上的 Safari（浏览器中和添加到主屏幕的网页应用）以及 Android 上的 Firefox 中，可视视口会随软键盘缩小，编写器随软键盘同步上移并停在键盘上方，停留在最新消息的对话保持在最新消息；进入编写器文本的每种方式（轻点、键盘的上一项和下一项按钮、Tab、输入框的 focus()）都会聚焦它而不滚动页面；把对话向下拖到编写器并在那里抬起手指，或朝它快速滑动，会收起键盘；松手时向上回拉则保留键盘（仅限触摸，调用方无法关闭）。在 Android 上的 Chrome 中，由页面的 interactive-widget 视口设置决定键盘出现时编写器的位置（参见浏览器支持指南）。',
  propDescriptions: {
    children: '消息内容，通常是 ChatMessageList。在页面中自然流动。',
    composer: '编写器元素，通常是 ChatComposer。固定在底部，带有毛玻璃底座。',
    emptyState: '子元素为空时显示的内容。',
    scrollButton:
      '编写器上方的滚动到底部按钮。默认使用 ChatLayoutScrollButton。传入 null 隐藏。',
    scrollRef:
      '外部滚动容器引用。提供时，自动滚动和滚动到底部将目标指向此元素。',
    density: '视觉密度：控制底座内边距、消息区最大宽度和毛玻璃层高度。',
  },
};

export const docsDense = {
  name: 'ChatLayout',
  displayName: 'Chat Layout',
  description:
    'layout shell for full chat; msgs in page flow, composer fixed bottom w/ frosted glass dock; density prop (default balanced); scrollRef delegates to parent/body; in Safari on iOS and Firefox for Android the composer rides the software keyboard (Chrome on Android: the page\u2019s interactive-widget setting decides), transcript stays at newest msg, every focus route (tap, prev/next, Tab, focus()) w/o page scroll; Done rests focus on the named composer group (no tab stop); drag to composer dismisses keyboard (touch, no caller control)',
  usage: {
    bestPractices: [
      {
        guidance: true,
        description:
          'Pass ChatMessageList as children and ChatComposer as composer prop for complete chat.',
      },
      {
        guidance: true,
        description:
          'Provide emptyState so new conversations show a prompt, not blank screen.',
      },
      {
        guidance: true,
        description:
          'Use scrollRef when chat is embedded in a page where a parent element handles scrolling.',
      },
      {
        guidance: false,
        description:
          'Apply fixed height on layout; let it fill container with flex: 1.',
      },
      {
        guidance: false,
        description:
          'Render multiple ChatLayout instances in same scroll container; each expects to own its scroll context.',
      },
    ],
  },
  propDescriptions: {
    children: 'msg content; typically ChatMessageList',
    composer:
      'composer element; typically ChatComposer; fixed bottom w/ frosted glass',
    emptyState: 'content when children empty',
    scrollButton:
      'scroll-to-bottom btn; defaults to ChatLayoutScrollButton; pass null to hide',
    scrollRef:
      'external scroll container ref; targets parent/body instead of layout root',
    density: 'visual density; dock padding, message max-width, blur height',
  },
};
