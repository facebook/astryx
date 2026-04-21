'use client';

import {useState} from 'react';
import {XDSCalendar, type ISODateString} from '@xds/core/Calendar';
import {XDSStack} from '@xds/core/Layout';
import {XDSText} from '@xds/core/Text';

const isWeekday = (date: Date) => {
  const day = date.getDay();
  return day !== 0 && day !== 6;
};

export default function CalendarConstraints() {
  const [value, setValue] = useState<ISODateString | undefined>(undefined);

  return (
    <XDSStack direction="vertical" gap={4} hAlign="center">
      <XDSText type="supporting" color="secondary">
        Jan 10 – Mar 20, weekdays only
      </XDSText>
      <XDSCalendar
        mode="single"
        min={'2026-01-10' as ISODateString}
        max={'2026-03-20' as ISODateString}
        dateConstraints={[isWeekday]}
        value={value}
        onChange={val => setValue(val)}
        focusDate={'2026-01-01' as ISODateString}
      />
    </XDSStack>
  );
}
