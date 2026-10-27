// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @type {import('@astryxdesign/cli/authoring').ComponentDoc} */

export const docs = {
  name: 'RefreshControl',
  displayName: 'RefreshControl',
  category: 'Feedback & Status',
  keywords: [
    'refresh',
    'pull to refresh',
    'pull-to-refresh',
    'reload',
    'feed',
    'list',
    'touch',
    'ios',
    'spinner',
    'scroll',
    'UIRefreshControl',
  ],
  props: [
    {
      name: 'children',
      type: 'ReactNode',
      description:
        'The scrolled content (a List, a feed). It is the part a pull moves; put RefreshControl inside the ScrollableArea (or other scroll container) rather than around it.',
      required: true,
    },
    {
      name: 'onRefresh',
      type: '() => void | Promise<unknown>',
      description:
        'Called when a pull triggers. Return a promise to keep the control refreshing until it settles, or drive the state with `isRefreshing`.',
    },
    {
      name: 'isRefreshing',
      type: 'boolean',
      description:
        'Controlled refreshing state. `true` puts the control in the refreshing state without a pull (for a refresh started elsewhere); `false` ends it. Omit it to let the promise from `onRefresh` decide.',
    },
    {
      name: 'title',
      type: 'ReactNode',
      description:
        'Short text under the indicator, such as when the content was last updated. It is revealed with the indicator, and assistive technology reads it as a status line, so a new title (after a refresh) is announced.',
    },
    {
      name: 'isDisabled',
      type: 'boolean',
      description:
        'Turns the pull off. A refresh already running keeps running until it ends.',
      default: 'false',
    },
    {
      name: 'xstyle',
      type: 'StyleXStyles',
      description:
        'StyleX styles for layout customization (margins, positioning, sizing). Must be a stylex.create() value, not an inline style object like style={{}}.',
    },
  ],
  theming: {
    targets: [{className: 'astryx-refresh-control', visualProps: []}],
  },
  usage: {
    description:
      'Pull to refresh following UIRefreshControl, with a finger or a pen: pulling the content down past the top reveals a spinner; pulling far enough starts a refresh while the finger or pen is still down; letting go settles the content just below the spinner until the refresh ends, then it slides back up. Under a finger (a coarse primary pointer, on iOS and Android alike) it replaces the browser’s own pull to refresh near the top of the page while mounted. A mouse drag, a trackpad’s scroll and a wheel’s do not pull. Pair it with a visible refresh button. useRefreshControl gives the same behavior to a custom indicator.',
    bestPractices: [
      {
        guidance: true,
        description:
          'Also offer a refresh button (or another visible control) that calls the same refresh: a pull has no keyboard, mouse or screen-reader equivalent.',
      },
      {
        guidance: true,
        description:
          'Return the fetch promise from onRefresh, or set isRefreshing yourself, so the spinner ends when the content has actually updated.',
      },
      {
        guidance: true,
        description:
          'Place RefreshControl inside the scroll container, around the content that should move, such as a List in a ScrollableArea or the page content under a sticky header.',
      },
      {
        guidance: false,
        description:
          'Put fixed-position elements (a floating action button) inside RefreshControl: the pull moves its whole subtree, fixed elements included.',
      },
      {
        guidance: false,
        description:
          'Nest one refreshable region inside another; only one pull should own the top of a scroll.',
      },
    ],
  },
};

/** @type {import('@astryxdesign/cli/authoring').ComponentDoc} */
export const docsZh = {
  name: 'RefreshControl',
  displayName: 'RefreshControl',
  props: [
    {
      name: 'children',
      type: 'ReactNode',
      description:
        '被滚动的内容（List、信息流）。下拉时移动的就是这部分；请把 RefreshControl 放在 ScrollableArea（或其他滚动容器）内部，而不是外面。',
      required: true,
    },
    {
      name: 'onRefresh',
      type: '() => void | Promise<unknown>',
      description:
        '下拉触发时调用。返回 promise 可让控件保持刷新状态直到其完成；也可以用 `isRefreshing` 控制状态。',
    },
    {
      name: 'isRefreshing',
      type: 'boolean',
      description:
        '受控的刷新状态。`true` 在没有下拉的情况下进入刷新状态（用于别处发起的刷新）；`false` 结束刷新。省略时由 `onRefresh` 返回的 promise 决定。',
    },
    {
      name: 'title',
      type: 'ReactNode',
      description:
        '指示器下方的简短文字，例如内容的最后更新时间。随指示器一起显现；辅助技术将其作为状态行读出，因此刷新后的新标题会被播报。',
    },
    {
      name: 'isDisabled',
      type: 'boolean',
      description: '关闭下拉。正在进行的刷新会继续，直到结束。',
      default: 'false',
    },
    {
      name: 'xstyle',
      type: 'StyleXStyles',
      description:
        '用于布局自定义的 StyleX 样式（外边距、定位、尺寸）。必须是 stylex.create() 的值，而非内联样式对象如 style={{}}。',
    },
  ],
  theming: {
    targets: [{className: 'astryx-refresh-control', visualProps: []}],
  },
  usage: {
    description:
      'Pull to refresh following UIRefreshControl, with a finger or a pen: pulling the content down past the top reveals a spinner; pulling far enough starts a refresh while the finger or pen is still down; letting go settles the content just below the spinner until the refresh ends, then it slides back up. Under a finger (a coarse primary pointer, on iOS and Android alike) it replaces the browser’s own pull to refresh near the top of the page while mounted. A mouse drag, a trackpad’s scroll and a wheel’s do not pull. Pair it with a visible refresh button. useRefreshControl gives the same behavior to a custom indicator.',
    bestPractices: [
      {
        guidance: true,
        description:
          'Also offer a refresh button (or another visible control) that calls the same refresh: a pull has no keyboard, mouse or screen-reader equivalent.',
      },
      {
        guidance: true,
        description:
          'Return the fetch promise from onRefresh, or set isRefreshing yourself, so the spinner ends when the content has actually updated.',
      },
      {
        guidance: true,
        description:
          'Place RefreshControl inside the scroll container, around the content that should move, such as a List in a ScrollableArea or the page content under a sticky header.',
      },
      {
        guidance: false,
        description:
          'Put fixed-position elements (a floating action button) inside RefreshControl: the pull moves its whole subtree, fixed elements included.',
      },
      {
        guidance: false,
        description:
          'Nest one refreshable region inside another; only one pull should own the top of a scroll.',
      },
    ],
  },
};

/** @type {import('@astryxdesign/cli/authoring').ComponentTranslationDoc} */
export const docsDense = {
  description:
    'Pull to refresh as UIRefreshControl: pull past the top, trigger with the finger down, settle under the spinner until the refresh ends. Under a finger only.',
  usage: {
    description:
      'Pull to refresh following UIRefreshControl, with a finger or a pen: pulling the content down past the top reveals a spinner; pulling far enough starts a refresh while the finger or pen is still down; letting go settles the content just below the spinner until the refresh ends, then it slides back up. Under a finger (a coarse primary pointer, on iOS and Android alike) it replaces the browser’s own pull to refresh near the top of the page while mounted. A mouse drag, a trackpad’s scroll and a wheel’s do not pull. Pair it with a visible refresh button. useRefreshControl gives the same behavior to a custom indicator.',
    bestPractices: [
      {
        guidance: true,
        description:
          'Also offer a refresh button (or another visible control) that calls the same refresh: a pull has no keyboard, mouse or screen-reader equivalent.',
      },
      {
        guidance: true,
        description:
          'Return the fetch promise from onRefresh, or set isRefreshing yourself, so the spinner ends when the content has actually updated.',
      },
      {
        guidance: true,
        description:
          'Place RefreshControl inside the scroll container, around the content that should move, such as a List in a ScrollableArea or the page content under a sticky header.',
      },
      {
        guidance: false,
        description:
          'Put fixed-position elements (a floating action button) inside RefreshControl: the pull moves its whole subtree, fixed elements included.',
      },
      {
        guidance: false,
        description:
          'Nest one refreshable region inside another; only one pull should own the top of a scroll.',
      },
    ],
  },
  propDescriptions: {
    children:
      'Scrolled content the pull moves; place inside the scroll container.',
    onRefresh: 'Called on trigger; a returned promise keeps it refreshing.',
    isRefreshing: 'Controlled state: true begins without a pull, false ends.',
    title: 'Text under the indicator (last updated).',
    isDisabled: 'Turns the pull off; a running refresh continues.',
    xstyle: 'StyleX layout styles; must be stylex.create() value.',
  },
};
