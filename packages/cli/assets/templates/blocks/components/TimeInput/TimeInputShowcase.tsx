// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {useState} from 'react';
import {TimeInput, type ISOTimeString} from '@astryxdesign/core/TimeInput';

export default function TimeInputShowcase() {
  const [time, setTime] = useState<ISOTimeString | undefined>(undefined);
  return (
    <TimeInput
      label="Time"
      placeholder="Select a time"
      value={time}
      onChange={setTime}
    />
  );
}
