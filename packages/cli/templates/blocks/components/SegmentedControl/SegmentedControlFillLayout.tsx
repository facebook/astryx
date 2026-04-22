'use client';

import {useState} from 'react';
import {
  XDSSegmentedControl,
  XDSSegmentedControlItem,
} from '@xds/core/SegmentedControl';

export default function SegmentedControlFillLayout() {
  const [value, setValue] = useState('weekly');
  return (
    <div style={{width: 400}}>
      <XDSSegmentedControl
        value={value}
        onChange={setValue}
        label="Time range"
        layout="fill">
        <XDSSegmentedControlItem value="daily" label="Daily" />
        <XDSSegmentedControlItem value="weekly" label="Weekly" />
        <XDSSegmentedControlItem value="monthly" label="Monthly" />
      </XDSSegmentedControl>
    </div>
  );
}
