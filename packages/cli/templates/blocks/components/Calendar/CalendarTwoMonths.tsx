// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {useState} from 'react';
import {Calendar, type DateRange} from '@xds/core/Calendar';
import {Stack} from '@xds/core/Layout';
import {Text} from '@xds/core/Text';

export default function CalendarTwoMonths() {
  const [value, setValue] = useState<DateRange>({
    start: '2026-01-25',
    end: '2026-02-05',
  });

  return (
    <Stack direction="vertical" gap={4} hAlign="center">
      <Text type="supporting" color="secondary">
        {value.start && value.end
          ? `${value.start} → ${value.end}`
          : 'Pick a date range'}
      </Text>
      <Calendar
        mode="range"
        numberOfMonths={2}
        value={value}
        onChange={range => setValue(range)}
        focusDate="2026-01-01"
      />
    </Stack>
  );
}
