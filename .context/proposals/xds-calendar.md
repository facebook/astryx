# XDSCalendar Component Proposal

## Status

Proposed

## Context

We have an existing `XDSCalendar` implementation as a web component (custom element with Shadow DOM). This component needs to be adapted to conform to the XDS React + StyleX architecture before integration.

The calendar will eventually be used within an `XDSDatePicker` component that combines a text input with a popover calendar.

### Current Implementation (Web Component)

- Custom element extending `HTMLElement`
- Shadow DOM encapsulation
- Raw CSS with `@layer xds` and CSS custom properties
- Static stylesheet caching
- Attributes: `value`, `min`, `max`
- Month navigation with slide animations
- 6-row grid (42 cells) for consistent height

## Proposal

Convert `XDSCalendar` to a React component following XDS patterns.

### File Structure

```
packages/core/src/Calendar/
├── XDSCalendar.tsx        # Main component
├── XDSCalendar.test.tsx   # Unit tests
├── README.md              # Component documentation
└── index.ts               # Exports
```

### Component API

#### ISO String Type System

All XDS date/time components use ISO 8601 string formats for values. This provides consistency, JSON serialization, and explicit timezone handling.

```typescript
// ─── Date (timezone-naive) ───────────────────────────────────
// Use for: calendars, birthdays, holidays, date pickers
type ISODateString =
  `${number}${number}${number}${number}-${number}${number}-${number}${number}`;
// Example: "2026-01-28"

// ─── Time (timezone-naive) ───────────────────────────────────
// Use for: time inputs, store hours, alarms
type ISOTimeString = `${number}${number}:${number}${number}`;
// Example: "14:30"

// ─── DateTime (timezone-required) ────────────────────────────
// Use for: scheduling, meetings, events
type ISOZonedDateTimeString = string;
// Example: "2026-01-28T14:30:00-08:00" or "2026-01-28T14:30:00Z"

// ─── Ranges ──────────────────────────────────────────────────
interface DateRange {
  start: ISODateString;
  end: ISODateString; // When awaiting end selection, equals start
}

interface DateTimeRange {
  start: ISOZonedDateTimeString;
  end: ISOZonedDateTimeString;
}
```

**Component Value Types:**

| Component                  | Value Type               | Timezone |
| -------------------------- | ------------------------ | -------- |
| `XDSCalendar`              | `ISODateString`          | Naive    |
| `XDSTimeInput`             | `ISOTimeString`          | Naive    |
| `XDSDatePicker`            | `ISODateString`          | Naive    |
| `XDSDateTimePicker`        | `ISOZonedDateTimeString` | Required |
| `XDSCalendar mode="range"` | `DateRange`              | Naive    |

**Why ISO strings over Date objects:**

- `Date` is always a timestamp, not a calendar date
- `new Date("2026-01-28")` parses as UTC midnight, causing off-by-one bugs in other timezones
- ISO strings are unambiguous and JSON-serializable
- Timezone handling is explicit, not implicit

#### Calendar Props

```typescript
/** Day of week: 0 = Sunday through 6 = Saturday */
type DayOfWeek = 0 | 1 | 2 | 3 | 4 | 5 | 6;

// ─── Base Props (shared across all modes) ─────────────────────

interface XDSCalendarBaseProps {
  // ─── Multi-Month ───────────────────────────────────────────
  /** Number of months to display (default: 1) */
  numberOfMonths?: 1 | 2;

  // ─── Date Constraints ──────────────────────────────────────
  /** Minimum selectable date in ISO format */
  min?: ISODateString;

  /** Maximum selectable date in ISO format */
  max?: ISODateString;

  /**
   * Custom date constraint functions. Date is disabled if ANY function returns false.
   * Use for complex rules like "weekdays only" or "no holidays".
   */
  dateConstraints?: ReadonlyArray<(date: Date) => boolean>;

  // ─── Navigation ────────────────────────────────────────────
  /**
   * Controlled focus date (which month is visible).
   * If not provided, defaults to selected date or today.
   */
  focusDate?: ISODateString;

  /** Callback when visible month changes via navigation */
  onFocusDateChange?: (focusDate: ISODateString) => void;

  // ─── Display Options ───────────────────────────────────────
  /**
   * Show days from adjacent months (grayed out).
   * Default: true
   */
  hasOutsideDays?: boolean;

  /**
   * Show ISO week numbers in a side column.
   * Default: false
   */
  hasWeekNumbers?: boolean;

  /**
   * Use variable rows per month vs. fixed 6-row grid.
   * Default: false (fixed 6 rows for consistent height)
   */
  hasVariableRowCount?: boolean;

  /**
   * First day of week.
   * Default: 0 (Sunday)
   */
  weekStartsOn?: DayOfWeek;
}

// ─── Mode-specific Props (discriminated union) ────────────────

interface XDSCalendarSingleProps extends XDSCalendarBaseProps {
  /** Selection mode */
  mode?: 'single';

  /** Selected date in ISO format (YYYY-MM-DD) */
  value?: ISODateString;

  /** Default value for uncontrolled mode */
  defaultValue?: ISODateString;

  /** Callback when date is selected */
  onChange?: (value: ISODateString, valueAsDate: Date) => void;
}

interface XDSCalendarRangeProps extends XDSCalendarBaseProps {
  /** Selection mode */
  mode: 'range';

  /** Selected date range */
  value?: DateRange;

  /** Default value for uncontrolled mode */
  defaultValue?: DateRange;

  /** Callback when range is selected */
  onChange?: (value: DateRange) => void;
}

export type XDSCalendarProps = XDSCalendarSingleProps | XDSCalendarRangeProps;

export const XDSCalendar: React.FC<XDSCalendarProps>;

// Export types for consumers
export type {ISODateString, DayOfWeek, DateRange};
```

### Usage Examples

```typescript
// Single date selection (default mode)
<XDSCalendar
  value="2026-01-28"
  onChange={(value, valueAsDate) => console.log(value)}
/>

// Explicit single mode
<XDSCalendar
  mode="single"
  value="2026-01-28"
  onChange={(value, valueAsDate) => console.log(value)}
/>

// Range selection
<XDSCalendar
  mode="range"
  value={{ start: "2026-01-28", end: "2026-02-05" }}
  onChange={(range) => console.log(range.start, range.end)}
/>
```

### Type Safety

The discriminated union ensures type safety at compile time:

```typescript
// ✓ Correct: single mode with ISODateString
<XDSCalendar mode="single" value="2026-01-28" />

// ✓ Correct: range mode with DateRange
<XDSCalendar mode="range" value={{ start: "2026-01-28", end: "2026-02-05" }} />

// ✗ Error: range mode requires DateRange, not string
<XDSCalendar mode="range" value="2026-01-28" />

// ✗ Error: single mode requires string, not DateRange
<XDSCalendar mode="single" value={{ start: "2026-01-28", end: "2026-02-05" }} />
```

### Props Rationale

**Included from internal API:**

- `numberOfMonths` (as `count`) — Limited to 1 | 2 for practical layouts
- `focusDate` / `onFocusDateChange` — Controlled navigation
- `hasOutsideDays` (as `hasDaysOutsideOfMonth`) — Common feature
- `hasVariableRowCount` — Height consistency option
- `hasWeekNumbers` — Requested feature
- `weekStartsOn` (as `weekStart`) — Locale flexibility

**Simplified from internal API:**

- `min` / `max` instead of only `dateRestraints` — Simple cases are common
- Added `dateConstraints` for complex rules — Flexible when needed

**Deferred to future phases:**

- `rangeSelectDate` — Range picker component
- `selectedWeekStart` / `selectedWeekEnd` — Week selection mode
- `isPagerLimitRestrained` — Edge case, add if requested
- `hasDuplicateSelection` — Edge case
- `isPreviousMonthShownByDefault` — Edge case

### Multi-Month Display

When `numberOfMonths={2}`, the calendar displays two consecutive months side by side.

**Layout Structure**:

```
┌─────────────────────────────────────────────────────┐
│  [<]           January 2026  •  February 2026  [>]  │  ← Single header with nav
├─────────────────────────────────────────────────────┤
│  Su Mo Tu We Th Fr Sa  │  Su Mo Tu We Th Fr Sa     │
│  ────────────────────  │  ────────────────────     │
│           1  2  3  4   │                     1     │
│   5  6  7  8  9 10 11  │   2  3  4  5  6  7  8     │
│  ...                   │  ...                      │
└─────────────────────────────────────────────────────┘
```

**Key Behaviors**:

- Single set of prev/next arrows in the header
- Navigation advances all months together (clicking next moves Jan→Feb, Feb→Mar)
- Header displays all visible month names (e.g., "January 2026 • February 2026")
- Each month grid is independent but shares the same selection state
- Animations slide all months together as a unit

**Implementation**:

```typescript
const XDSCalendar: React.FC<XDSCalendarProps> = ({
  numberOfMonths = 1,
  ...props
}) => {
  const [baseMonth, setBaseMonth] = useState(() => {
    const date = new Date();
    date.setDate(1);
    return date;
  });

  // Generate array of months to display
  const visibleMonths = useMemo(() => {
    return Array.from({ length: numberOfMonths }, (_, i) => {
      const month = new Date(baseMonth);
      month.setMonth(baseMonth.getMonth() + i);
      return month;
    });
  }, [baseMonth, numberOfMonths]);

  return (
    <div {...stylex.props(styles.calendar)}>
      <div {...stylex.props(styles.header)}>
        <button onClick={() => navigateMonth(-1)}>←</button>
        <span>{formatMonthRange(visibleMonths)}</span>
        <button onClick={() => navigateMonth(1)}>→</button>
      </div>
      <div {...stylex.props(styles.monthsContainer)}>
        {visibleMonths.map((month, index) => (
          <MonthGrid
            key={month.toISOString()}
            month={month}
            isFirst={index === 0}
            isLast={index === numberOfMonths - 1}
            {...props}
          />
        ))}
      </div>
    </div>
  );
};
```

**Styling for Multi-Month**:

```typescript
const styles = stylex.create({
  monthsContainer: {
    display: 'flex',
    gap: spacingVars['--spacing-4'],
  },
  monthGrid: {
    flex: '1 1 0',
    minWidth: '220px',
  },
});
```

### Navigation Buttons

Navigation buttons (prev/next month) should use `XDSButton` directly to ensure consistent styling:

```typescript
import { XDSButton } from '../Button';

// In render:
<div {...stylex.props(styles.header)}>
  <XDSButton
    variant="ghost"
    onClick={() => navigateMonth(-1)}
    aria-label="Previous month"
  >
    <ChevronLeftIcon />
  </XDSButton>

  <span {...stylex.props(styles.monthYearLabel)}>
    {formatMonthRange(visibleMonths)}
  </span>

  <XDSButton
    variant="ghost"
    onClick={() => navigateMonth(1)}
    aria-label="Next month"
  >
    <ChevronRightIcon />
  </XDSButton>
</div>
```

**Benefits of using XDSButton:**

- Inherits hover/active/focus states from Button
- Consistent with theme overrides
- Accessible focus outline handling
- No duplicate button styling code

### Key Adaptations

#### 1. React State Instead of DOM Manipulation

```typescript
// Before (web component)
this._currentMonth = new Date();
this._updateCalendar();

// After (React)
const [currentMonth, setCurrentMonth] = useState(() => {
  const date = new Date();
  date.setDate(1);
  return date;
});
```

#### 2. StyleX Instead of Raw CSS

```typescript
// Before (web component)
_getStyles() {
  return `
    .xds-calendar { background: var(--color-surface); }
    .xds-calendar-day:hover { background: var(--color-hover-overlay); }
  `;
}

// After (StyleX with tokens)
const styles = stylex.create({
  calendar: {
    backgroundColor: colorVars['--color-surface'],
    padding: spacingVars['--spacing-3'],
    minWidth: '220px',
    overflow: 'hidden',
  },
  day: {
    backgroundColor: 'transparent',
    backgroundImage: {
      default: null,
      ':hover': `linear-gradient(${colorVars['--color-hover-overlay']}, ${colorVars['--color-hover-overlay']})`,
    },
  },
});
```

#### 3. Theme Token Usage

Replace hardcoded CSS variable references with StyleX token imports:

| CSS Variable                | StyleX Token                          |
| --------------------------- | ------------------------------------- |
| `var(--color-surface)`      | `colorVars['--color-surface']`        |
| `var(--color-text-primary)` | `colorVars['--color-text-primary']`   |
| `var(--color-accent)`       | `colorVars['--color-accent']`         |
| `var(--space-3)`            | `spacingVars['--spacing-3']`          |
| `var(--radius-rounded)`     | `radiusVars['--radius-rounded']`      |
| `var(--transition-fast)`    | `transitionVars['--transition-fast']` |

#### 4. Animation Strategy

The original uses CSS keyframe animations for month transitions. Options:

**Option A: Keep CSS Animations (Recommended)**

- Define keyframes with `stylex.keyframes()`
- Maintain the slide transition UX
- Zero JS animation overhead

```typescript
const slideOutLeft = stylex.keyframes({
  from: {transform: 'translateX(0)', opacity: 1},
  to: {transform: 'translateX(-100%)', opacity: 0},
});

const animationStyles = stylex.create({
  slideLeft: {
    animationName: slideOutLeft,
    animationDuration: '200ms',
    animationTimingFunction: 'ease-out',
    animationFillMode: 'forwards',
  },
});
```

**Option B: Remove Animations**

- Simpler implementation
- Instant month changes
- Less polished UX

**Recommendation**: Option A — animations are a key UX element for calendar navigation.

#### 5. Controlled vs Uncontrolled

Support both patterns:

```typescript
interface XDSCalendarProps {
  // Controlled
  value?: string;
  onChange?: (value: string, valueAsDate: Date) => void;

  // Uncontrolled
  defaultValue?: string;
}
```

#### 6. Accessibility Enhancements

Add missing ARIA attributes:

```typescript
<div
  role="grid"
  aria-label={`Calendar for ${monthYearLabel}`}
>
  <div role="row">
    {dayNames.map(day => (
      <div role="columnheader" key={day}>{day}</div>
    ))}
  </div>
  {weeks.map((week, i) => (
    <div role="row" key={i}>
      {week.map(day => (
        <button
          role="gridcell"
          aria-selected={isSelected}
          aria-disabled={isDisabled}
          tabIndex={isFocusable ? 0 : -1}
        />
      ))}
    </div>
  ))}
</div>
```

Add keyboard navigation:

- Arrow keys for date navigation
- Enter/Space for selection
- Home/End for first/last day of week
- PageUp/PageDown for month navigation

### Variant Support (Future)

Consider theme-level customization via module augmentation:

```typescript
declare module '../theme/types' {
  interface ComponentStyles {
    calendar?: {
      // Future: size variants, color overrides
    };
  }
}
```

For initial implementation, no variants needed — calendar is a utility component.

### Testing Strategy

```typescript
describe('XDSCalendar', () => {
  // Basic rendering
  it('renders current month by default');
  it('displays correct number of days');
  it('highlights today');
  it('shows selected date');

  // Navigation
  it('navigates to previous month');
  it('navigates to next month');

  // Constraints
  it('respects min date constraint');
  it('respects max date constraint');

  // Events
  it('calls onChange when date selected');

  // Accessibility
  it('supports keyboard navigation');
  it('renders accessible grid structure');

  // Multi-month
  it('renders multiple months when numberOfMonths > 1');
  it('displays correct month headers for multi-month');
  it('navigation advances all months together');
  it('selection works across multiple month grids');
  it('animations apply to all months as a unit');
});
```

### Export Configuration

Add to `packages/core/package.json`:

```json
{
  "exports": {
    "./Calendar": {
      "types": "./dist/Calendar/index.d.ts",
      "import": "./dist/Calendar/index.mjs",
      "require": "./dist/Calendar/index.js"
    }
  }
}
```

Add to `packages/core/src/index.ts`:

```typescript
export * from './Calendar';
```

### Storybook Stories

Create `apps/storybook/stories/Calendar.stories.tsx`:

**Single Mode:**

- **Default** — Single month, single selection
- **With Selected Date**
- **With Min/Max Constraints**
- **Two Months** — `numberOfMonths={2}`
- **With Week Numbers** — `hasWeekNumbers={true}`
- **Monday Start** — `weekStartsOn={1}`

**Range Mode:**

- **Range Selection** — `mode="range"`
- **Range Two Months** — `mode="range" numberOfMonths={2}`

**Interactive:**

- **Navigation Demo** — Interactive navigation showcase
- **Keyboard Navigation** — Focus management demo

## Implementation Phases

### Phase 1: Core Calendar

1. Create file structure
2. Convert to React component
3. Implement StyleX styles with tokens
4. Add basic tests
5. Create Storybook stories

### Phase 2: Accessibility

1. Add ARIA attributes
2. Implement keyboard navigation
3. Add focus management
4. Test with screen reader

### Phase 3: DatePicker Integration

1. Create `XDSDatePicker` component
2. Integrate with `XDSField` wrapper
3. Add popover/dropdown behavior
4. Handle input parsing and formatting

## Consequences

### Benefits

1. **Consistency** — Follows XDS patterns, uses theme tokens
2. **Tree-shakeable** — React component with granular exports
3. **Testable** — React Testing Library patterns
4. **Themeable** — Automatically respects light/dark mode via tokens
5. **Type-safe** — Full TypeScript support

### Tradeoffs

1. **Rewrite required** — Can't directly reuse web component code
2. **Animation complexity** — StyleX keyframes require careful setup
3. **Bundle size** — React adds overhead vs. native web component

## Open Questions

1. **Responsive behavior** — Should 2-month layout collapse to 1-month on narrow viewports?
2. **Month header format** — For 2-month, show "January • February" or "January 2026 • February 2026"?

### Resolved

- ~~Locale support / firstDayOfWeek~~ → Added `weekStartsOn` prop with `DayOfWeek` type
- ~~Week numbers~~ → Added `hasWeekNumbers` prop
- ~~Max months~~ → Limited to `1 | 2` per internal pattern
- ~~Date type~~ → Using `ISODateString` template literal type for compile-time validation
- ~~Range selection API~~ → Using `mode` prop with discriminated union (`'single' | 'range'`)
- ~~Partial range~~ → When awaiting end selection, `end` equals `start` (single-day range)

## References

- Original web component implementation (provided in conversation)
- XDS Button implementation: `packages/core/src/Button/XDSButton.tsx`
- XDS TextInput implementation: `packages/core/src/TextInput/XDSTextInput.tsx`
- ARIA Date Picker pattern: https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/examples/datepicker-dialog/
