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
      name: 'indicatorPosition',
      type: "'start' | 'end'",
      description:
        "Which logical edge of each row carries the radio mark, with Selector's indicatorPosition meaning: 'start' before the label, 'end' at the row's inline end, on every pointer. Unset, the mark sits at the start under a fine pointer and moves to the end under a coarse one. The mark itself is the theme's radio indicator: to draw a check instead in one menu, wrap that menu in a Theme whose theme extends yours with indicators: {radio: CheckIndicator}. ContextMenuRadioGroup and BreadcrumbMenuRadioGroup, the same component under other names, take it too.",
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
    indicatorPosition:
      "各行单选标记所在的逻辑边，与 Selector 的 indicatorPosition 含义相同：'start' 在标签之前，'end' 在行尾，适用于所有指针。未设置时，标记在精确指针下位于行首，在粗略指针下移到行尾。标记本身是主题的 radio 指示器：若要在某个菜单中改为勾号，用一个扩展你的主题并设置 indicators: {radio: CheckIndicator} 的 Theme 包裹该菜单。ContextMenuRadioGroup 和 BreadcrumbMenuRadioGroup 是同一组件的别名，同样支持该属性。",
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
    indicatorPosition:
      "'start' | 'end': the edge of each row's radio mark, as Selector's indicatorPosition (unset: start, end on a coarse pointer); the mark is the theme's radio indicator; also on ContextMenuRadioGroup, BreadcrumbMenuRadioGroup",
    children: 'the DropdownMenuRadioItems',
  },
};
