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
        'Accessible name for the group, applied as aria-label so screen readers announce the radios as a named set, e.g. "Sort by". Required unless title is given. Pass aria-labelledby (via base props) instead when the name already exists as a visible element. With a title too, label names the group and the title stays a visible heading.',
    },
    {
      name: 'title',
      type: 'ReactNode',
      description:
        'A visible heading above the radios, with the same treatment as a DropdownMenuGroup heading, that names the group through aria-labelledby. With a title, label is optional. Give a menu section that holds one radio set this title instead of wrapping the set in a DropdownMenuGroup, so the set is one group with one name rather than two nested groups announced with the same name.',
    },
    {
      name: 'hasCloseOnSelect',
      type: 'boolean',
      default: 'true',
      description:
        'Whether selecting a value closes the menu. Radio items default to closing on selection (a single-choice commit).',
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
      '组的无障碍名称，作为 aria-label 应用，以便屏幕阅读器将单选项作为命名集合朗读，例如“Sort by”。未提供 title 时必需。当名称已作为可见元素存在时，可改用 aria-labelledby（通过基础属性）。同时提供 title 时，由 label 命名该组，title 仍作为可见标题显示。',
    title:
      '显示在单选项上方的可见标题，样式与 DropdownMenuGroup 的标题相同，并通过 aria-labelledby 为该组命名。提供 title 时 label 可省略。菜单中只包含一组单选项的分区应使用此标题，而不是用 DropdownMenuGroup 包裹该组，这样该组只是一个具有一个名称的组。',
    hasCloseOnSelect: '选择某值是否关闭菜单。默认关闭。',
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
    label:
      'accessible group name (applied as aria-label); required unless title is given',
    title:
      'visible heading (DropdownMenuGroup treatment) that names the group via aria-labelledby; use it instead of a DropdownMenuGroup around one radio set',
    hasCloseOnSelect: 'close menu on select (default true)',
    children: 'the DropdownMenuRadioItems',
  },
};
