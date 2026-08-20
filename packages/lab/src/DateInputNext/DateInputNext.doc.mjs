// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @type {import('@astryxdesign/cli/authoring').ComponentDoc} */

export const docs = {
  name: 'DateInputNext',
  displayName: 'Date Input (Responsive)',
  category: 'Data Input',
  keywords: [
    'date',
    'picker',
    'calendar',
    'mobile',
    'responsive',
    'touch',
    'scroll',
    'snap',
    'wheel',
    'month',
    'year',
  ],
  // The prop table is DateInput's, deliberately: `DateInputNextProps` is an
  // ALIAS of `DateInputProps`, not a copy, so a consumer swapping the import
  // needs no second table and this file cannot drift out of step with one.
  // Listed here are only the props whose BEHAVIOR differs on the touch
  // surface — everything else does exactly what `astryx component DateInput`
  // says it does.
  props: [
    {
      name: 'numberOfMonths',
      type: '1 | 2',
      description:
        'Desktop only. The touch surface is a single continuously scrolling column, where a second month is just the month already one flick away — so the prop is accepted (the types are shared) and ignored there.',
      default: '1',
    },
    {
      name: 'size',
      type: "'sm' | 'md' | 'lg'",
      description:
        'Honored on both surfaces, but floored on a coarse pointer: each size keeps its own height and none can render below a 44px tap target.',
      default: "'md'",
    },
    {
      name: 'placeholder',
      type: 'string',
      description:
        'Shown when no date is selected, on both surfaces. On touch the field cannot be typed into at all, so this is the only text it ever shows empty.',
      default: "'Select a date'",
    },
  ],
  usage: {
    description:
      'A drop-in `DateInput` that picks its own surface. On anything but a narrow touch screen it renders core\'s `DateInput` unchanged. On a narrow touch screen it renders a picker built for a thumb: one month per screen, months chosen by scrolling continuously through them, and month and year wheels behind the header title for the far jumps scrolling is bad at. Its props are `DateInputProps` — the same type, not a copy — so adopting it is a changed import and nothing else.',
    bestPractices: [
      {
        guidance: true,
        description:
          'Use it anywhere you would use DateInput in a product that has mobile users. There is no downside on the desktop: that path IS DateInput.',
      },
      {
        guidance: true,
        description:
          'Set min and max when the range is genuinely bounded. Unbounded, the scroller reaches a century each way and the year wheel is a hundred rows.',
      },
      {
        guidance: true,
        description:
          'Reach for MobileDateField only when the choice is already made — a mobile-only app, or a story that has to show the touch surface on a desktop browser.',
      },
      {
        guidance: false,
        description:
          'Branch on your own media query and render DateInput or MobileDateField yourself; that is this component, and it gets the "narrow AND touch" condition right.',
      },
      {
        guidance: false,
        description:
          'Put the touch surface in a container shorter than the picker. It is a fixed height by design — that is what makes the snapping exact — so it does not compress.',
      },
      {
        guidance: false,
        description:
          'Add your own month chevrons around it. Scrolling is the month control; a second one just competes with the gesture.',
      },
    ],
    anatomy: [
      {
        name: 'Field',
        required: true,
        description:
          "Label, description and status — Field's, identical on both surfaces.",
      },
      {
        name: 'Closed field',
        required: true,
        description:
          'A real `<input>` on both surfaces, so `ref` is honestly an input ref and the label associates natively. On touch it is readOnly with inputMode="none", which is what keeps the virtual keyboard from covering the sheet it would fill in.',
      },
      {
        name: 'Sheet',
        required: false,
        description:
          'A BottomSheet holding the picker, sized to hug it (touch surface only; the desktop surface uses DateInput\'s popover).',
      },
      {
        name: 'Header',
        required: false,
        description:
          'The month and year, as a button that swaps the calendar for the wheels, plus Today (or Done while the wheels are up).',
      },
      {
        name: 'Weekday row',
        required: false,
        description:
          'Decorative and outside the scroller, so it does not scroll away with the month. Each day carries its weekday in its accessible name instead.',
      },
      {
        name: 'Month scroller',
        required: false,
        description:
          'The continuous surface: equal-height month panes, each snapped to the top of the scrollport.',
      },
      {
        name: 'Wheels',
        required: false,
        description:
          'A month wheel and a year wheel occupying the same box as the calendar, so opening them never changes the height.',
      },
    ],
  },
  theming: {
    // The field wrapper deliberately shares DateInput's target, so one theme
    // rule reaches both surfaces; only the picker header is its own.
    targets: [
      {className: 'astryx-date-input', visualProps: ['size', 'status', 'disabled']},
      {className: 'astryx-date-input-toggle-icon', states: ['expanded', 'collapsed']},
      {className: 'astryx-date-input-next-title', states: ['expanded', 'collapsed']},
    ],
    // Two variables drive the touch picker's whole geometry; everything else
    // derives from them. The desktop surface is DateInput and themes exactly
    // as DateInput does.
    vars: [
      {
        name: '--date-input-next-day-size',
        default: '44px',
        description:
          'Height of a day row, the minimum tap target of a day, and the floor under the closed field on a coarse pointer. The pane (and so the picker body, and the wheel body) is six of these.',
      },
      {
        name: '--date-input-next-wheel-item-size',
        default: '40px',
        description: 'Height of a wheel row.',
      },
    ],
  },
  examples: [
    {
      label: 'Basic — identical to a DateInput call, because the props are DateInput\'s',
      code: `<DateInputNext label="Event date" value={date} onChange={setDate} />`,
    },
    {
      label: 'Bounded — min and max stop the scroller and the wheels together',
      code: `<DateInputNext
  label="Delivery date"
  min="2026-02-01"
  max="2026-05-31"
  value={date}
  onChange={setDate}
/>`,
    },
    {
      label: 'Weekdays only — custom constraints, and a Monday-first week',
      code: `<DateInputNext
  label="Appointment"
  weekStartsOn="mon"
  dateConstraints={[d => d.getDay() !== 0 && d.getDay() !== 6]}
  value={date}
  onChange={setDate}
/>`,
    },
    {
      label:
        'Touch surface, unconditionally — for a mobile-only app, or a story that must show the picker on a desktop browser',
      code: `<MobileDateField label="Event date" value={date} onChange={setDate} />`,
    },
  ],
};

/** @type {import('@astryxdesign/cli/authoring').ComponentDoc} */
export const docsZh = {
  name: 'DateInputNext',
  displayName: '日期选择器（响应式）',
  props: [
    {
      name: 'numberOfMonths',
      type: '1 | 2',
      description:
        '仅桌面端生效。触屏界面是单列连续滚动，第二个月正是轻扫一下就能到达的那个月，因此该属性在触屏端被接受（类型共用）但忽略。',
      default: '1',
    },
    {
      name: 'size',
      type: "'sm' | 'md' | 'lg'",
      description:
        '两种界面都生效，但在粗指针设备上有下限：各尺寸保留自身高度，且都不会小于 44px 的可点击区域。',
      default: "'md'",
    },
    {
      name: 'placeholder',
      type: 'string',
      description:
        '未选择日期时显示，两种界面一致。触屏端字段完全不可输入，因此这是空状态下唯一显示的文本。',
      default: "'Select a date'",
    },
  ],
  usage: {
    description:
      '可直接替换 DateInput 的组件，会自行选择界面形态。除窄屏触控设备外，一律渲染 core 的 DateInput；在窄屏触控设备上渲染为拇指操作而设计的选择器：一屏一个月，通过连续滚动切换月份，标题按钮后的月份与年份滚轮用于滚动不擅长的大跨度跳转。其属性就是 DateInputProps 本身（类型别名，而非副本），因此接入只需改一行 import。',
    bestPractices: [
      {
        guidance: true,
        description:
          '在有移动端用户的产品中，凡是用 DateInput 的地方都可以用它。桌面端没有任何代价——那条分支本身就是 DateInput。',
      },
      {
        guidance: true,
        description:
          '范围确实有界时设置 min 与 max。不设置时滚动范围为前后各一个世纪，年份滚轮会有上百行。',
      },
      {
        guidance: true,
        description:
          '仅在已经确定形态时才使用 MobileDateField：纯移动端应用，或需要在桌面浏览器中展示触屏界面的 story。',
      },
      {
        guidance: false,
        description:
          '自行编写媒体查询在 DateInput 与 MobileDateField 之间分支；这正是本组件的职责，而且它把“窄屏且触控”这个条件判断对了。',
      },
      {
        guidance: false,
        description:
          '把触屏界面放进比选择器更矮的容器。固定高度是刻意设计——精确吸附正依赖于此——因此不会压缩。',
      },
      {
        guidance: false,
        description: '再自行添加月份箭头。滚动就是月份控件，另加一套只会与手势冲突。',
      },
    ],
  },
};

/** @type {import('@astryxdesign/cli/authoring').ComponentTranslationDoc} */
export const docsDense = {
  description:
    'Drop-in DateInput that picks its surface: core DateInput everywhere, a touch picker (continuous snap-paged months + month/year wheels) on narrow AND coarse-pointer screens.',
  usage: {
    description:
      'Props ARE DateInputProps (type alias, not a copy) — adopting it is a changed import. Switch is `(max-width: 768px) and (pointer: coarse)`: touch alone catches a touchscreen laptop, narrow alone a half-width window, and on both typing beats scrolling. Both surfaces render the same closed field, so the post-hydration swap is invisible. MobileDateField exports the touch surface unconditionally.',
    bestPractices: [
      { guidance: true, description: 'Use anywhere you use DateInput; the desktop path IS DateInput.' },
      { guidance: true, description: 'Set min/max when the range is bounded — unbounded reaches a century each way.' },
      { guidance: true, description: 'MobileDateField only when the choice is already made (mobile-only app, desktop-browser story).' },
      { guidance: false, description: 'Hand-roll the media query and branch yourself.' },
      { guidance: false, description: 'Put the touch surface in a container shorter than the picker — fixed height is what makes snapping exact.' },
      { guidance: false, description: 'Add month chevrons around it; scrolling is the month control.' },
    ],
  },
  propDescriptions: {
    numberOfMonths: 'Desktop only; the touch scroller is one continuous column. Accepted and ignored there.',
    size: "'sm' | 'md' | 'lg', floored at a 44px tap target on a coarse pointer.",
    placeholder: "Empty-state text on both surfaces. Default 'Select a date'.",
  },
};
