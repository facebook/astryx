// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {useState} from 'react';
import {DateInput} from '@astryxdesign/core/DateInput';
import {Stack} from '@astryxdesign/core/Layout';
import {Text} from '@astryxdesign/core/Text';

type DateString =
  `${number}${number}${number}${number}-${number}${number}-${number}${number}`;

export default function DateInputWithDescription() {
  const [value, setValue] = useState<DateString | undefined>(undefined);

  return (
    <Stack direction="vertical" gap={4} width="100%" style={{maxWidth: 400}}>
      <Text type="supporting" color="secondary">
        Helper text explains what the field expects
      </Text>
      <DateInput
        label="Start date"
        description="Your subscription begins on this date"
        placeholder="Select a start date"
        value={value}
        onChange={setValue}
      />
    </Stack>
  );
}
