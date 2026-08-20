// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @type {import('@astryxdesign/cli/authoring').ComponentDoc} */

export const docs = {
  name: 'DateInputMobile',
  displayName: 'Date Input (Mobile)',
  category: 'Data Input',
  keywords: [
    'date',
    'picker',
    'calendar',
    'mobile',
    'touch',
    'scroll',
    'snap',
    'wheel',
    'month',
    'year',
  ],
  props: [
    {
      name: 'label',
      type: 'string',
      description: 'Label for the field. Required for accessibility.',
      required: true,
    },
    {
      name: 'value',
      type: 'ISODateString',
      description: 'The selected date, as YYYY-MM-DD.',
    },
    {
      name: 'onChange',
      type: '(value: ISODateString | undefined) => void',
      description:
        'Fired with the new date when a day is tapped, or undefined when the field is cleared.',
    },
    {
      name: 'presentation',
      type: "'sheet' | 'inline'",
      description:
        "How the picker is presented. 'sheet' is a tappable field that opens the picker in a BottomSheet; 'inline' is the picker on its own, framed, with no field and no sheet.",
      default: "'sheet'",
    },
    {
      name: 'min',
      type: 'ISODateString',
      description:
        'Earliest selectable date. Also stops the scroller and disables earlier rows on the wheels.',
    },
    {
      name: 'max',
      type: 'ISODateString',
      description:
        'Latest selectable date. Also stops the scroller and disables later rows on the wheels.',
    },
    {
      name: 'dateConstraints',
      type: 'ReadonlyArray<(date: Date) => boolean>',
      description:
        'Extra constraints. A date is disabled if ANY function returns false. Receives a native Date, matching Calendar and DateInput.',
    },
    {
      name: 'weekStartsOn',
      type: '0 | 1 | 2 | 3 | 4 | 5 | 6',
      description: 'First column of the week. 0 is Sunday.',
      default: '0',
    },
    {
      name: 'format',
      type: "'date' | 'date_long' | 'date_weekday' | 'system_date'",
      description:
        "How the committed value reads in the closed field. Shares Timestamp's date vocabulary, so the same literal renders the same shape across components.",
      default: "'date_long'",
    },
    {
      name: 'hasClear',
      type: 'boolean',
      description: 'Show a clear button in the field once a date is set.',
      default: 'false',
    },
    {
      name: 'isDisabled',
      type: 'boolean',
      description: 'Disables the field; the picker cannot be opened.',
      default: 'false',
    },
    {
      name: 'isRequired',
      type: 'boolean',
      description: 'Marks the field required. Mutually exclusive with isOptional.',
      default: 'false',
    },
    {
      name: 'isOptional',
      type: 'boolean',
      description: 'Marks the field optional. Mutually exclusive with isRequired.',
      default: 'false',
    },
    {
      name: 'isLabelHidden',
      type: 'boolean',
      description:
        'Visually hides the label; it stays available to screen readers.',
      default: 'false',
    },
    {
      name: 'description',
      type: 'string',
      description: 'Help text between the label and the field.',
    },
    {
      name: 'status',
      type: 'InputStatus',
      description:
        'Status type and message, rendered by Field exactly as on other inputs.',
    },
    {
      name: 'labels',
      type: 'Partial<DateInputMobileLabels>',
      description:
        "Overrides for the component's own strings: placeholder, today, done, chooseMonthYear, month, year, dialog, clear. Lab components carry no translation catalog, so these are props with English defaults until the component graduates to core.",
    },
  ],
  usage: {
    description:
      'The touch counterpart to DateInput. DateInput is a text field with a calendar popover, a shape built around a keyboard; this one has no text entry at all. The surface IS the calendar: one month fills a fixed-height scrollport, months are chosen by scrolling through them, and the far jumps that scrolling is bad at live behind the header title as a month wheel and a year wheel. Use it on touch surfaces and in mobile web views; use DateInput on the desktop, where typing a date is faster than any picker.',
    bestPractices: [
      {
        guidance: true,
        description:
          'Use presentation="sheet" in a form: the field reads like every other input and the picker only costs screen when it is wanted.',
      },
      {
        guidance: true,
        description:
          'Use presentation="inline" when picking a date IS the screen — a booking step, a filter panel — so there is no sheet to open first.',
      },
      {
        guidance: true,
        description:
          'Set min and max when the range is genuinely bounded. Unbounded, the scroller reaches a century each way and the year wheel is a hundred rows.',
      },
      {
        guidance: false,
        description:
          'Reach for this on the desktop. Scrolling months is slower than typing a date, and the 44px rows waste space a pointer does not need.',
      },
      {
        guidance: false,
        description:
          'Put it in a container shorter than the picker. It is a fixed height by design — that is what makes the snapping exact — so it does not compress.',
      },
      {
        guidance: false,
        description:
          'Add your own month chevrons around it. Scrolling is the month control; a second one just competes with the gesture.',
      },
    ],
  },
  anatomy: [
    {
      name: 'Field',
      description:
        'Label, description and status, shared with every other input (presentation="sheet" only).',
    },
    {
      name: 'Trigger',
      description:
        'The closed field: calendar icon, the formatted date or the placeholder, and an optional clear button. Named for assistive technology from the label AND the value, so the chosen date is announced.',
    },
    {
      name: 'Header',
      description:
        'The month and year, as a button that swaps the calendar for the wheels, plus Today (or Done while the wheels are up).',
    },
    {
      name: 'Weekday row',
      description:
        'Decorative and outside the scroller, so it does not scroll away with the month. Each day carries its weekday in its accessible name instead.',
    },
    {
      name: 'Month scroller',
      description:
        'The continuous surface: equal-height month panes, each snapped to the top of the scrollport.',
    },
    {
      name: 'Wheels',
      description:
        'A month wheel and a year wheel occupying the same box as the calendar, so opening them never changes the height.',
    },
  ],
  implementationNotes: [
    'One month per screen. Every pane is exactly the height of the scrollport and snaps to its start (scroll-snap-type: y mandatory + scroll-snap-align: start), which is what makes the picker a fixed height and leaves no resting position showing half of two months.',
    'Every pane is a six-row grid, including months that only need four or five. A pane whose height depended on its contents would make snap offsets differ month to month.',
    'The list is a century in each direction but only about seven panes are ever mounted: a spacer holds the full scroll height and the visible panes are positioned into it absolutely. Nothing is stitched or recycled mid-scroll, so snap offsets stay constant and momentum is never interrupted — the failure mode of the usual "append months at the edge" approach.',
    'A jump beyond the mounted window (Today, a wheel commit) mounts the target pane first and scrolls on the next layout pass. Scrolling straight there would land where no snap area exists, and mandatory snapping would drag it back to the nearest mounted pane — visibly the wrong month.',
    'The wheels stay mounted behind the calendar and vice versa (visibility, not display), so the scroller keeps its offset across the round trip and a wheel commit can steer it while it is hidden. The hidden panel is also inert.',
    'The wheel falloff is a CSS scroll-driven animation on a view() timeline, guarded by @supports — a browser without animation-timeline would otherwise play the same keyframes once on the document timeline. It rides an inner element, never the row: a snap area is the TRANSFORMED border box, so animating the row would move the positions the wheel is snapping to.',
    'Commit-on-rest uses scrollend where it exists and a quiet-period timer where it does not — mobile Safari below 26 has no scrollend, and that is the browser this component targets.',
    'Both scrollers state box-sizing: border-box themselves. clientHeight is the pane height, the snap offsets and the virtualization all at once, and the reset that would otherwise supply it is zero-specificity :where().',
    'Keyboard: one tab stop per month pane, arrows move by day and week across month boundaries, Home/End move within the displayed week, and the wheels are listboxes with arrow/Home/End/PageUp/PageDown.',
  ],
  theming: {
    description:
      'Two CSS variables drive the whole geometry; everything else derives from them.',
    variables: [
      {
        name: '--date-input-mobile-day-size',
        default: '44px',
        description:
          'Height of a day row and the minimum tap target of a day. The pane (and so the picker body, and the wheel body) is six of these.',
      },
      {
        name: '--date-input-mobile-wheel-item-size',
        default: '40px',
        description: 'Height of a wheel row.',
      },
    ],
  },
  examples: [
    {
      name: 'Basic',
      description: 'A field that opens the picker in a sheet.',
      code: `<DateInputMobile label="Event date" value={date} onChange={setDate} />`,
    },
    {
      name: 'Inline',
      description: 'The picker on its own, with no field and no sheet.',
      code: `<DateInputMobile
  label="Event date"
  isLabelHidden
  presentation="inline"
  value={date}
  onChange={setDate}
/>`,
    },
    {
      name: 'Bounded',
      description: 'min and max stop the scroller and the wheels together.',
      code: `<DateInputMobile
  label="Delivery date"
  min="2026-02-01"
  max="2026-05-31"
  value={date}
  onChange={setDate}
/>`,
    },
    {
      name: 'Weekdays only',
      description: 'Custom constraints, and a Monday-first week.',
      code: `<DateInputMobile
  label="Appointment"
  weekStartsOn={1}
  dateConstraints={[d => d.getDay() !== 0 && d.getDay() !== 6]}
  value={date}
  onChange={setDate}
/>`,
    },
  ],
};

/** @type {import('@astryxdesign/cli/authoring').ComponentDoc} */
export const docsZh = {
  name: 'DateInputMobile',
  displayName: '日期选择器（移动端）',
  props: [
    {
      name: 'label',
      type: 'string',
      description: '字段标签。无障碍访问必填。',
      required: true,
    },
    {
      name: 'value',
      type: 'ISODateString',
      description: '选中的日期，格式为 YYYY-MM-DD。',
    },
    {
      name: 'onChange',
      type: '(value: ISODateString | undefined) => void',
      description: '点选某一天时触发；清除时传入 undefined。',
    },
    {
      name: 'presentation',
      type: "'sheet' | 'inline'",
      description:
        "呈现方式。'sheet' 为可点击字段，在底部弹层中打开选择器；'inline' 直接展示带边框的选择器，没有字段也没有弹层。",
      default: "'sheet'",
    },
    {
      name: 'min',
      type: 'ISODateString',
      description: '最早可选日期。同时限制滚动范围并禁用滚轮上更早的行。',
    },
    {
      name: 'max',
      type: 'ISODateString',
      description: '最晚可选日期。同时限制滚动范围并禁用滚轮上更晚的行。',
    },
    {
      name: 'dateConstraints',
      type: 'ReadonlyArray<(date: Date) => boolean>',
      description:
        '附加约束。任一函数返回 false 即禁用该日期。参数为原生 Date，与 Calendar、DateInput 一致。',
    },
    {
      name: 'weekStartsOn',
      type: '0 | 1 | 2 | 3 | 4 | 5 | 6',
      description: '一周的第一列。0 表示周日。',
      default: '0',
    },
    {
      name: 'format',
      type: "'date' | 'date_long' | 'date_weekday' | 'system_date'",
      description:
        '已选日期在收起状态下的显示格式。与 Timestamp 共用同一套日期格式词汇。',
      default: "'date_long'",
    },
    {
      name: 'hasClear',
      type: 'boolean',
      description: '已选日期后在字段中显示清除按钮。',
      default: 'false',
    },
    {
      name: 'isDisabled',
      type: 'boolean',
      description: '禁用字段，无法打开选择器。',
      default: 'false',
    },
    {
      name: 'isRequired',
      type: 'boolean',
      description: '标记为必填。与 isOptional 互斥。',
      default: 'false',
    },
    {
      name: 'isOptional',
      type: 'boolean',
      description: '标记为选填。与 isRequired 互斥。',
      default: 'false',
    },
    {
      name: 'isLabelHidden',
      type: 'boolean',
      description: '视觉上隐藏标签，屏幕阅读器仍可读取。',
      default: 'false',
    },
    {
      name: 'description',
      type: 'string',
      description: '标签与字段之间的说明文字。',
    },
    {
      name: 'status',
      type: 'InputStatus',
      description: '状态类型与提示信息，由 Field 按其他输入控件同样的方式呈现。',
    },
    {
      name: 'labels',
      type: 'Partial<DateInputMobileLabels>',
      description:
        '组件自身文案的覆盖项：placeholder、today、done、chooseMonthYear、month、year、dialog、clear。实验组件不携带翻译词条，因此以属性形式提供英文默认值。',
    },
  ],
  usage: {
    description:
      'DateInput 的触屏版本。DateInput 是围绕键盘设计的文本框加日历浮层；本组件完全没有文本输入：界面本身就是日历，一屏一个月，靠滚动切换月份，而滚动不擅长的大跨度跳转则藏在标题按钮后的月份与年份滚轮里。触屏界面与移动端网页使用本组件；桌面端仍用 DateInput，直接输入日期更快。',
    bestPractices: [
      {
        guidance: true,
        description:
          '表单中使用 presentation="sheet"：字段外观与其他输入一致，需要时才占用屏幕空间。',
      },
      {
        guidance: true,
        description:
          '当选日期本身就是整屏任务（预订步骤、筛选面板）时使用 presentation="inline"，省去先打开弹层的一步。',
      },
      {
        guidance: true,
        description:
          '范围确实有界时设置 min 与 max。不设置时滚动范围为前后各一个世纪，年份滚轮会有上百行。',
      },
      {
        guidance: false,
        description:
          '在桌面端使用。滚动选月份比输入日期慢，44px 的行高对指针设备也是浪费。',
      },
      {
        guidance: false,
        description:
          '放进比选择器更矮的容器。固定高度是刻意设计——精确吸附正依赖于此——因此不会压缩。',
      },
      {
        guidance: false,
        description: '再自行添加月份箭头。滚动就是月份控件，另加一套只会与手势冲突。',
      },
    ],
  },
};

/** @type {import('@astryxdesign/cli/authoring').ComponentDoc} */
export const docsDense = {
  description:
    'Touch date picker: continuous snap-paged months in a fixed-height surface, with month/year wheels behind the header title.',
  usage: {
    description:
      'Touch counterpart to DateInput (which is a text field + popover, built for a keyboard). No text entry: the surface IS the calendar, one month per screen, months chosen by scrolling. Header title swaps the calendar for month + year wheels for far jumps. Mobile/touch only; DateInput on desktop.',
    bestPractices: [
      { guidance: true, description: 'presentation="sheet" in forms; presentation="inline" when picking a date is the whole screen.' },
      { guidance: true, description: 'Set min/max when the range is bounded — unbounded reaches a century each way.' },
      { guidance: false, description: 'Use on desktop; typing a date beats scrolling months.' },
      { guidance: false, description: 'Put it in a container shorter than the picker — fixed height is what makes snapping exact.' },
      { guidance: false, description: 'Add month chevrons around it; scrolling is the month control.' },
    ],
  },
  propDescriptions: {
    label: 'Field label. Required.',
    value: 'Selected date, YYYY-MM-DD.',
    onChange: 'Fired with the new date, or undefined when cleared.',
    presentation: "'sheet' (field + BottomSheet) or 'inline' (framed picker). Default 'sheet'.",
    min: 'Earliest selectable date; also bounds scroller and wheels.',
    max: 'Latest selectable date; also bounds scroller and wheels.',
    dateConstraints: 'Array of (Date) => boolean; a date is disabled if any returns false.',
    weekStartsOn: '0 | 1 | 2 | 3 | 4 | 5 | 6, first column of the week. Default 0 (Sunday).',
    format: "Closed-field format: 'date' | 'date_long' | 'date_weekday' | 'system_date'. Default 'date_long'.",
    hasClear: 'Clear button in the field once a date is set. Default false.',
    isDisabled: 'Disables the field; picker cannot open. Default false.',
    isRequired: 'Marks required. Default false.',
    isOptional: 'Marks optional. Default false.',
    isLabelHidden: 'Hides the label visually. Default false.',
    description: 'Help text between label and field.',
    status: 'InputStatus type + message, rendered by Field.',
    labels: 'Partial<DateInputMobileLabels> overriding placeholder/today/done/chooseMonthYear/month/year/dialog/clear.',
  },
};
