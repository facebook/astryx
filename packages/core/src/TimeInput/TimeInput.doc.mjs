/** @type {import('../docs-types').ComponentDoc} */

export const docs = {
  name: 'TimeInput',
  description:
    'Time input with free-text entry, text parsing, and arrow-key navigation.',
  features: [
    'Accepts free-text time entry and parses common formats (e.g. "2:30 PM", "14:30")',
    'Supports 12-hour and 24-hour display formats',
    'Arrow-up / arrow-down adjust the time by a configurable minute increment',
    'Optional seconds display via hasSeconds',
    'Optional clear button via hasClear',
    'Min / max range constraints reject out-of-range values',
    'Async action support via onChangeAction with optimistic UI and loading spinner',
    'Accessible — label, description, and status message are wired to aria-describedby; aria-required and aria-invalid reflect field state',
  ],
  examples: [
    {
      label: 'Basic',
      code: `<XDSTimeInput
  label="Start time"
  value={time}
  onChange={setTime}
/>`,
    },
    {
      label: '24-hour format with clear button',
      code: `<XDSTimeInput
  label="Meeting time"
  value={time}
  onChange={setTime}
  hourFormat="24h"
  hasClear
/>`,
    },
    {
      label: 'Min / max constraints',
      code: `<XDSTimeInput
  label="Business hours"
  value={time}
  onChange={setTime}
  min="09:00"
  max="17:00"
/>`,
    },
    {
      label: 'With seconds and error status',
      code: `<XDSTimeInput
  label="Precise time"
  value={time}
  onChange={setTime}
  hasSeconds
  status={{type: 'error', message: 'Invalid time'}}
/>`,
    },
    {
      label: 'Async action with optimistic update',
      code: `<XDSTimeInput
  label="Scheduled time"
  value={time}
  onChange={setTime}
  onChangeAction={async (value) => {
    await saveTime(value);
  }}
/>`,
    },
  ],
  props: [
    {
      name: 'label',
      type: 'string',
      description: 'Label text for the input (required for accessibility).',
      required: true,
    },
    {
      name: 'isLabelHidden',
      type: 'boolean',
      description:
        'Visually hides the label while keeping it accessible to screen readers.',
      default: 'false',
    },
    {
      name: 'description',
      type: 'string',
      description: 'Description text displayed between the label and input.',
    },
    {
      name: 'isOptional',
      type: 'boolean',
      description:
        'Shows an "(optional)" indicator next to the label. Mutually exclusive with isRequired.',
      default: 'false',
    },
    {
      name: 'isRequired',
      type: 'boolean',
      description:
        'Marks the field as required and sets aria-required. Mutually exclusive with isOptional.',
      default: 'false',
    },
    {
      name: 'isDisabled',
      type: 'boolean',
      description: 'Disables the input and suppresses interactions.',
      default: 'false',
    },
    {
      name: 'value',
      type: 'ISOTimeString',
      description: 'Controlled time value in ISO format (HH:MM or HH:MM:SS).',
    },
    {
      name: 'onChange',
      type: '(value: ISOTimeString | undefined) => void',
      description:
        'Callback fired when the time changes. Receives undefined when the input is cleared.',
    },
    {
      name: 'onChangeAction',
      type: '(value: ISOTimeString | undefined) => void | Promise<void>',
      description:
        'Async action fired after onChange. Wrapped in a React transition to provide optimistic UI; triggers the loading spinner while pending.',
    },
    {
      name: 'isLoading',
      type: 'boolean',
      description: 'Puts the input into a loading state, displaying a spinner.',
      default: 'false',
    },
    {
      name: 'min',
      type: 'ISOTimeString',
      description:
        'Minimum selectable time in ISO format. Values outside the range are rejected.',
    },
    {
      name: 'max',
      type: 'ISOTimeString',
      description:
        'Maximum selectable time in ISO format. Values outside the range are rejected.',
    },
    {
      name: 'hasSeconds',
      type: 'boolean',
      description: 'Includes seconds in the time display and parsing.',
      default: 'false',
    },
    {
      name: 'hasClear',
      type: 'boolean',
      description:
        'Shows a clear button when a value is set and the input is not disabled.',
      default: 'false',
    },
    {
      name: 'hourFormat',
      type: "'12h' | '24h'",
      description:
        "Controls the display format. '12h' shows AM/PM (e.g. '2:30 PM'); '24h' uses 24-hour notation (e.g. '14:30').",
      default: "'12h'",
    },
    {
      name: 'increment',
      type: 'number',
      description:
        'Number of minutes to add or subtract when the user presses the up or down arrow key.',
      default: '1',
    },
    {
      name: 'placeholder',
      type: 'string',
      description:
        'Placeholder text shown when no time is selected. When the input is focused and empty, a format hint overrides this text.',
      default: "'Select a time'",
    },
    {
      name: 'size',
      type: "'sm' | 'md' | 'lg'",
      description: 'Controls the height of the input element.',
      default: "'md'",
    },
    {
      name: 'status',
      type: 'XDSInputStatus',
      description:
        'Status indicator that colors the border and displays an icon. When a message is provided it is rendered below the input.',
    },
    {
      name: 'labelTooltip',
      type: 'string',
      description:
        'Tooltip text rendered as an info icon at the end of the label row.',
    },
  ],
  theming: {
    targets: [
      {className: 'xds-date-input', visualProps: ['size']},
    ],
  },
  accessibility: [
    'The visible label is associated with the input via htmlFor / id.',
    'isLabelHidden visually hides the label while keeping it in the accessibility tree.',
    'description and status.message are linked to the input via aria-describedby.',
    'aria-required is set when isRequired is true.',
    'aria-invalid is set when status.type is "error".',
    'aria-busy reflects the loading / optimistic-pending state.',
    'The clear button has an explicit aria-label of "Clear time".',
  ],
  keyboard:
    'ArrowUp / ArrowDown adjust the current time by the configured increment in minutes. Typing a time string in common formats (e.g. "2:30 PM", "14:30") is parsed on blur. Pressing the clear button returns focus to the input.',
};

/** @type {import('../docs-types').ComponentDoc} */
export const docsZh = {
  name: 'TimeInput',
  description:
    '支持自由文本输入、文本解析和方向键导航的时间输入组件。',
  features: [
    '接受自由文本时间输入并解析常见格式（例如 "2:30 PM"、"14:30"）',
    '支持 12 小时和 24 小时显示格式',
    '上/下方向键按可配置的分钟增量调整时间',
    '通过 hasSeconds 可选显示秒',
    '通过 hasClear 可选清除按钮',
    '最小/最大范围约束拒绝超出范围的值',
    '通过 onChangeAction 支持异步操作，带乐观 UI 和加载旋转器',
    '无障碍 — 标签、描述和状态消息通过 aria-describedby 关联；aria-required 和 aria-invalid 反映字段状态',
  ],
  examples: [
    {
      label: '基础用法',
      code: `<XDSTimeInput
  label="Start time"
  value={time}
  onChange={setTime}
/>`,
    },
    {
      label: '24 小时格式带清除按钮',
      code: `<XDSTimeInput
  label="Meeting time"
  value={time}
  onChange={setTime}
  hourFormat="24h"
  hasClear
/>`,
    },
    {
      label: '最小/最大约束',
      code: `<XDSTimeInput
  label="Business hours"
  value={time}
  onChange={setTime}
  min="09:00"
  max="17:00"
/>`,
    },
    {
      label: '带秒和错误状态',
      code: `<XDSTimeInput
  label="Precise time"
  value={time}
  onChange={setTime}
  hasSeconds
  status={{type: 'error', message: 'Invalid time'}}
/>`,
    },
    {
      label: '带乐观更新的异步操作',
      code: `<XDSTimeInput
  label="Scheduled time"
  value={time}
  onChange={setTime}
  onChangeAction={async (value) => {
    await saveTime(value);
  }}
/>`,
    },
  ],
  props: [
    {
      name: 'label',
      type: 'string',
      description: '输入框的标签文本（无障碍性所必需）。',
      required: true,
    },
    {
      name: 'isLabelHidden',
      type: 'boolean',
      description:
        '视觉上隐藏标签，同时保持屏幕阅读器的无障碍性。',
      default: 'false',
    },
    {
      name: 'description',
      type: 'string',
      description: '显示在标签和输入框之间的描述文本。',
    },
    {
      name: 'isOptional',
      type: 'boolean',
      description:
        '在标签旁显示"（可选）"指示器。与 isRequired 互斥。',
      default: 'false',
    },
    {
      name: 'isRequired',
      type: 'boolean',
      description:
        '将字段标记为必填并设置 aria-required。与 isOptional 互斥。',
      default: 'false',
    },
    {
      name: 'isDisabled',
      type: 'boolean',
      description: '禁用输入框并抑制交互。',
      default: 'false',
    },
    {
      name: 'value',
      type: 'ISOTimeString',
      description: 'ISO 格式的受控时间值（HH:MM 或 HH:MM:SS）。',
    },
    {
      name: 'onChange',
      type: '(value: ISOTimeString | undefined) => void',
      description:
        '时间变化时触发的回调。输入被清除时接收 undefined。',
    },
    {
      name: 'onChangeAction',
      type: '(value: ISOTimeString | undefined) => void | Promise<void>',
      description:
        '在 onChange 之后触发的异步操作。包装在 React transition 中以提供乐观 UI；挂起时触发加载旋转器。',
    },
    {
      name: 'isLoading',
      type: 'boolean',
      description: '使输入框进入加载状态，显示旋转器。',
      default: 'false',
    },
    {
      name: 'min',
      type: 'ISOTimeString',
      description:
        'ISO 格式的最小可选时间。超出范围的值将被拒绝。',
    },
    {
      name: 'max',
      type: 'ISOTimeString',
      description:
        'ISO 格式的最大可选时间。超出范围的值将被拒绝。',
    },
    {
      name: 'hasSeconds',
      type: 'boolean',
      description: '在时间显示和解析中包含秒。',
      default: 'false',
    },
    {
      name: 'hasClear',
      type: 'boolean',
      description:
        '当有值且输入框未被禁用时显示清除按钮。',
      default: 'false',
    },
    {
      name: 'hourFormat',
      type: "'12h' | '24h'",
      description:
        "控制显示格式。'12h' 显示 AM/PM（例如 '2:30 PM'）；'24h' 使用 24 小时制（例如 '14:30'）。",
      default: "'12h'",
    },
    {
      name: 'increment',
      type: 'number',
      description:
        '用户按上或下方向键时增加或减少的分钟数。',
      default: '1',
    },
    {
      name: 'placeholder',
      type: 'string',
      description:
        '未选择时间时显示的占位符文本。当输入框聚焦且为空时，格式提示会覆盖此文本。',
      default: "'Select a time'",
    },
    {
      name: 'size',
      type: "'sm' | 'md' | 'lg'",
      description: '控制输入框元素的高度。',
      default: "'md'",
    },
    {
      name: 'status',
      type: 'XDSInputStatus',
      description:
        '为边框着色并显示图标的状态指示器。当提供消息时，消息渲染在输入框下方。',
    },
    {
      name: 'labelTooltip',
      type: 'string',
      description:
        '在标签行末尾以信息图标形式渲染的工具提示文本。',
    },
  ],
  theming: {
    targets: [
      {className: 'xds-date-input', visualProps: ['size']},
    ],
  },
  accessibility: [
    '可见标签通过 htmlFor / id 与输入框关联。',
    'isLabelHidden 视觉上隐藏标签，同时保持在无障碍树中。',
    'description 和 status.message 通过 aria-describedby 与输入框关联。',
    '当 isRequired 为 true 时设置 aria-required。',
    '当 status.type 为 "error" 时设置 aria-invalid。',
    'aria-busy 反映加载/乐观更新挂起状态。',
    '清除按钮具有明确的 aria-label "Clear time"。',
  ],
  keyboard:
    '上/下方向键按配置的分钟增量调整当前时间。以常见格式（例如 "2:30 PM"、"14:30"）输入时间字符串会在失焦时解析。按清除按钮将焦点返回到输入框。',
};

/** @type {string} */
export const docsDense = `import{XDSTimeInput}from'@xds/core/TimeInput' //time input w/ parsing+arrow keys
P label:string! label text (required for a11y) | isLabelHidden:boolean='false' visually hides label, keeps screen reader access | description:string text between label+input | isOptional:boolean='false' shows "(optional)"; mutually exclusive w/ isRequired | isRequired:boolean='false' marks required+aria-required; mutually exclusive w/ isOptional | isDisabled:boolean='false' disables input, suppresses interactions | value:ISOTimeString controlled time in ISO format (HH:MM or HH:MM:SS) | onChange:(value: ISOTimeString | undefined) => void fired on time change; undefined when cleared | onChangeAction:(value: ISOTimeString | undefined) => void | Promise<void> async action after onChange in React transition; triggers spinner | isLoading:boolean='false' loading state w/ spinner | min:ISOTimeString min selectable time; out-of-range rejected | max:ISOTimeString max selectable time; out-of-range rejected | hasSeconds:boolean='false' includes seconds in display+parsing | hasClear:boolean='false' clear button when value set+not disabled | hourFormat:'12h' | '24h'='12h' display format; 12h shows AM/PM, 24h uses 24-hour notation | increment:number='1' minutes to add/subtract on arrow up/down | placeholder:string='Select a time' placeholder when empty; focused+empty shows format hint | size:'sm' | 'md' | 'lg'='md' input height | status:XDSInputStatus colored border+icon; message rendered below input | labelTooltip:string tooltip as info icon at label row end
X <XDSTimeInput\\n  label="Start time"\\n  value={time}\\n  onChange={setTime}\\n/> | <XDSTimeInput\\n  label="Meeting time"\\n  value={time}\\n  onChange={setTime}\\n  hourFormat="24h"\\n  hasClear\\n/> | <XDSTimeInput\\n  label="Business hours"\\n  value={time}\\n  onChange={setTime}\\n  min="09:00"\\n  max="17:00"\\n/> | <XDSTimeInput\\n  label="Precise time"\\n  value={time}\\n  onChange={setTime}\\n  hasSeconds\\n  status={{type: 'error', message: 'Invalid time'}}\\n/> | <XDSTimeInput\\n  label="Scheduled time"\\n  value={time}\\n  onChange={setTime}\\n  onChangeAction={async (value) => {\\n    await saveTime(value);\\n  }}\\n/>
A Visible label associated w/ input via htmlFor/id|isLabelHidden hides label visually, keeps in a11y tree|description+status.message linked via aria-describedby|aria-required set when isRequired|aria-invalid set when status.type is "error"|aria-busy reflects loading/optimistic-pending state|clear button has aria-label "Clear time"
K ArrowUp/ArrowDown=adjust time by configured increment in minutes;typing common formats (e.g. "2:30 PM", "14:30")=parsed on blur;clear button press=returns focus to input`;
