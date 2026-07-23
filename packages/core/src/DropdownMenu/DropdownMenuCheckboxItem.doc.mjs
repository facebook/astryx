// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @type {import('../docs-types').ComponentDoc} */

export const docs = {
  name: 'DropdownMenuCheckboxItem',
  subComponentOf: 'DropdownMenu',
  displayName: 'Dropdown Menu Checkbox Item',
  isHiddenFromOverview: true,
  description:
    'A checkable menu item (role="menuitemcheckbox") that toggles an independent boolean. Use for on/off options inside a DropdownMenu; for a one-of-N choice use DropdownMenuRadioGroup.',
  props: [
    {
      name: 'label',
      type: 'ReactNode',
      description: 'Primary label text identifying the item.',
    },
    {
      name: 'description',
      type: 'ReactNode',
      description: 'Secondary description text displayed below the label.',
    },
    {
      name: 'icon',
      type: 'IconType',
      description:
        'Icon to display before the label. See `npx astryx docs icons` for valid semantic names.',
    },
    {
      name: 'value',
      type: 'boolean',
      description: 'Whether the item is checked. Controlled; pair with onChange.',
    },
    {
      name: 'onChange',
      type: '(checked: boolean) => void',
      description: 'Callback fired with the next checked state when the item is toggled.',
    },
    {
      name: 'isDisabled',
      type: 'boolean',
      default: 'false',
      description:
        'Whether the item is disabled. Disabled items stay focusable (via aria-disabled) so they remain discoverable by keyboard and assistive technology, but activation is blocked.',
    },
    {
      name: 'hasCloseOnSelect',
      type: 'boolean',
      default: 'false',
      description:
        'Whether toggling the item closes the menu. Checkbox items default to staying open so several can be toggled in a single session.',
    },
    {
      name: 'endContent',
      type: 'ReactNode',
      description:
        'Content to render after the label and description, such as a keyboard shortcut hint or badge.',
    },
  ],
};

export const docsZh = {
  name: 'DropdownMenuCheckboxItem',
  isHiddenFromOverview: true,
  displayName: 'Dropdown Menu Checkbox Item',
  description:
    '可勾选的菜单项（role="menuitemcheckbox"），用于切换独立的布尔值。用于 DropdownMenu 中的开关选项；单选请使用 DropdownMenuRadioGroup。',
  propDescriptions: {
    label: '标识该项的主标签文本。',
    description: '显示在标签下方的次要描述文本。',
    icon: '显示在标签前的图标。',
    value: '该项是否被勾选。受控，与 onChange 搭配使用。',
    onChange: '切换该项时以下一个勾选状态触发的回调。',
    isDisabled: '该项是否禁用。',
    hasCloseOnSelect: '切换该项是否关闭菜单。默认保持打开。',
    endContent: '在标签和描述之后渲染的内容。',
  },
};

export const docsDense = {
  name: 'DropdownMenuCheckboxItem',
  isHiddenFromOverview: true,
  displayName: 'Dropdown Menu Checkbox Item',
  description: 'checkable menu item (menuitemcheckbox); independent boolean toggle',
  propDescriptions: {
    label: 'primary label text',
    description: 'secondary text below label',
    icon: 'icon before label',
    value: 'checked state (controlled, w/ onChange)',
    onChange: 'fired w/ next checked state on toggle',
    isDisabled: 'disabled; stays focusable via aria-disabled',
    hasCloseOnSelect: 'close menu on toggle (default false, stays open)',
    endContent: 'content after label+description',
  },
};
