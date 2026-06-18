// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {useState} from 'react';
import {XDSDateRangeInput} from '@xds/core/DateRangeInput';
import type {DateRange} from '@xds/core/DateRangeInput';
import type {ISODateString} from '@xds/core/Calendar';
import {XDSStack} from '@xds/core/Layout';

function daysAgo(n: number): ISODateString {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().slice(0, 10) as ISODateString;
}

function today(): ISODateString {
  return new Date().toISOString().slice(0, 10) as ISODateString;
}

const presets = [
  {label: 'Last 7 days', getRange: () => ({start: daysAgo(7), end: today()})},
  {label: 'Last 30 days', getRange: () => ({start: daysAgo(30), end: today()})},
];

export default function DateRangeInputShowcase() {
  const [range, setRange] = useState<DateRange | null>(null);

  return (
    <XDSStack direction="vertical" width="100%" style={{maxWidth: 400}}>
      <XDSDateRangeInput
        label="Date range"
        value={range}
        onChange={setRange}
        presets={presets}
      />
    </XDSStack>
  );
}
