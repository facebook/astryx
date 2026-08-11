// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {useState} from 'react';
import {DateRangeInput} from '@astryxdesign/core/DateRangeInput';
import type {DateRange} from '@astryxdesign/core/DateRangeInput';
import type {ISODateString} from '@astryxdesign/core/Calendar';
import {Stack} from '@astryxdesign/core/Layout';
import {Text} from '@astryxdesign/core/Text';

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
  {label: 'Last 14 days', getRange: () => ({start: daysAgo(14), end: today()})},
  {label: 'Last 30 days', getRange: () => ({start: daysAgo(30), end: today()})},
  {label: 'Last 90 days', getRange: () => ({start: daysAgo(90), end: today()})},
];

export default function DateRangeInputWithPresets() {
  const [range, setRange] = useState<DateRange | null>(null);

  return (
    <Stack direction="vertical" gap={4} width="100%" style={{maxWidth: 400}}>
      <Text type="supporting" color="secondary">
        {range ? `${range.start} → ${range.end}` : 'No range selected'}
      </Text>
      <DateRangeInput
        label="Report period"
        description="Use a preset or pick a custom range"
        value={range}
        onChange={setRange}
        presets={presets}
      />
    </Stack>
  );
}
