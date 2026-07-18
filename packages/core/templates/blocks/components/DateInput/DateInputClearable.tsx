// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {useState} from 'react';
import {DateInput} from '@astryxdesign/core/DateInput';
import {Stack} from '@astryxdesign/core/Layout';
import {Text} from '@astryxdesign/core/Text';

type DateString =
  `${number}${number}${number}${number}-${number}${number}-${number}${number}`;

export default function DateInputClearable() {
  const [value, setValue] = useState<DateString | undefined>(
    '2026-04-06' as DateString,
  );

  return (
    <Stack direction="vertical" gap={4} width="100%" style={{maxWidth: 400}}>
      <Text type="supporting" color="secondary">
        {value ? `Selected: ${value}` : 'No date selected'}
      </Text>
      <DateInput
        label="Event date"
        description="Pick a date for your event"
        placeholder="Select a date"
        value={value}
        onChange={setValue}
        hasClear
      />
    </Stack>
  );
}
