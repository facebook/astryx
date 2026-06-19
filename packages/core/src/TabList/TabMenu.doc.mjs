// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @type {import('../docs-types').ComponentDoc} */

export const docs = {
  name: 'TabMenu',
  subComponentOf: 'TabList',
  displayName: 'Tab Menu',
  isHiddenFromOverview: true,
  description: "Overflow menu trigger that opens a dropdown of additional tab options, showing the selected option's label as the trigger text.",
  props: [
    {
      name: 'label',
      type: 'string',
      description: 'Label for the trigger button (shown when no option is selected) and the dropdown heading divider.',
      required: true,
    },
    {
      name: 'options',
      type: 'XDSTabMenuOption[]',
      description: 'Array of menu options rendered in the dropdown.',
      required: true,
    },
  ],
};

export const docsZh = {
  name: 'TabMenu',
  isHiddenFromOverview: true,
  displayName: 'Tab Menu',
  description: '溢出菜单触发器，打开包含额外标签选项的下拉菜单，将选中选项的标签显示为触发器文本。',
  props: [
    {
      name: 'label',
      type: 'string',
      description: '触发器按钮的标签（无选项选中时显示）以及下拉菜单标题分隔线的文本。',
      required: true,
    },
    {
      name: 'options',
      type: 'XDSTabMenuOption[]',
      description: '在下拉菜单中渲染的菜单选项数组。',
      required: true,
    },
  ],
};

export const docsDense = {
  name: 'TabMenu',
  isHiddenFromOverview: true,
  displayName: 'Tab Menu',
  description: "Overflow menu trigger; dropdown of extra tab options, shows selected option's label as trigger text.",
  propDescriptions: {
    label: 'Trigger text (when no option selected) + dropdown heading.',
    options: 'Menu options array rendered in dropdown.',
  },
};
