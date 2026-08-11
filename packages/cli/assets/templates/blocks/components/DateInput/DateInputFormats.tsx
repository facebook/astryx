// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {useState} from 'react';
import {DateInput} from '@astryxdesign/core/DateInput';
import {Stack} from '@astryxdesign/core/Layout';
import {Text} from '@astryxdesign/core/Text';

type DateString =
  `${number}${number}${number}${number}-${number}${number}-${number}${number}`;

export default function DateInputFormats() {
  const [value, setValue] = useState<DateString | undefined>(
    '2026-03-21' as DateString,
  );

  return (
    <Stack direction="vertical" gap={4} width="100%" style={{maxWidth: 400}}>
      <Text type="supporting" color="secondary">
        The same committed date, displayed with different formats.
      </Text>
      <DateInput
        label="Short month (date)"
        value={value}
        onChange={setValue}
        format="date"
      />
      <DateInput
        label="Long month (date_long, default)"
        value={value}
        onChange={setValue}
        format="date_long"
      />
      <DateInput
        label="With weekday (date_weekday)"
        value={value}
        onChange={setValue}
        format="date_weekday"
      />
      <DateInput
        label="ISO 8601 (system_date)"
        value={value}
        onChange={setValue}
        format="system_date"
      />
      <DateInput
        label="Custom function"
        value={value}
        onChange={setValue}
        format={iso => `Ship by ${iso}`}
      />
    </Stack>
  );
}
