// Copyright (c) Meta Platforms, Inc. and affiliates.

import {useState} from 'react';
import type {Meta, StoryObj} from '@storybook/react';
import {DateTimeInput} from '@astryxdesign/core/DateTimeInput';
import type {ISODateTimeString} from '@astryxdesign/core/DateTimeInput';
import {Theme, defineTheme} from '@astryxdesign/core/theme';

const meta: Meta<typeof DateTimeInput> = {
  title: 'Core/DateTimeInput',
  component: DateTimeInput,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'A date-time field with an exact caller-owned adaptations policy over native, popover, and bottom-sheet surfaces for both segments. The policy names the server-rendered default and any ordered width/pointer rules. Without adaptations, the deprecated nativePicker compatibility path keeps its released pointer-driven and per-segment fallback behavior.',
      },
    },
  },
  argTypes: {
    label: {
      control: 'text',
      description: 'Label text (required)',
    },
    isLabelHidden: {
      control: 'boolean',
      description:
        'Visually hide the label (still accessible to screen readers)',
    },
    placeholder: {
      control: 'text',
      description: 'Placeholder text',
    },
    description: {
      control: 'text',
      description: 'Description text displayed between the label and input',
    },
    isOptional: {
      control: 'boolean',
      description:
        'Whether the field is optional (mutually exclusive with isRequired)',
    },
    isRequired: {
      control: 'boolean',
      description:
        'Whether the field is required (mutually exclusive with isOptional)',
    },
    isDisabled: {
      control: 'boolean',
      description: 'Whether the input is disabled',
    },
    disabledMessage: {
      control: 'text',
      description:
        'Explains why the input is disabled. With isDisabled, shows a tooltip on hover/keyboard focus and keeps the field focusable via aria-disabled (activation stays blocked). Use this instead of wrapping a disabled DateTimeInput in Tooltip.',
    },
    size: {
      control: 'radio',
      options: ['sm', 'md', 'lg'],
    },
    hourFormat: {
      control: 'radio',
      options: ['12h', '24h'],
      description: 'Hour format for display',
    },
    hasSeconds: {
      control: 'boolean',
      description: 'Whether to include seconds in the time',
    },
    hasClear: {
      control: 'boolean',
      description: 'Whether to show a clear button',
    },
    nativePicker: {
      control: 'radio',
      options: ['touch', 'always', 'never'],
      description:
        'Deprecated. Use adaptations. At rest, touch maps to default popover plus a coarse-pointer native rule; always maps to constant native; never maps to default popover plus a coarse-pointer bottom-sheet rule. adaptations additionally holds the active tree until idle.',
      table: {category: 'Deprecated'},
    },
    numberOfMonths: {
      control: 'radio',
      options: [1, 2],
      description: 'Number of months to display in calendar',
    },
    timeIncrement: {
      control: 'number',
      description:
        'Desktop only: minutes to increment/decrement with arrow keys. Mobile touch uses wheels.',
    },
  },
};

export default meta;
type Story = StoryObj<typeof DateTimeInput>;

export const Default: Story = {
  render: args => {
    const [value, setValue] = useState<ISODateTimeString | undefined>(
      undefined,
    );
    return <DateTimeInput {...args} value={value} onChange={setValue} />;
  },
  args: {
    label: 'Meeting time',
    placeholder: 'Select a date',
  },
};

export const NarrowContainer: Story = {
  render: args => {
    const [value, setValue] = useState<ISODateTimeString | undefined>(
      '2026-03-15T14:30' as ISODateTimeString,
    );
    return (
      <div style={{width: '320px', maxWidth: '100%'}}>
        <DateTimeInput {...args} value={value} onChange={setValue} />
      </div>
    );
  },
  args: {
    label: 'Meeting time',
    hasClear: true,
  },
};

export const WithValue: Story = {
  render: args => {
    const [value, setValue] = useState<ISODateTimeString | undefined>(
      '2026-03-15T14:30' as ISODateTimeString,
    );
    return <DateTimeInput {...args} value={value} onChange={setValue} />;
  },
  args: {
    label: 'Event time',
  },
};

/**
 * A caller-owned `adaptations` policy: the pair of surfaces follows rules you
 * write rather than the pointer alone.
 *
 * This one defaults to the platform's own date and time controls — including on
 * the server, which a pointer test cannot decide — and keeps Astryx's typed
 * fields with their anchored calendar and time list on a touch device, where a
 * tablet user cross-referencing dates is better served by a visible month grid
 * than by an OS wheel. That is the opposite of what `nativePicker` can say,
 * which is the point: a policy value is exact, and holds on whatever pointer is
 * reading it.
 *
 * Note what authoring `native` costs the whole field: because the value is a
 * promise that BOTH segments are platform controls, the props the OS picker
 * cannot express — `hasSeconds`, a non-default `timeIncrement`,
 * `timeOptionInterval`, `weekStartsOn`, `numberOfMonths` — cannot be set on
 * this field at all, on any pointer. They throw at render, naming the policy
 * path, rather than being quietly dropped on whichever device selects the
 * native rule. A field that needs one of them wants a policy over `popover` and
 * `bottom-sheet`, or the legacy `nativePicker`, whose per-segment fallback
 * retains an Astryx time field instead.
 *
 * Rules are checked in author order and the LAST match wins.
 */
export const AdaptationsCoarsePopover: Story = {
  name: 'Adaptations — Astryx popovers on a coarse pointer',
  render: () => {
    const [value, setValue] = useState<ISODateTimeString | undefined>(
      '2026-03-15T14:30' as ISODateTimeString,
    );
    return (
      <DateTimeInput
        label="Starts"
        description="Typed fields with anchored calendar on a finger; platform controls on a mouse"
        value={value}
        onChange={setValue}
        adaptations={{
          default: 'native',
          rules: [{when: {pointer: 'coarse'}, value: 'popover'}],
        }}
      />
    );
  },
};

/**
 * The coordinated Date/Time sheet on a FINE pointer.
 *
 * `bottom-sheet` names the touch surface exactly, so it renders on the mouse
 * you are reading this with: two read-only segments that open one sheet with a
 * Date panel and a Time panel, rather than two independent popovers. Useful on
 * a kiosk or a stylus-driven screen, where the pointer reports `fine` but the
 * reach is a whole arm — and impossible to ask for with `nativePicker`.
 *
 * `default` with no rules is also the SSR-safe spelling: the server renders
 * this surface, and hydration matches it.
 */
export const AdaptationsFineBottomSheet: Story = {
  name: 'Adaptations — coordinated sheet on a fine pointer',
  render: () => {
    const [value, setValue] = useState<ISODateTimeString | undefined>(
      '2026-03-15T14:30' as ISODateTimeString,
    );
    return (
      <DateTimeInput
        label="Starts"
        description="Policy-pinned Date/Time sheet, on any pointer"
        value={value}
        onChange={setValue}
        adaptations={{default: 'bottom-sheet', rules: []}}
      />
    );
  },
};

export const TwentyFourHourFormat: Story = {
  render: args => {
    const [value, setValue] = useState<ISODateTimeString | undefined>(
      '2026-03-15T14:30' as ISODateTimeString,
    );
    return <DateTimeInput {...args} value={value} onChange={setValue} />;
  },
  args: {
    label: 'Appointment',
    hourFormat: '24h',
  },
};

export const WithSeconds: Story = {
  render: args => {
    const [value, setValue] = useState<ISODateTimeString | undefined>(
      '2026-03-15T14:30:45' as ISODateTimeString,
    );
    return <DateTimeInput {...args} value={value} onChange={setValue} />;
  },
  args: {
    label: 'Log timestamp',
    hasSeconds: true,
  },
};

export const WithDescription: Story = {
  render: args => {
    const [value, setValue] = useState<ISODateTimeString | undefined>(
      undefined,
    );
    return <DateTimeInput {...args} value={value} onChange={setValue} />;
  },
  args: {
    label: 'Deadline',
    description: 'When is this task due?',
    placeholder: 'Select deadline',
  },
};

export const WithClearButton: Story = {
  render: args => {
    const [value, setValue] = useState<ISODateTimeString | undefined>(
      '2026-03-15T09:00' as ISODateTimeString,
    );
    return <DateTimeInput {...args} value={value} onChange={setValue} />;
  },
  args: {
    label: 'Start time',
    hasClear: true,
  },
};

export const WithMinMax: Story = {
  render: args => {
    const [value, setValue] = useState<ISODateTimeString | undefined>(
      undefined,
    );
    return <DateTimeInput {...args} value={value} onChange={setValue} />;
  },
  args: {
    label: 'Appointment',
    min: '2026-03-15T09:00' as ISODateTimeString,
    max: '2026-03-15T17:00' as ISODateTimeString,
    description: 'Available: Mar 15, 9 AM - 5 PM',
  },
};

export const WithTimeIncrement: Story = {
  render: args => {
    const [value, setValue] = useState<ISODateTimeString | undefined>(
      '2026-03-15T09:00' as ISODateTimeString,
    );
    return <DateTimeInput {...args} value={value} onChange={setValue} />;
  },
  args: {
    label: 'Time slot',
    timeIncrement: 15,
    description: 'Use arrow keys to change by 15 minutes',
  },
};

/**
 * `timeOptionInterval` turns the time field into a combobox over a list of
 * preset times at that cadence. Click the time field or press Alt+ArrowDown to
 * open it; ArrowUp/ArrowDown move through the list, Enter picks, Escape closes.
 *
 * The list is a shortcut, not a restriction — a time between two options can
 * still be typed, and with the list closed the arrow keys keep stepping by
 * `timeIncrement` exactly as they do without this prop.
 */
export const WithTimeOptions: Story = {
  render: args => {
    const [value, setValue] = useState<ISODateTimeString | undefined>(
      '2026-03-15T09:00' as ISODateTimeString,
    );
    return <DateTimeInput {...args} value={value} onChange={setValue} />;
  },
  args: {
    label: 'Meeting time',
    timeOptionInterval: 30,
    description: 'Pick from half-hour slots, or type any time',
  },
};

/**
 * An hourly list — the 12 AM to 11 PM shape most scheduling flows want.
 * `min` and `max` trim the list on the boundary date, so only bookable hours
 * are offered.
 */
export const WithHourlyTimeOptions: Story = {
  render: args => {
    const [value, setValue] = useState<ISODateTimeString | undefined>(
      '2026-03-15T13:00' as ISODateTimeString,
    );
    return <DateTimeInput {...args} value={value} onChange={setValue} />;
  },
  args: {
    label: 'Office hours',
    timeOptionInterval: 60,
    min: '2026-03-15T09:00' as ISODateTimeString,
    max: '2026-03-15T17:00' as ISODateTimeString,
    description: 'Hourly slots, trimmed to 9 AM - 5 PM',
  },
};

export const Optional: Story = {
  render: args => {
    const [value, setValue] = useState<ISODateTimeString | undefined>(
      undefined,
    );
    return <DateTimeInput {...args} value={value} onChange={setValue} />;
  },
  args: {
    label: 'Preferred time',
    isOptional: true,
    placeholder: 'Select a date (optional)',
  },
};

export const Required: Story = {
  render: args => {
    const [value, setValue] = useState<ISODateTimeString | undefined>(
      undefined,
    );
    return <DateTimeInput {...args} value={value} onChange={setValue} />;
  },
  args: {
    label: 'Start time',
    isRequired: true,
  },
};

export const Disabled: Story = {
  render: args => {
    const [value, setValue] = useState<ISODateTimeString | undefined>(
      '2026-03-15T10:00' as ISODateTimeString,
    );
    return <DateTimeInput {...args} value={value} onChange={setValue} />;
  },
  args: {
    label: 'Locked time',
    isDisabled: true,
  },
};

// Disabled with an explanation tooltip. Hover or keyboard-focus the field to
// see why it's disabled — the reason is announced to assistive tech via
// aria-describedby, and the field stays focusable (activation is still
// blocked). Use disabledMessage instead of wrapping a disabled DateTimeInput in Tooltip:
// disabled controls swallow the pointer events a Tooltip wrapper needs.
export const DisabledWithMessage: Story = {
  render: args => {
    const [value, setValue] = useState<ISODateTimeString | undefined>(
      undefined,
    );
    return <DateTimeInput {...args} value={value} onChange={setValue} />;
  },
  args: {
    label: 'Meeting time',
    isDisabled: true,
    disabledMessage: 'You need the Editor role to change this',
  },
};

export const SizeVariants: Story = {
  render: () => {
    const [sm, setSm] = useState<ISODateTimeString | undefined>(undefined);
    const [md, setMd] = useState<ISODateTimeString | undefined>(undefined);
    const [lg, setLg] = useState<ISODateTimeString | undefined>(undefined);
    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
          maxWidth: '460px',
        }}>
        <DateTimeInput
          label="Small (28px)"
          value={sm}
          onChange={setSm}
          placeholder="Small size"
          size="sm"
        />
        <DateTimeInput
          label="Medium (32px)"
          value={md}
          onChange={setMd}
          placeholder="Medium size (default)"
          size="md"
        />
        <DateTimeInput
          label="Large (36px)"
          value={lg}
          onChange={setLg}
          placeholder="Large size"
          size="lg"
        />
      </div>
    );
  },
};

export const TwoMonthCalendar: Story = {
  render: args => {
    const [value, setValue] = useState<ISODateTimeString | undefined>(
      undefined,
    );
    return <DateTimeInput {...args} value={value} onChange={setValue} />;
  },
  args: {
    label: 'Travel departure',
    numberOfMonths: 2,
    nativePicker: 'never',
  },
};

export const WithErrorStatus: Story = {
  render: args => {
    const [value, setValue] = useState<ISODateTimeString | undefined>(
      '2026-03-15T14:30' as ISODateTimeString,
    );
    return <DateTimeInput {...args} value={value} onChange={setValue} />;
  },
  args: {
    label: 'Event time',
    status: {
      type: 'error',
      message: 'This time slot is not available',
    },
  },
};

export const WithWarningStatus: Story = {
  render: args => {
    const [value, setValue] = useState<ISODateTimeString | undefined>(
      '2026-03-15T07:00' as ISODateTimeString,
    );
    return <DateTimeInput {...args} value={value} onChange={setValue} />;
  },
  args: {
    label: 'Meeting time',
    status: {
      type: 'warning',
      message: 'Early morning meeting - are you sure?',
    },
  },
};

export const WithSuccessStatus: Story = {
  render: args => {
    const [value, setValue] = useState<ISODateTimeString | undefined>(
      '2026-03-15T10:00' as ISODateTimeString,
    );
    return <DateTimeInput {...args} value={value} onChange={setValue} />;
  },
  args: {
    label: 'Scheduled time',
    status: {
      type: 'success',
      message: 'Time slot is available',
    },
  },
};

export const AllVariations: Story = {
  render: () => {
    const [value1, setValue1] = useState<ISODateTimeString | undefined>(
      undefined,
    );
    const [value2, setValue2] = useState<ISODateTimeString | undefined>(
      '2026-03-15T14:30' as ISODateTimeString,
    );
    const [value3, setValue3] = useState<ISODateTimeString | undefined>(
      '2026-03-15T14:30' as ISODateTimeString,
    );
    const [value4, setValue4] = useState<ISODateTimeString | undefined>(
      undefined,
    );
    const [value5, setValue5] = useState<ISODateTimeString | undefined>(
      '2026-03-15T10:00' as ISODateTimeString,
    );
    const [value6, setValue6] = useState<ISODateTimeString | undefined>(
      '2026-03-15T22:00' as ISODateTimeString,
    );

    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
          maxWidth: '460px',
        }}>
        <DateTimeInput
          label="Default"
          value={value1}
          onChange={setValue1}
          placeholder="Select a date"
        />
        <DateTimeInput
          label="With value (12h)"
          value={value2}
          onChange={setValue2}
        />
        <DateTimeInput
          label="24-hour format"
          value={value3}
          onChange={setValue3}
          hourFormat="24h"
        />
        <DateTimeInput
          label="With description"
          description="Pick your preferred datetime"
          value={value4}
          onChange={setValue4}
        />
        <DateTimeInput
          label="Disabled"
          isDisabled
          value={value5}
          onChange={setValue5}
        />
        <DateTimeInput
          label="With error"
          value={value6}
          onChange={setValue6}
          status={{
            type: 'error',
            message: 'Invalid datetime selection',
          }}
        />
      </div>
    );
  },
};

/**
 * Theme the two segments precisely via `defineTheme`.
 *
 * Before the segment targets existed, the date and time wrappers were
 * anonymous nodes with hashed atomic classes only, so a theme that restyles
 * input geometry through the `text-input` / `date-input` / `time-input`
 * targets could not reach them — DateTimeInput rendered visibly shorter than
 * every other input under such a theme.
 *
 * `components['date-time-input-date-segment']` and its time twin scope
 * overrides to one segment each, and both reflect `size` and `status` the same
 * way the root does. Defaults are unchanged; this story only demonstrates the
 * override channel.
 */
const segmentTheme = defineTheme({
  name: 'date-time-input-segments-demo',
  components: {
    'date-time-input-date-segment': {
      base: {borderColor: 'var(--color-accent)'},
    },
    'date-time-input-time-segment': {
      base: {backgroundColor: 'var(--color-background-muted)'},
    },
  },
});

export const ThemedSegments: Story = {
  render: () => {
    const [value, setValue] = useState<ISODateTimeString | undefined>();
    return (
      <Theme theme={segmentTheme} mode="light">
        <DateTimeInput
          label="Themed segments"
          description="Date segment gets an accent border; time segment a muted fill."
          value={value}
          onChange={setValue}
        />
      </Theme>
    );
  },
};
