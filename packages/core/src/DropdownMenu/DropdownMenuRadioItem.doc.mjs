// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @type {import('@astryxdesign/cli/authoring').ComponentDoc} */

export const docs = {
  name: 'DropdownMenuRadioItem',
  subComponentOf: 'DropdownMenu',
  displayName: 'Dropdown Menu Radio Item',
  isHiddenFromOverview: true,
  description:
    'A single option in a DropdownMenuRadioGroup (role="menuitemradio"). Must be used inside a DropdownMenuRadioGroup.',
  playground: {
    defaults: {
      value: 'option-1',
      label: 'Option 1',
    },
    wrapper: {
      component: 'DropdownMenuRadioGroup',
      props: {
        value: 'option-1',
        label: 'Radio group',
      },
    },
  },
  props: [
    {
      name: 'value',
      type: 'string',
      required: true,
      description:
        "The value this item represents within its group. The group's value matches against this to determine the checked state.",
    },
    {
      name: 'label',
      type: 'ReactNode',
      required: true,
      description: 'Primary label text identifying the option.',
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
        'Icon to display before the label. See `astryx docs icons` for valid semantic names.',
    },
    {
      name: 'isDisabled',
      type: 'boolean',
      default: 'false',
      description:
        'Whether this individual radio item is disabled. Disabled items expose aria-disabled, block selection, and are currently skipped by DropdownMenu arrow-key navigation.',
    },
    {
      name: 'endContent',
      type: 'ReactNode',
      description:
        'Content to render after the label and description, such as a badge or metadata.',
    },
    {
      name: 'children',
      type: 'ReactNode',
      description:
        "Content drawn as a cell instead of the row: a tile, a colour swatch, an icon, a numbered slot. The cell shows no radio mark; label names it through a visually hidden element, the checked cell carries an accent border (Highlight under forced colors), and keyboard focus adds the focus ring. Cells keep the row role, focus, selection and handlers, so the arrow keys and typeahead reach them in DOM order. Lay them out by styling the group or a wrapper inside it as a grid. Children that render nothing, also an array of nothing, leave the row; an element always makes a cell, even a fragment or a component that returns null. A tile drawn as a background colour needs `forcedColorAdjust: 'none'` to keep it under forced colors. icon, description and endContent are not shown in a cell.",
    },
    {
      name: 'ref',
      type: 'React.Ref<HTMLElement>',
      description:
        'Ref forwarded to the row root, the element carrying role="menuitemradio". Register the row with an element-keyed observer or overlay.',
    },
  ],
};

export const docsZh = {
  name: 'DropdownMenuRadioItem',
  isHiddenFromOverview: true,
  displayName: 'Dropdown Menu Radio Item',
  description:
    'DropdownMenuRadioGroup 中的单个选项（role="menuitemradio"）。必须在 DropdownMenuRadioGroup 内使用。',
  propDescriptions: {
    value: '该项在组内代表的值。组的 value 与之匹配以确定勾选状态。',
    label: '标识该选项的主标签文本。',
    description: '显示在标签下方的次要描述文本。',
    icon: '显示在标签前的图标。',
    isDisabled: '该单选项是否禁用。',
    endContent: '在标签和描述之后渲染的内容。',
    children:
      "以单元格而非行绘制的内容：图块、色板、图标或编号槽位。单元格不显示单选标记；label 通过视觉隐藏的元素为其命名，选中的单元格带有强调色边框（强制颜色模式下为 Highlight），键盘焦点会显示焦点环。单元格保留行的角色、焦点、选择和事件处理，方向键和输入查找按 DOM 顺序到达它们。通过将组或组内的包装元素设为网格来布局。不渲染任何内容的 children（包括只含空内容的数组）保持为行；元素总会生成单元格，即使是片段或返回 null 的组件。以背景色绘制的图块需要 `forcedColorAdjust: 'none'`，才能在强制颜色模式下保留颜色。单元格中不显示 icon、description 和 endContent。",
    ref: '转发到行根元素（带 role="menuitemradio" 的元素）的 ref。',
  },
};

export const docsDense = {
  name: 'DropdownMenuRadioItem',
  isHiddenFromOverview: true,
  displayName: 'Dropdown Menu Radio Item',
  description: 'one option in a DropdownMenuRadioGroup (menuitemradio)',
  propDescriptions: {
    value: "item's value within the group (matched vs group value)",
    label: 'primary label text',
    description: 'secondary text below label',
    icon: 'icon before label',
    isDisabled:
      'disabled; aria-disabled, blocks selection, skipped by arrow keys',
    endContent: 'content after label+description',
    children:
      'drawn as a cell (tile, swatch, icon) instead of the row: no radio mark, named by label, accent border when checked, focus ring on keyboard focus; arrows reach cells in DOM order; lay out via group/wrapper grid; non-rendering children (arrays too) stay a row, any element is a cell; background-colour tiles need forcedColorAdjust none',
    ref: 'forwarded to the row root (the role="menuitemradio" element)',
  },
};
