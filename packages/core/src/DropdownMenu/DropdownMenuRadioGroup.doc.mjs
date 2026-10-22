// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @type {import('@astryxdesign/cli/authoring').ComponentDoc} */

export const docs = {
  name: 'DropdownMenuRadioGroup',
  subComponentOf: 'DropdownMenu',
  displayName: 'Dropdown Menu Radio Group',
  isHiddenFromOverview: true,
  description:
    'A controlled, named single-select group of DropdownMenuRadioItem children (role="group" of menuitemradio). Owns value propagation, close policy, root composition, and the menu inter-item gap; the parent DropdownMenu owns keyboard navigation.',
  usage: {
    description:
      'Use DropdownMenuRadioGroup inside compound-mode DropdownMenu when several commands represent one mutually exclusive choice. Keep value in caller state, provide a concise accessible label, and render each choice as DropdownMenuRadioItem.',
    bestPractices: [
      {
        guidance: true,
        description:
          'Keep value controlled and update it from onChange so checked state follows caller data.',
      },
      {
        guidance: true,
        description:
          'Provide a concise label even when aria-labelledby points to visible text; label remains required and supplies the aria-label fallback.',
      },
      {
        guidance: true,
        description:
          'Set hasCloseOnSelect=false only when the menu must stay open to show another selection or an in-place result.',
      },
      {
        guidance: false,
        description:
          'Place buttons, links, checkboxes, or arbitrary menu rows inside the radio group.',
      },
      {
        guidance: false,
        description:
          'Add a second key handler or roving-focus model; DropdownMenu owns keyboard navigation.',
      },
    ],
    anatomy: [
      {
        name: 'Group',
        required: true,
        description:
          'The role="group" root that owns the accessible name, controlled-selection context, close policy, root inputs, and inter-item gap.',
      },
      {
        name: 'Radio items',
        required: true,
        description:
          'DropdownMenuRadioItem children; each child owns its menuitemradio role, checked state, content, and indicator paint.',
      },
    ],
  },
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
      required: true,
    },
    {
      name: 'onChange',
      type: '(value: string) => void',
      description: 'Callback fired when the selected value changes.',
      required: true,
    },
    {
      name: 'label',
      type: 'string',
      description:
        'Accessible name for the group, applied as aria-label so screen readers announce the radios as a named set, e.g. "Sort by". Required unless title is given. An aria-labelledby passed through base props that points at visible text becomes the computed name, while label remains the fallback. With a title, the title names the group instead, so the name holds the visible heading; label (or an aria-label passed through base props) is then ignored, with a development warning when it differs from the text of the title. Without a title, an aria-label passed through base props names the group when label is omitted.',
    },
    {
      name: 'title',
      type: 'ReactNode',
      description:
        'A visible heading above the radios, with the same treatment as a DropdownMenuGroup heading, that names the group through aria-labelledby; an aria-labelledby passed through base props is read after it. With a title, label is optional. A title that renders no text (true, an empty fragment, a component that returns null) counts as no title: no heading shows and the group is named as without one. Give a menu section that holds one radio set this title instead of wrapping the set in a DropdownMenuGroup, so the set is one group with one name rather than two nested groups with the same name.',
    },
    {
      name: 'hasCloseOnSelect',
      type: 'boolean',
      default: 'true',
      description:
        'Whether selecting a value closes the menu. Radio items default to closing on selection (a single-choice commit).',
    },
    {
      name: 'ref',
      type: 'React.Ref<HTMLDivElement>',
      description: 'Ref forwarded to the role="group" root.',
    },
    {
      name: 'children',
      type: 'ReactNode',
      description: 'The DropdownMenuRadioItems that make up the group.',
      required: true,
    },
  ],
};

export const docsZh = {
  name: 'DropdownMenuRadioGroup',
  displayName: 'Dropdown Menu Radio Group',
  description:
    'DropdownMenu 中由调用方控制且有名称的单选组（menuitemradio 的 role="group"）。该组负责值传递、关闭策略、根元素组合和菜单项间距；父 DropdownMenu 负责键盘导航。',
  propDescriptions: {
    value: '组中当前选中的值。尚无选中项时传 undefined。',
    onChange: '所选值变化时触发的回调。',
    label:
      '组的无障碍名称，作为 aria-label 应用，以便屏幕阅读器将单选项作为命名集合朗读，例如“Sort by”。未提供 title 时必需。通过基础属性传入、指向可见文本的 aria-labelledby 会成为计算出的名称，label 作为后备名称。提供 title 时改由 title 命名该组，使名称始终包含可见标题；此时 label（或通过基础属性传入的 aria-label）会被忽略，若其与 title 的文本不同，开发环境会发出警告。未提供 title 且省略 label 时，通过基础属性传入的 aria-label 为该组命名。',
    title:
      '显示在单选项上方的可见标题，样式与 DropdownMenuGroup 的标题相同，并通过 aria-labelledby 为该组命名；通过基础属性传入的 aria-labelledby 会接在其后。提供 title 时 label 可省略。不渲染任何文本的 title（true、空 Fragment、返回 null 的组件）视为未提供：不显示标题，组按未提供 title 时的方式命名。菜单中只包含一组单选项的分区应使用此标题，而不是用 DropdownMenuGroup 包裹该组，这样该组只是一个具有一个名称的组。',
    hasCloseOnSelect: '选择某值是否关闭菜单。默认关闭。',
    ref: '转发到 role="group" 根元素的 ref。',
    children: '组成该组的 DropdownMenuRadioItem。',
  },
};

export const docsDense = {
  name: 'DropdownMenuRadioGroup',
  displayName: 'Dropdown Menu Radio Group',
  description:
    'controlled named menuitemradio group; owns value propagation, close policy, root inputs, and item gap',
  propDescriptions: {
    value: 'selected value (undefined = none)',
    onChange: 'fired when selected value changes',
    label:
      'accessible group name (applied as aria-label); required unless title is given',
    title:
      'visible heading (DropdownMenuGroup treatment) that names the group via aria-labelledby; use it instead of a DropdownMenuGroup around one radio set',
    hasCloseOnSelect: 'close menu on select (default true)',
    ref: 'forwarded to the role="group" root',
    children: 'the DropdownMenuRadioItems',
  },
};
