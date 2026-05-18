// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {useState} from 'react';
import {XDSCalendar, type DateRange} from '@xds/core/Calendar';
import {XDSStack} from '@xds/core/Layout';
import {XDSText} from '@xds/core/Text';

export default function CalendarTwoMonths() {
  const [value, setValue] = useState<DateRange>({
    start: '2026-01-25',
    end: '2026-02-05',
  });

  return (
    <XDSStack direction="vertical" gap={4} hAlign="center">
      <XDSText type="supporting" color="secondary">
        {value.start && value.end
          ? `${value.start} → ${value.end}`
          : 'Pick a date range'}
      </XDSText>
      <XDSCalendar
        mode="range"
        numberOfMonths={2}
        value={value}
        onChange={range => setValue(range)}
        focusDate="2026-01-01"
      />
    </XDSStack>
  );
}
