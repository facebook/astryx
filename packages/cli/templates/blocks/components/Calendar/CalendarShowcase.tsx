// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {useState} from 'react';
import {Calendar} from '@astryxdesign/core/Calendar';
import type {ISODateString} from '@astryxdesign/core/Calendar';

export default function CalendarShowcase() {
  const [value, setValue] = useState<ISODateString | undefined>('2026-04-15');

  return <Calendar mode="single" value={value} onChange={setValue} />;
}
