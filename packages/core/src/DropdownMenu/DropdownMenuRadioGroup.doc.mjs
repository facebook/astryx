// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @type {import('@astryxdesign/cli/authoring').ComponentDoc} */

export const docs = {
  name: 'DropdownMenuRadioGroup',
  subComponentOf: 'DropdownMenu',
  displayName: 'Dropdown Menu Radio Group',
  isHiddenFromOverview: true,
  description:
    'A single-select group of radio menu items (role="group" of menuitemradio). Owns the selected value and lays its items out with the menu\'s inter-item gap.',
  playground: {
    wrapper: {
      component: 'DropdownMenu',
      // Open on first load so the radio choices are visible without a click;
      // the preview bridges `onOpenChange` back so selecting still closes the
      // menu and the trigger reopens it.
      props: {
        button: {label: 'Sort'},
        presentation: 'popover',
        isMenuOpen: true,
      },
    },
    defaults: {
      value: 'newest',
      label: 'Sort by',
      children: [
        {
          __element: 'DropdownMenuRadioItem',
          props: {value: 'newest', label: 'Newest'},
        },
        {
          __element: 'DropdownMenuRadioItem',
          props: {value: 'oldest', label: 'Oldest'},
        },
      ],
    },
  },
  props: [
    {
      name: 'value',
      type: 'string | undefined',
      description:
        'The currently selected value in the group. Pass undefined when nothing is selected yet.',
    },
    {
      name: 'onChange',
      type: '(value: string) => void',
      description: 'Callback fired when the selected value changes.',
    },
    {
      name: 'label',
      type: 'string',
      description:
        'Accessible name for the group, applied as aria-label so screen readers announce the radios as a named set, e.g. "Sort by". Required. Pass aria-labelledby (via base props) instead when the name already exists as a visible element.',
    },
    {
      name: 'hasCloseOnSelect',
      type: 'boolean',
      default: 'true',
      description:
        'Whether selecting a value closes the menu. Radio items default to closing on selection (a single-choice commit).',
    },
    {
      name: 'indicator',
      type: "'radio' | 'check'",
      default: "'radio'",
      description:
        "The mark the rows draw for the chosen option. 'radio' draws the radio circle on every row; 'check' renders the theme's single-selection check indicator (the mark Selector puts on its chosen option) at the inline end of every row, in that row's state: the default check draws on the chosen row only, and a theme whose check draws an unchecked state (a radio, say) shows it on every row. The rows stay menuitemradio with aria-checked either way. ContextMenuRadioGroup and BreadcrumbMenuRadioGroup, the same component under other names, take it too.",
    },
    {
      name: 'children',
      type: 'ReactNode',
      description: 'The DropdownMenuRadioItems that make up the group.',
    },
  ],
};

export const docsZh = {
  name: 'DropdownMenuRadioGroup',
  isHiddenFromOverview: true,
  displayName: 'Dropdown Menu Radio Group',
  description:
    '单选的单选菜单项组（menuitemradio 的 role="group"）。持有所选值，并以菜单的项间距布局其子项。',
  propDescriptions: {
    value: '组中当前选中的值。尚无选中项时传 undefined。',
    onChange: '所选值变化时触发的回调。',
    label:
      '组的无障碍名称，作为 aria-label 应用，以便屏幕阅读器将单选项作为命名集合朗读，例如“Sort by”。必需。当名称已作为可见元素存在时，可改用 aria-labelledby（通过基础属性）。',
    hasCloseOnSelect: '选择某值是否关闭菜单。默认关闭。',
    indicator:
      "各行标记所选项的方式。'radio' 在每一行绘制单选圆圈；'check' 在每一行的行尾按该行状态渲染主题的单选 check 指示器（与 Selector 标记所选项相同）：默认勾号只在所选行绘制，而主题若把 check 换成会绘制未选状态的指示器（例如单选圆圈），则每一行都会显示它。两种方式下各行都保持 menuitemradio 和 aria-checked。ContextMenuRadioGroup 和 BreadcrumbMenuRadioGroup 是同一组件的别名，同样支持该属性。默认 'radio'。",
    children: '组成该组的 DropdownMenuRadioItem。',
  },
};

export const docsDense = {
  name: 'DropdownMenuRadioGroup',
  isHiddenFromOverview: true,
  displayName: 'Dropdown Menu Radio Group',
  description: 'single-select group of menuitemradio; owns selected value',
  propDescriptions: {
    value: 'selected value (undefined = none)',
    onChange: 'fired when selected value changes',
    label: 'accessible group name (applied as aria-label); required',
    hasCloseOnSelect: 'close menu on select (default true)',
    indicator:
      "'radio' circles on every row (default) | 'check': the theme's check indicator at each row's inline end (default check: chosen row only); also on ContextMenuRadioGroup, BreadcrumbMenuRadioGroup",
    children: 'the DropdownMenuRadioItems',
  },
};
