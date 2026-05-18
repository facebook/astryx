// Copyright (c) Meta Platforms, Inc. and affiliates.

import {useState} from 'react';
import type {Meta, StoryObj} from '@storybook/react';
import {
  XDSCalendar,
  type ISODateString,
  type DateRange,
} from '@xds/core/Calendar';

const meta: Meta<typeof XDSCalendar> = {
  title: 'Core/Calendar',
  component: XDSCalendar,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof XDSCalendar>;

export const Default: Story = {
  render: () => {
    const [value, setValue] = useState<ISODateString | undefined>(undefined);
    return (
      <XDSCalendar
        mode="single"
        value={value}
        onChange={val => setValue(val)}
      />
    );
  },
};

export const WithSelectedDate: Story = {
  render: () => {
    const [value, setValue] = useState<ISODateString>('2026-01-15');
    return (
      <XDSCalendar
        mode="single"
        value={value}
        onChange={val => setValue(val)}
        focusDate="2026-01-01"
      />
    );
  },
};

export const RangeSelection: Story = {
  render: () => {
    const [value, setValue] = useState<DateRange | undefined>(undefined);
    return (
      <XDSCalendar
        mode="range"
        value={value}
        onChange={range => setValue(range)}
        focusDate="2026-01-01"
      />
    );
  },
};

export const RangeWithValue: Story = {
  render: () => {
    const [value, setValue] = useState<DateRange>({
      start: '2026-01-10',
      end: '2026-01-20',
    });
    return (
      <XDSCalendar
        mode="range"
        value={value}
        onChange={range => setValue(range)}
        focusDate="2026-01-01"
      />
    );
  },
};

export const TwoMonths: Story = {
  render: () => {
    const [value, setValue] = useState<ISODateString | undefined>(undefined);
    return (
      <XDSCalendar
        mode="single"
        numberOfMonths={2}
        value={value}
        onChange={val => setValue(val)}
        focusDate="2026-01-01"
      />
    );
  },
};

export const TwoMonthsRangeSelection: Story = {
  render: () => {
    const [value, setValue] = useState<DateRange | undefined>(undefined);
    return (
      <XDSCalendar
        mode="range"
        numberOfMonths={2}
        value={value}
        onChange={range => setValue(range)}
        focusDate="2026-01-01"
      />
    );
  },
};

export const MinMaxBoundary: Story = {
  render: () => {
    const [value, setValue] = useState<ISODateString | undefined>(undefined);
    return (
      <XDSCalendar
        mode="single"
        min={'2026-01-10' as ISODateString}
        max={'2026-03-20' as ISODateString}
        value={value}
        onChange={val => setValue(val)}
        focusDate={'2026-01-01' as ISODateString}
      />
    );
  },
};

export const WithDateConstraints: Story = {
  render: () => {
    const [value, setValue] = useState<ISODateString | undefined>(undefined);
    return (
      <XDSCalendar
        mode="single"
        min={'2026-01-10' as ISODateString}
        max={'2026-01-25' as ISODateString}
        value={value}
        onChange={val => setValue(val)}
        focusDate="2026-01-01"
      />
    );
  },
};

export const WeekdaysOnly: Story = {
  render: () => {
    const [value, setValue] = useState<ISODateString | undefined>(undefined);
    const isWeekday = (date: Date) => {
      const day = date.getDay();
      return day !== 0 && day !== 6;
    };
    return (
      <XDSCalendar
        mode="single"
        dateConstraints={[isWeekday]}
        value={value}
        onChange={val => setValue(val)}
        focusDate="2026-01-01"
      />
    );
  },
};

export const WithWeekNumbers: Story = {
  render: () => {
    const [value, setValue] = useState<ISODateString | undefined>(undefined);
    return (
      <XDSCalendar
        mode="single"
        hasWeekNumbers
        value={value}
        onChange={val => setValue(val)}
        focusDate="2026-01-01"
      />
    );
  },
};

export const MondayStart: Story = {
  render: () => {
    const [value, setValue] = useState<ISODateString | undefined>(undefined);
    return (
      <XDSCalendar
        mode="single"
        weekStartsOn={1}
        value={value}
        onChange={val => setValue(val)}
        focusDate="2026-01-01"
      />
    );
  },
};

export const AllVariations: Story = {
  render: () => {
    const [singleValue, setSingleValue] = useState<ISODateString | undefined>(
      undefined,
    );
    const [rangeValue, setRangeValue] = useState<DateRange | undefined>(
      undefined,
    );
    const [constrainedValue, setConstrainedValue] = useState<
      ISODateString | undefined
    >(undefined);

    const isWeekday = (date: Date) => {
      const day = date.getDay();
      return day !== 0 && day !== 6;
    };

    return (
      <div style={{display: 'flex', flexDirection: 'column', gap: '32px'}}>
        <div>
          <h3 style={{marginBottom: '8px'}}>Single Date Selection</h3>
          <XDSCalendar
            mode="single"
            value={singleValue}
            onChange={val => setSingleValue(val)}
            focusDate="2026-01-01"
          />
          <p style={{marginTop: '8px', fontSize: '14px', color: '#666'}}>
            Selected: {singleValue ?? 'None'}
          </p>
        </div>

        <div>
          <h3 style={{marginBottom: '8px'}}>Range Selection (Two Months)</h3>
          <XDSCalendar
            mode="range"
            numberOfMonths={2}
            value={rangeValue}
            onChange={range => setRangeValue(range)}
            focusDate="2026-01-01"
          />
          <p style={{marginTop: '8px', fontSize: '14px', color: '#666'}}>
            Range:{' '}
            {rangeValue
              ? `${rangeValue.start} to ${rangeValue.end}`
              : 'None selected'}
          </p>
        </div>

        <div>
          <h3 style={{marginBottom: '8px'}}>Weekdays Only with Week Numbers</h3>
          <XDSCalendar
            mode="single"
            hasWeekNumbers
            dateConstraints={[isWeekday]}
            value={constrainedValue}
            onChange={val => setConstrainedValue(val)}
            focusDate="2026-01-01"
          />
          <p style={{marginTop: '8px', fontSize: '14px', color: '#666'}}>
            Selected: {constrainedValue ?? 'None'}
          </p>
        </div>
      </div>
    );
  },
};
