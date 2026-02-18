# /packages/core/src/Slider

A slider component for selecting numeric values or ranges with full keyboard and pointer support.

<!-- SYNC: When files in this directory change, update this document. -->

## Features

- **Single & range modes**: Pass a `number` for single thumb, `[number, number]` for range
- **Orientation**: Supports `horizontal` and `vertical` layouts
- **Value display**: Tooltip (default), inline text, or none
- **Tick marks**: Optional marks at specified positions with labels
- **Keyboard navigation**: Arrow keys, Page Up/Down, Home/End
- **Drag interaction**: Pointer capture for smooth dragging
- **Custom formatting**: `formatValue` function for display and `aria-valuetext`
- **Field integration**: Uses `XDSField` for label, description, required/optional, and status messaging
- **Accessible**: Uses `role="slider"` with full ARIA attributes

## Usage

```tsx
import { XDSSlider } from '@xds/core/Slider';

// Basic single value
<XDSSlider label="Volume" value={50} onChange={setValue} />

// Range slider
<XDSSlider
  label="Price range"
  value={[20, 80]}
  onChange={setRange}
/>

// With custom formatting
<XDSSlider
  label="Temperature"
  value={72}
  onChange={setTemp}
  min={32}
  max={212}
  formatValue={(v) => `${v}°F`}
/>

// With step and marks
<XDSSlider
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
/>

// Text value display
<XDSSlider
  label="Opacity"
  value={75}
  onChange={setOpacity}
  formatValue={(v) => `${v}%`}
  valueDisplay="text"
/>

// Range with minimum gap
<XDSSlider
  label="Date range"
  value={[10, 90]}
  onChange={setDateRange}
  minStepsBetweenThumbs={5}
/>

// With onChangeEnd for committing value
<XDSSlider
  label="Brightness"
  value={brightness}
  onChange={setBrightness}
  onChangeEnd={commitBrightness}
/>

// Vertical orientation
<XDSSlider
  label="Level"
  value={60}
  onChange={setLevel}
  orientation="vertical"
/>

// Disabled
<XDSSlider
  label="Locked"
  value={50}
  onChange={() => {}}
  isDisabled
/>
```

## XDSSlider Props (Base)

| Prop            | Type                                            | Default        | Description                                                     |
| --------------- | ----------------------------------------------- | -------------- | --------------------------------------------------------------- |
| `label`         | `string`                                        | —              | Label text (always rendered for accessibility)                  |
| `isLabelHidden` | `boolean`                                       | `false`        | Whether to visually hide the label                              |
| `description`   | `string`                                        | —              | Description text below the label                                |
| `isDisabled`    | `boolean`                                       | `false`        | Whether the slider is disabled                                  |
| `isOptional`    | `boolean`                                       | `false`        | Whether the field is optional                                   |
| `isRequired`    | `boolean`                                       | `false`        | Whether the field is required                                   |
| `status`        | `XDSInputStatus`                                | —              | Status indicator (`{ type, message }`)                          |
| `labelTooltip`  | `string`                                        | —              | Tooltip text for an info icon next to the label                 |
| `min`           | `number`                                        | `0`            | Minimum value                                                   |
| `max`           | `number`                                        | `100`          | Maximum value                                                   |
| `step`          | `number`                                        | `1`            | Step increment                                                  |
| `orientation`   | `'horizontal' \| 'vertical'`                   | `'horizontal'` | Orientation of the slider                                       |
| `formatValue`   | `(value: number) => string`                     | —              | Custom value formatting for display and `aria-valuetext`        |
| `valueDisplay`  | `'tooltip' \| 'text' \| 'none'`                | `'tooltip'`    | How the current value is displayed                              |
| `marks`         | `Array<{ value: number; label?: string }>`      | —              | Tick marks at specified positions with optional labels           |
| `xstyle`        | `StyleXStyles`                                  | —              | Additional styles                                               |
| `data-testid`   | `string`                                        | —              | Test ID for the root element                                    |

### Single Value Mode

| Prop          | Type                         | Description                                    |
| ------------- | ---------------------------- | ---------------------------------------------- |
| `value`       | `number`                     | Current value                                  |
| `onChange`    | `(value: number) => void`    | Callback fired on value change during drag     |
| `onChangeEnd` | `(value: number) => void`   | Callback fired when drag ends                  |

### Range Mode

| Prop                     | Type                                   | Default | Description                              |
| ------------------------ | -------------------------------------- | ------- | ---------------------------------------- |
| `value`                  | `[number, number]`                     | —       | Current range `[min, max]`               |
| `onChange`               | `(value: [number, number]) => void`    | —       | Callback fired on value change           |
| `onChangeEnd`            | `(value: [number, number]) => void`    | —       | Callback fired when drag ends            |
| `minStepsBetweenThumbs`  | `number`                               | `0`     | Minimum number of steps between thumbs   |

## Files

| File                  | Role  | Purpose                                              |
| --------------------- | ----- | ---------------------------------------------------- |
| `index.ts`            | Entry | Exports XDSSlider component and all type variants    |
| `XDSSlider.tsx`       | Core  | Slider component with single and range mode support  |
| `XDSSlider.test.tsx`  | Test  | Unit tests                                           |

## Implementation Notes

- The component uses `forwardRef` — the ref is merged with an internal `trackRef` for pointer position calculations
- Pointer capture is used during drag for smooth interaction even when the cursor leaves the track
- `snapToStep` rounds to the nearest valid step value; `clamp` enforces min/max bounds
- In range mode, the closest thumb is selected on track click based on distance to each thumb
- `minStepsBetweenThumbs` prevents range thumbs from overlapping by enforcing a minimum gap
- Keyboard navigation: Arrow keys ±1 step, Page Up/Down ±10 steps, Home/End jump to min/max
- Tooltip display wraps each thumb in `XDSTooltip` with `delay={0}` and `focusTrigger="always"`
- Vertical orientation inverts the Y axis (bottom = min, top = max)
