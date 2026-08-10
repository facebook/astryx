// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {useState} from 'react';
import {Button} from '@astryxdesign/core/Button';
import {
  Calendar,
  type DateRange,
  type ISODateString,
} from '@astryxdesign/core/Calendar';
import {ComplexSelector} from '@astryxdesign/core/ComplexSelector';
import {Divider} from '@astryxdesign/core/Divider';
import {HStack, VStack} from '@astryxdesign/core/Layout';
import {List, ListItem} from '@astryxdesign/core/List';
import {Text} from '@astryxdesign/core/Text';

const PRESETS: Array<{
  label: string;
  start: ISODateString;
  end: ISODateString;
}> = [
  {label: 'Last 7 days', start: '2026-03-02', end: '2026-03-08'},
  {label: 'Last 30 days', start: '2026-02-07', end: '2026-03-08'},
  {label: 'This quarter', start: '2026-01-01', end: '2026-03-08'},
  {label: 'Previous quarter', start: '2025-10-01', end: '2025-12-31'},
];

function formatDay(date: ISODateString, hasYear = false) {
  return new Date(`${date}T00:00:00`).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: hasYear ? 'numeric' : undefined,
  });
}

function formatRange(range: DateRange) {
  if (range.start == null || range.end == null) {
    return undefined;
  }
  const isSameYear = range.start.slice(0, 4) === range.end.slice(0, 4);
  return `${formatDay(range.start, !isSameYear)} – ${formatDay(range.end, true)}`;
}

function DateRangeContent({
  value,
  onChange,
  close,
}: {
  value: DateRange;
  onChange: (value: DateRange) => void;
  close: () => void;
}) {
  const [draft, setDraft] = useState(value);
  const isComplete = draft.start != null && draft.end != null;

  return (
    <VStack gap={3}>
      <HStack gap={4} wrap="wrap">
        <List>
          {PRESETS.map(preset => (
            <ListItem
              key={preset.label}
              label={preset.label}
              isSelected={
                draft.start === preset.start && draft.end === preset.end
              }
              onClick={() => setDraft({start: preset.start, end: preset.end})}
            />
          ))}
        </List>
        <Calendar
          mode="range"
          value={draft}
          onChange={setDraft}
          focusDate={draft.start ?? '2026-03-01'}
        />
      </HStack>
      <Divider />
      <HStack gap={2} vAlign="center" hAlign="end">
        <Text type="supporting" color="secondary">
          {formatRange(draft) ?? 'Pick a start and end date'}
        </Text>
        <Button label="Cancel" variant="ghost" onClick={close} />
        <Button
          label="Apply"
          variant="primary"
          isDisabled={!isComplete}
          onClick={() => {
            onChange(draft);
            close();
          }}
        />
      </HStack>
    </VStack>
  );
}

export default function ComplexSelectorShowcase() {
  const [range, setRange] = useState<DateRange>({
    start: '2026-03-02',
    end: '2026-03-08',
  });

  return (
    <ComplexSelector<DateRange>
      label="Reporting period"
      description="Pick a preset or draw a custom range"
      width={320}
      value={range}
      onChange={setRange}
      placeholder="All time"
      triggerLabel={formatRange(range)}>
      {(value, onChange, close) => (
        <DateRangeContent value={value} onChange={onChange} close={close} />
      )}
    </ComplexSelector>
  );
}
