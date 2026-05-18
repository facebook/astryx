// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {useState} from 'react';
import {XDSCalendar, type ISODateString} from '@xds/core/Calendar';
import {XDSStack} from '@xds/core/Layout';
import {XDSText} from '@xds/core/Text';

export default function CalendarSingle() {
  const [value, setValue] = useState<ISODateString>('2026-01-15');

  return (
    <XDSStack direction="vertical" gap={4} hAlign="center">
      <XDSText type="supporting" color="secondary">
        {value ? `Selected: ${value}` : 'Pick a date'}
      </XDSText>
      <XDSCalendar
        mode="single"
        value={value}
        onChange={val => setValue(val)}
        focusDate="2026-01-01"
      />
    </XDSStack>
  );
}
