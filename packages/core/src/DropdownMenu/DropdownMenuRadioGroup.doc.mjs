// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @type {import('@astryxdesign/cli/authoring').ComponentDoc} */

export const docs = {
  name: 'DropdownMenuRadioGroup',
  subComponentOf: 'DropdownMenu',
  displayName: 'Dropdown Menu Radio Group',
  isHiddenFromOverview: true,
  description:
    'A single-select group of radio menu items (role="group" of menuitemradio). Owns the selected value and lays its items out with the menu\'s inter-item gap.',
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
    label: '组的无障碍名称，作为 aria-label 应用，以便屏幕阅读器将单选项作为命名集合朗读，例如“Sort by”。必需。当名称已作为可见元素存在时，可改用 aria-labelledby（通过基础属性）。',
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
    label: 'accessible group name (applied as aria-label); required',
    hasCloseOnSelect: 'close menu on select (default true)',
    children: 'the DropdownMenuRadioItems',
  },
};
