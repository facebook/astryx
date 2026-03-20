/** @type {import('../docs-types').ComponentDoc} */

export const docs = {
  name: 'Slider',
  description:
    'A slider component for selecting numeric values or ranges with full keyboard and pointer support.',
  features: [
    'Single & range modes: Pass a `number` for single thumb, `[number, number]` for range',
    'Orientation: Supports `horizontal` and `vertical` layouts',
    'Value display: Tooltip (default), inline text, or none',
    'Tick marks: Optional marks at specified positions with labels',
    'Keyboard navigation: Arrow keys, Page Up/Down, Home/End',
    'Drag interaction: Pointer capture for smooth dragging',
    'Custom formatting: `formatValue` function for display and `aria-valuetext`',
    'Field integration: Uses `XDSField` for label, description, required/optional, and status messaging',
    'Accessible: Uses `role="slider"` with full ARIA attributes',
  ],
  examples: [
    {
      label: 'Basic single value',
      code: '<XDSSlider label="Volume" value={50} onChange={setValue} />',
    },
    {
      label: 'Range slider',
      code: `<XDSSlider
  label="Price range"
  value={[20, 80]}
  onChange={setRange}
/>`,
    },
    {
      label: 'With custom formatting',
      code: `<XDSSlider
  label="Temperature"
  value={72}
  onChange={setTemp}
  min={32}
  max={212}
  formatValue={(v) => \`\${v}°F\`}
/>`,
    },
    {
      label: 'With step and marks',
      code: `<XDSSlider
  label="Rating"
  value={3}
  onChange={setRating}
  min={1}
  max={5}
  step={1}
  marks={[
    { value: 1, label: 'Poor' },
    { value: 3, label: 'Average' },
    { value: 5, label: 'Excellent' },
  ]}
/>`,
    },
    {
      label: 'Text value display',
      code: `<XDSSlider
  label="Opacity"
  value={75}
  onChange={setOpacity}
  formatValue={(v) => \`\${v}%\`}
  valueDisplay="text"
/>`,
    },
    {
      label: 'Range with minimum gap',
      code: `<XDSSlider
  label="Date range"
  value={[10, 90]}
  onChange={setDateRange}
  minStepsBetweenThumbs={5}
/>`,
    },
    {
      label: 'With onChangeEnd for committing value',
      code: `<XDSSlider
  label="Brightness"
  value={brightness}
  onChange={setBrightness}
  onChangeEnd={commitBrightness}
/>`,
    },
    {
      label: 'Vertical orientation',
      code: `<XDSSlider
  label="Level"
  value={60}
  onChange={setLevel}
  orientation="vertical"
/>`,
    },
    {
      label: 'Disabled',
      code: `<XDSSlider
  label="Locked"
  value={50}
  onChange={() => {}}
  isDisabled
/>`,
    },
  ],
  props: [
    {
      name: 'label',
      type: 'string',
      description: 'Label text (always rendered for accessibility).',
      required: true,
    },
    {
      name: 'value',
      type: 'number | [number, number]',
      description:
        'Current value — a `number` for single thumb mode or `[number, number]` for range mode.',
      required: true,
    },
    {
      name: 'onChange',
      type: '(value: number) => void | (value: [number, number]) => void',
      description: 'Callback fired on value change during drag.',
    },
    {
      name: 'onChangeEnd',
      type: '(value: number) => void | (value: [number, number]) => void',
      description: 'Callback fired when drag ends.',
    },
    {
      name: 'min',
      type: 'number',
      description: 'Minimum value.',
      default: '0',
    },
    {
      name: 'max',
      type: 'number',
      description: 'Maximum value.',
      default: '100',
    },
    {
      name: 'step',
      type: 'number',
      description: 'Step increment.',
      default: '1',
    },
    {
      name: 'orientation',
      type: "'horizontal' | 'vertical'",
      description: 'Orientation of the slider.',
      default: "'horizontal'",
    },
    {
      name: 'formatValue',
      type: '(value: number) => string',
      description:
        'Custom value formatting function used for display and `aria-valuetext`.',
    },
    {
      name: 'valueDisplay',
      type: "'tooltip' | 'text' | 'none'",
      description: 'How the current value is displayed.',
      default: "'tooltip'",
    },
    {
      name: 'marks',
      type: 'Array<{ value: number; label?: string }>',
      description: 'Tick marks at specified positions with optional labels.',
    },
    {
      name: 'minStepsBetweenThumbs',
      type: 'number',
      description:
        'Minimum number of steps between thumbs in range mode; prevents thumbs from overlapping.',
      default: '0',
    },
    {
      name: 'isDisabled',
      type: 'boolean',
      description: 'Whether the slider is disabled.',
      default: 'false',
    },
    {
      name: 'isOptional',
      type: 'boolean',
      description: 'Whether the field is optional.',
      default: 'false',
    },
    {
      name: 'isRequired',
      type: 'boolean',
      description: 'Whether the field is required.',
      default: 'false',
    },
    {
      name: 'isLabelHidden',
      type: 'boolean',
      description: 'Whether to visually hide the label.',
      default: 'false',
    },
    {
      name: 'description',
      type: 'string',
      description: 'Description text rendered below the label.',
    },
    {
      name: 'status',
      type: 'XDSInputStatus',
      description:
        'Status indicator object (`{ type, message }`) for validation feedback.',
    },
    {
      name: 'labelTooltip',
      type: 'string',
      description: 'Tooltip text for an info icon displayed next to the label.',
    },
    {
      name: 'xstyle',
      type: 'StyleXStyles',
      description:
        'StyleX styles for layout customization (margins, positioning, sizing). Must be a stylex.create() value — not an inline style object like style={{}}.',
    },
  ],
  theming: {
    targets: [
      {className: 'xds-slider', visualProps: ['orientation']},
      {className: 'xds-slider-track', visualProps: ['orientation']},
      {className: 'xds-slider-thumb', visualProps: ['orientation']},
    ],
  },
  accessibility: [
    'Uses `role="slider"` with `aria-valuenow`, `aria-valuemin`, `aria-valuemax`, and `aria-valuetext` on each thumb.',
    'The label is always rendered in the DOM for accessibility even when `isLabelHidden` is true.',
    'Tooltip display uses `XDSTooltip` with `delay={0}` and `focusTrigger="always"` so value is always visible on focus.',
  ],
  keyboard:
    'Arrow keys ±1 step, Page Up/Down ±10 steps, Home/End jump to min/max.',
  notes: [
    'The ref is merged with an internal `trackRef` used for pointer position calculations.',
    'Pointer capture is used during drag for smooth interaction even when the cursor leaves the track.',
    '`snapToStep` rounds to the nearest valid step value; `clamp` enforces min/max bounds.',
    'In range mode, the closest thumb to the click position is selected automatically.',
    '`minStepsBetweenThumbs` enforces a minimum gap between range thumbs.',
    'Vertical orientation inverts the Y axis so that bottom = min and top = max.',
  ],
};

/** @type {import('../docs-types').ComponentDoc} */
export const docsZh = {
  name: 'Slider',
  description:
    '用于选择数值或范围的滑块组件，支持完整的键盘和指针交互。',
  features: [
    '单值和范围模式：传入 `number` 用于单滑块，`[number, number]` 用于范围',
    '方向：支持 `horizontal` 和 `vertical` 布局',
    '值显示：工具提示（默认）、内联文本或无',
    '刻度标记：在指定位置的可选标记，带标签',
    '键盘导航：方向键、Page Up/Down、Home/End',
    '拖拽交互：指针捕获实现平滑拖拽',
    '自定义格式化：`formatValue` 函数用于显示和 `aria-valuetext`',
    '字段集成：使用 `XDSField` 提供标签、描述、必填/可选和状态消息',
    '无障碍：使用 `role="slider"` 配合完整的 ARIA 属性',
  ],
  examples: [
    {
      label: '基础单值',
      code: '<XDSSlider label="Volume" value={50} onChange={setValue} />',
    },
    {
      label: '范围滑块',
      code: `<XDSSlider
  label="Price range"
  value={[20, 80]}
  onChange={setRange}
/>`,
    },
    {
      label: '自定义格式化',
      code: `<XDSSlider
  label="Temperature"
  value={72}
  onChange={setTemp}
  min={32}
  max={212}
  formatValue={(v) => \`\${v}°F\`}
/>`,
    },
    {
      label: '带步进和刻度标记',
      code: `<XDSSlider
  label="Rating"
  value={3}
  onChange={setRating}
  min={1}
  max={5}
  step={1}
  marks={[
    { value: 1, label: 'Poor' },
    { value: 3, label: 'Average' },
    { value: 5, label: 'Excellent' },
  ]}
/>`,
    },
    {
      label: '文本值显示',
      code: `<XDSSlider
  label="Opacity"
  value={75}
  onChange={setOpacity}
  formatValue={(v) => \`\${v}%\`}
  valueDisplay="text"
/>`,
    },
    {
      label: '带最小间距的范围',
      code: `<XDSSlider
  label="Date range"
  value={[10, 90]}
  onChange={setDateRange}
  minStepsBetweenThumbs={5}
/>`,
    },
    {
      label: '使用 onChangeEnd 提交值',
      code: `<XDSSlider
  label="Brightness"
  value={brightness}
  onChange={setBrightness}
  onChangeEnd={commitBrightness}
/>`,
    },
    {
      label: '垂直方向',
      code: `<XDSSlider
  label="Level"
  value={60}
  onChange={setLevel}
  orientation="vertical"
/>`,
    },
    {
      label: '禁用',
      code: `<XDSSlider
  label="Locked"
  value={50}
  onChange={() => {}}
  isDisabled
/>`,
    },
  ],
  props: [
    {
      name: 'label',
      type: 'string',
      description: '标签文本（始终渲染以确保无障碍可访问性）。',
      required: true,
    },
    {
      name: 'value',
      type: 'number | [number, number]',
      description:
        '当前值——`number` 用于单滑块模式，`[number, number]` 用于范围模式。',
      required: true,
    },
    {
      name: 'onChange',
      type: '(value: number) => void | (value: [number, number]) => void',
      description: '拖拽过程中值变更时触发的回调。',
    },
    {
      name: 'onChangeEnd',
      type: '(value: number) => void | (value: [number, number]) => void',
      description: '拖拽结束时触发的回调。',
    },
    {
      name: 'min',
      type: 'number',
      description: '最小值。',
      default: '0',
    },
    {
      name: 'max',
      type: 'number',
      description: '最大值。',
      default: '100',
    },
    {
      name: 'step',
      type: 'number',
      description: '步进增量。',
      default: '1',
    },
    {
      name: 'orientation',
      type: "'horizontal' | 'vertical'",
      description: '滑块的方向。',
      default: "'horizontal'",
    },
    {
      name: 'formatValue',
      type: '(value: number) => string',
      description:
        '自定义值格式化函数，用于显示和 `aria-valuetext`。',
    },
    {
      name: 'valueDisplay',
      type: "'tooltip' | 'text' | 'none'",
      description: '当前值的显示方式。',
      default: "'tooltip'",
    },
    {
      name: 'marks',
      type: 'Array<{ value: number; label?: string }>',
      description: '在指定位置的刻度标记，带可选标签。',
    },
    {
      name: 'minStepsBetweenThumbs',
      type: 'number',
      description:
        '范围模式下滑块之间的最小步数；防止滑块重叠。',
      default: '0',
    },
    {
      name: 'isDisabled',
      type: 'boolean',
      description: '是否禁用滑块。',
      default: 'false',
    },
    {
      name: 'isOptional',
      type: 'boolean',
      description: '字段是否为可选。',
      default: 'false',
    },
    {
      name: 'isRequired',
      type: 'boolean',
      description: '字段是否为必填。',
      default: 'false',
    },
    {
      name: 'isLabelHidden',
      type: 'boolean',
      description: '是否在视觉上隐藏标签。',
      default: 'false',
    },
    {
      name: 'description',
      type: 'string',
      description: '标签下方渲染的描述文本。',
    },
    {
      name: 'status',
      type: 'XDSInputStatus',
      description:
        '验证反馈的状态指示器对象（`{ type, message }`）。',
    },
    {
      name: 'labelTooltip',
      type: 'string',
      description: '标签旁信息图标的提示文本。',
    },
    {
      name: 'xstyle',
      type: 'StyleXStyles',
      description:
        '用于布局自定义的 StyleX 样式（边距、定位、尺寸）。必须是 stylex.create() 的值，而非内联样式对象如 style={{}}。',
    },
  ],
  theming: {
    targets: [
      {className: 'xds-slider', visualProps: ['orientation']},
      {className: 'xds-slider-track', visualProps: ['orientation']},
      {className: 'xds-slider-thumb', visualProps: ['orientation']},
    ],
  },
  accessibility: [
    '每个滑块使用 `role="slider"`，配合 `aria-valuenow`、`aria-valuemin`、`aria-valuemax` 和 `aria-valuetext`。',
    '即使 `isLabelHidden` 为 true，标签也始终在 DOM 中渲染以确保无障碍可访问性。',
    '工具提示显示使用 `XDSTooltip`，配合 `delay={0}` 和 `focusTrigger="always"`，使值在聚焦时始终可见。',
  ],
  keyboard:
    '方向键 ±1 步，Page Up/Down ±10 步，Home/End 跳转到最小值/最大值。',
  notes: [
    'ref 与内部的 `trackRef` 合并，用于指针位置计算。',
    '拖拽期间使用指针捕获，即使光标离开轨道也能平滑交互。',
    '`snapToStep` 四舍五入到最近的有效步进值；`clamp` 强制执行最小/最大值边界。',
    '在范围模式下，自动选择距离点击位置最近的滑块。',
    '`minStepsBetweenThumbs` 强制范围滑块之间保持最小间距。',
    '垂直方向反转 Y 轴，使底部为最小值，顶部为最大值。',
  ],
};

/** @type {import('../docs-types').TranslationDoc} */
export const docsDense = {
  description: 'Numeric value/range selector w/ full keyboard + pointer support.',
  features: [
    'Single + range modes: number for single thumb, [number, number] for range',
    'Orientation: horizontal + vertical layouts',
    'Value display: tooltip (default), inline text, or none',
    'Tick marks: optional marks at specified positions w/ labels',
    'Keyboard nav: Arrow keys, Page Up/Down, Home/End',
    'Drag: pointer capture for smooth dragging',
    'Custom formatting: formatValue fn for display + aria-valuetext',
    'Field integration: uses XDSField for label, description, required/optional, status messaging',
    'Accessible: role="slider" w/ full ARIA attributes',
  ],
  notes: [
    'ref merged w/ internal trackRef for pointer position calc.',
    'Pointer capture during drag for smooth interaction even when cursor leaves track.',
    'snapToStep rounds to nearest valid step; clamp enforces min/max bounds.',
    'Range mode auto-selects closest thumb to click position.',
    'minStepsBetweenThumbs enforces min gap between range thumbs.',
    'Vertical orientation inverts Y axis; bottom=min, top=max.',
  ],
  accessibility: [
    'role="slider" w/ aria-valuenow, aria-valuemin, aria-valuemax, aria-valuetext on each thumb.',
    'Label always in DOM for a11y even when isLabelHidden=true.',
    'Tooltip uses XDSTooltip w/ delay={0} focusTrigger="always"; value visible on focus.',
  ],
  keyboard: 'Arrow=\u00b11 step; PageUp/PageDown=\u00b110 steps; Home/End=jump to min/max.',
  propDescriptions: {
    label: 'Label text (always rendered for a11y).',
    value: 'Current value; number for single thumb, [number, number] for range.',
    onChange: 'Fired on value change during drag.',
    onChangeEnd: 'Fired when drag ends.',
    min: 'Minimum value.',
    max: 'Maximum value.',
    step: 'Step increment.',
    orientation: 'Slider orientation.',
    formatValue: 'Custom value formatting fn for display + aria-valuetext.',
    valueDisplay: 'How current value is displayed.',
    marks: 'Tick marks at specified positions w/ optional labels.',
    minStepsBetweenThumbs: 'Min steps between thumbs in range mode; prevents overlap.',
    isDisabled: 'Whether slider is disabled.',
    isOptional: 'Whether field is optional.',
    isRequired: 'Whether field is required.',
    isLabelHidden: 'Visually hide label.',
    description: 'Description text below label.',
    status: 'Status indicator ({type, message}) for validation feedback.',
    labelTooltip: 'Tooltip text for info icon next to label.',
    xstyle: 'StyleX layout styles; must be stylex.create() value.',
  },
};