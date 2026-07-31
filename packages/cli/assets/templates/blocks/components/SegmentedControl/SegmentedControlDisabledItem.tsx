// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {useState} from 'react';
import {
  SegmentedControl,
  SegmentedControlItem,
} from '@astryxdesign/core/SegmentedControl';

export default function SegmentedControlDisabledItem() {
  const [value, setValue] = useState('hourly');
  return (
    <SegmentedControl
      value={value}
      onChange={setValue}
      label="Data granularity">
      <SegmentedControlItem value="hourly" label="Hourly" />
      <SegmentedControlItem value="daily" label="Daily" />
      <SegmentedControlItem value="weekly" label="Weekly" isDisabled />
    </SegmentedControl>
  );
}
