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
  ],
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
