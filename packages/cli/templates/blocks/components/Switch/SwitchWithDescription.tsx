// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {useState} from 'react';
import {Switch} from '@xds/core/Switch';

export default function SwitchWithDescription() {
  const [value, setValue] = useState(false);
  return (
    <Switch
      label="Dark mode"
      description="Switch to a darker color scheme."
      value={value}
      onChange={setValue}
    />
  );
}
