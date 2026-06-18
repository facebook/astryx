// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {useState} from 'react';
import {CheckboxInput} from '@xds/core/CheckboxInput';
import {Stack} from '@xds/core/Layout';
import {Divider} from '@xds/core/Divider';

export default function CheckboxInputIndeterminateState() {
  const [items, setItems] = useState({
    email: true,
    push: false,
    sms: true,
    slack: false,
  });

  const checkedCount = Object.values(items).filter(Boolean).length;
  const totalCount = Object.keys(items).length;
  const selectAllValue =
    checkedCount === 0
      ? false
      : checkedCount === totalCount
        ? true
        : ('indeterminate' as const);

  const handleSelectAll = (checked: boolean) => {
    setItems({email: checked, push: checked, sms: checked, slack: checked});
  };

  return (
    <Stack direction="vertical" gap={3}>
      <CheckboxInput
        label="Select all notifications"
        description={`${checkedCount} of ${totalCount} enabled`}
        value={selectAllValue}
        onChange={handleSelectAll}
      />
      <Divider />
      <Stack direction="vertical" gap={3}>
        <CheckboxInput
          label="Email notifications"
          value={items.email}
          onChange={v => setItems(prev => ({...prev, email: v}))}
        />
        <CheckboxInput
          label="Push notifications"
          value={items.push}
          onChange={v => setItems(prev => ({...prev, push: v}))}
        />
        <CheckboxInput
          label="SMS alerts"
          value={items.sms}
          onChange={v => setItems(prev => ({...prev, sms: v}))}
        />
        <CheckboxInput
          label="Slack messages"
          value={items.slack}
          onChange={v => setItems(prev => ({...prev, slack: v}))}
        />
      </Stack>
    </Stack>
  );
}
