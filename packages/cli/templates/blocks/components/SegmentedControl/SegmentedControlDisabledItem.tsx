'use client';

import {useState} from 'react';
import {
  XDSSegmentedControl,
  XDSSegmentedControlItem,
} from '@xds/core/SegmentedControl';

export default function SegmentedControlDisabledItem() {
  const [value, setValue] = useState('hourly');
  return (
    <XDSSegmentedControl
      value={value}
      onChange={setValue}
      label="Data granularity">
      <XDSSegmentedControlItem value="hourly" label="Hourly" />
      <XDSSegmentedControlItem value="daily" label="Daily" />
      <XDSSegmentedControlItem value="weekly" label="Weekly" isDisabled />
    </XDSSegmentedControl>
  );
}
