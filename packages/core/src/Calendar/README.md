# /packages/core/src/Calendar

XDSCalendar component for date selection with single and range modes.

## Features

- **Selection Modes**: `single` (default) and `range`
- **Multi-Month Display**: Show 1 or 2 months side by side
- **Date Constraints**: `min`, `max`, and custom `dateConstraints` functions
- **Locale Options**: `weekStartsOn` for configurable first day of week
- **Week Numbers**: Optional ISO week number column
- **Controlled/Uncontrolled**: Supports both patterns via `value`/`defaultValue`

## Usage

```tsx
import { XDSCalendar } from '@xds/core/Calendar';

// Single date selection
<XDSCalendar
  value="2026-01-28"
  onChange={(value, valueAsDate) => console.log(value)}
/>

// Range selection
<XDSCalendar
  mode="range"
  value={{ start: "2026-01-28", end: "2026-02-05" }}
  onChange={(range) => console.log(range.start, range.end)}
/>

// Two months with constraints
<XDSCalendar
  numberOfMonths={2}
  min="2026-01-01"
  max="2026-12-31"
  weekStartsOn={1}
/>
```

## Props

| Prop                | Type                                 | Default    | Description                    |
| ------------------- | ------------------------------------ | ---------- | ------------------------------ |
| mode                | `'single' \| 'range'`                | `'single'` | Selection mode                 |
| value               | `ISODateString \| DateRange`         | —          | Controlled selected value      |
| defaultValue        | `ISODateString \| DateRange`         | —          | Uncontrolled default value     |
| onChange            | `Function`                           | —          | Selection callback             |
| numberOfMonths      | `1 \| 2`                             | `1`        | Number of months to display    |
| min                 | `ISODateString`                      | —          | Minimum selectable date        |
| max                 | `ISODateString`                      | —          | Maximum selectable date        |
| dateConstraints     | `Array<(date: Date) => boolean>`     | —          | Custom constraint functions    |
| focusDate           | `ISODateString`                      | —          | Controlled visible month       |
| onFocusDateChange   | `(focusDate: ISODateString) => void` | —          | Navigation callback            |
| hasOutsideDays      | `boolean`                            | `true`     | Show days from adjacent months |
| hasWeekNumbers      | `boolean`                            | `false`    | Show ISO week numbers          |
| hasVariableRowCount | `boolean`                            | `false`    | Variable vs fixed 6-row grid   |
| weekStartsOn        | `0-6`                                | `0`        | First day of week (0=Sunday)   |

## Types

```typescript
type ISODateString =
  `${number}${number}${number}${number}-${number}${number}-${number}${number}`;

type DayOfWeek = 0 | 1 | 2 | 3 | 4 | 5 | 6;

interface DateRange {
  start: ISODateString;
  end: ISODateString;
}
```

## Files

| File                 | Role   | Purpose                  |
| -------------------- | ------ | ------------------------ |
| XDSCalendar.tsx      | Core   | Component implementation |
| XDSCalendar.test.tsx | Test   | Unit tests               |
| index.ts             | Export | Public API exports       |
| README.md            | Docs   | This documentation       |
