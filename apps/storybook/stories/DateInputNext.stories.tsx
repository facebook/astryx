// Copyright (c) Meta Platforms, Inc. and affiliates.

import {useState} from 'react';
import * as stylex from '@stylexjs/stylex';
import type {Meta, StoryObj} from '@storybook/react';
import {
  DateInputNext,
  MobileDateField,
  MOBILE_PICKER_QUERY,
} from '@astryxdesign/lab';
import {useMediaQuery} from '@astryxdesign/core/hooks';
import type {ISODateString} from '@astryxdesign/core/utils';
import {Text} from '@astryxdesign/core/Text';
import {Banner} from '@astryxdesign/core/Banner';

const styles = stylex.create({
  /**
   * A phone-width column. The component is fluid, but every story here is
   * about touch, so they are all framed at a handset width.
   */
  phone: {
    inlineSize: 360,
    maxInlineSize: '100%',
    display: 'flex',
    flexDirection: 'column',
    gap: 16,
  },
  readout: {
    minBlockSize: 20,
  },
});

const meta: Meta<typeof DateInputNext> = {
  title: 'Lab/DateInputNext',
  component: DateInputNext,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'A drop-in `DateInput` that picks its own surface. On anything but ' +
          'a narrow touch screen it renders core’s `DateInput` unchanged; on ' +
          'a narrow touch screen (`max-width: 768px` **and** `pointer: ' +
          'coarse`) it renders a picker built for a thumb — continuously ' +
          'scrolling, snap-paged months with month and year wheels behind ' +
          'the header title.\n\n' +
          'Its props are `DateInputProps`, the same type, so adopting it is ' +
          'a changed import.\n\n' +
          '**Reviewing on a desktop browser:** the first story below will ' +
          'show you the *desktop* control, because that is the correct ' +
          'answer for a mouse. Every other story renders `MobileDateField` ' +
          'directly, which is the touch surface with the media query skipped.',
      },
    },
  },
  argTypes: {
    size: {control: 'select', options: ['sm', 'md', 'lg']},
    weekStartsOn: {control: {type: 'number', min: 0, max: 6}},
    format: {
      control: 'select',
      options: ['date', 'date_long', 'date_weekday', 'system_date'],
    },
  },
};

export default meta;
type Story = StoryObj<typeof DateInputNext>;

// ============================================================
// RESPONSIVE — the component as you would actually use it
// ============================================================

export const Default: Story = {
  name: 'Responsive (picks its own surface)',
  parameters: {
    docs: {
      description: {
        story:
          'On this desktop browser you are seeing core’s `DateInput` — the ' +
          'correct surface for a mouse. Open the same story on a phone, or ' +
          'in a device-emulated tab that reports a coarse pointer, and the ' +
          'field starts opening a sheet instead of a popover. Nothing else ' +
          'changes: the closed field is the same control either way, which ' +
          'is why the swap is invisible.',
      },
    },
  },
  render: () => {
    const [date, setDate] = useState<ISODateString | undefined>();
    // The banner reports the surface you are ACTUALLY looking at. Hardcoding
    // "desktop" here was wrong on the one device the story matters most on.
    const isTouch = useMediaQuery(MOBILE_PICKER_QUERY);
    return (
      <div {...stylex.props(styles.phone)}>
        <Banner
          status="info"
          title={
            isTouch ? 'Showing the touch picker' : 'Showing the desktop surface'
          }
          description={
            isTouch
              ? 'Narrow and a coarse pointer, so you get the picker: tap the field, then scroll the months. On a desktop pointer this same story renders core’s DateInput.'
              : 'A coarse pointer under 768px gets the touch picker instead. The stories below force it, so it is reviewable here.'
          }
        />
        <DateInputNext
          label="Event date"
          description="Same props as DateInput, either way."
          value={date}
          onChange={setDate}
          hasClear
        />
        <Text type="supporting" color="secondary" xstyle={styles.readout}>
          {date ?? 'no date selected'}
        </Text>
      </div>
    );
  },
};

// ============================================================
// TOUCH SURFACE — forced, so it is reviewable anywhere
// ============================================================

export const TouchSurface: Story = {
  name: 'Touch surface',
  parameters: {
    docs: {
      description: {
        story:
          'The mobile field with the media query skipped. Tap the field to ' +
          'open the sheet, then scroll the months — every pane is exactly ' +
          'one screen and snaps to the top, so the picker is a fixed height ' +
          'and never rests between two months.\n\nA tap on a day commits it ' +
          'straight away (watch the readout) and leaves the sheet up, so a ' +
          'mistake can be corrected in place. Done just closes.',
      },
    },
  },
  render: () => {
    const [date, setDate] = useState<ISODateString | undefined>('2026-03-21');
    return (
      <div {...stylex.props(styles.phone)}>
        <MobileDateField
          label="Event date"
          value={date}
          onChange={setDate}
          hasClear
        />
        <Text type="supporting" color="secondary" xstyle={styles.readout}>
          {date ?? 'no date selected'}
        </Text>
      </div>
    );
  },
};

export const Wheels: Story = {
  name: 'Month / year wheels',
  parameters: {
    docs: {
      description: {
        story:
          'Open the sheet, then tap "March 2026" in the header. The calendar ' +
          'is replaced in place by two wheels — the surface never changes ' +
          'height — and each wheel commits when it comes to rest.',
      },
    },
  },
  render: () => {
    const [date, setDate] = useState<ISODateString | undefined>('2026-03-21');
    return (
      <div {...stylex.props(styles.phone)}>
        <MobileDateField label="Event date" value={date} onChange={setDate} />
      </div>
    );
  },
};

// ============================================================
// BOUNDED — min/max clamp the scroller AND the wheels
// ============================================================

export const Bounded: Story = {
  name: 'Bounded range',
  parameters: {
    docs: {
      description: {
        story:
          'With min and max, the scroller stops at the bounds instead of ' +
          'running a century in each direction, and out-of-range months and ' +
          'years stay on the wheels but cannot be committed.',
      },
    },
  },
  render: () => {
    const [date, setDate] = useState<ISODateString | undefined>('2026-03-10');
    return (
      <div {...stylex.props(styles.phone)}>
        <MobileDateField
          label="Delivery date"
          description="Between Feb 1 and May 31, 2026."
          min="2026-02-01"
          max="2026-05-31"
          value={date}
          onChange={setDate}
        />
      </div>
    );
  },
};

// ============================================================
// CONSTRAINED — weekdays only, Monday-first
// ============================================================

export const WeekdaysOnly: Story = {
  name: 'Weekdays only, Monday first',
  render: () => {
    const [date, setDate] = useState<ISODateString | undefined>();
    return (
      <div {...stylex.props(styles.phone)}>
        <MobileDateField
          label="Appointment"
          description="Weekends are not bookable."
          weekStartsOn="mon"
          dateConstraints={[date => date.getDay() !== 0 && date.getDay() !== 6]}
          value={date}
          onChange={setDate}
        />
      </div>
    );
  },
};

// ============================================================
// FIELD PARITY — the props all behave as they do on DateInput
// ============================================================

export const FieldStates: Story = {
  name: 'Field states',
  parameters: {
    docs: {
      description: {
        story:
          'Status, sizes, required, disabled-with-a-reason and the clear ' +
          'button are `DateInput`’s, unchanged — the touch surface swaps the ' +
          'picker, not the field contract. Sizes keep their own heights but ' +
          'cannot render below a 44px tap target on a coarse pointer.',
      },
    },
  },
  render: () => {
    const [date, setDate] = useState<ISODateString | undefined>();
    return (
      <div {...stylex.props(styles.phone)}>
        <MobileDateField
          label="Required, with an error"
          isRequired
          value={date}
          onChange={setDate}
          status={
            date == null
              ? {type: 'error', message: 'Pick a date to continue'}
              : undefined
          }
        />
        <MobileDateField label="Small" size="sm" onChange={() => {}} />
        <MobileDateField label="Large" size="lg" onChange={() => {}} />
        <MobileDateField
          label="Disabled, with a reason"
          isDisabled
          disabledMessage="You need the Editor role to change this"
          onChange={() => {}}
        />
      </div>
    );
  },
};
