'use client';

import {useState} from 'react';
import {XDSCalendar, type DateRange} from '@xds/core/Calendar';
import {XDSStack} from '@xds/core/Layout';
import {XDSText} from '@xds/core/Text';

export default function CalendarRangeWithValue() {
  const [value, setValue] = useState<DateRange>({
    start: '2026-01-10',
    end: '2026-01-20',
  });

  return (
    <XDSStack direction="vertical" gap={4} hAlign="center">
      <XDSText type="supporting" color="secondary">
        {value.start && value.end
          ? `${value.start} → ${value.end}`
          : 'Pick a start and end date'}
      </XDSText>
      <XDSCalendar
        mode="range"
        value={value}
        onChange={range => setValue(range)}
        focusDate="2026-01-01"
      />
    </XDSStack>
  );
}
