// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {useState} from 'react';
import {CheckboxInput} from '@xds/core/CheckboxInput';
import {Stack} from '@xds/core/Layout';

export default function CheckboxInputShowcase() {
  const [notifications, setNotifications] = useState(true);
  const [marketing, setMarketing] = useState(false);

  return (
    <Stack direction="vertical" gap={2}>
      <CheckboxInput
        label="Checked"
        value={notifications}
        onChange={setNotifications}
      />
      <CheckboxInput
        label="Unchecked"
        value={marketing}
        onChange={setMarketing}
      />
    </Stack>
  );
}
