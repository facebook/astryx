// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {useState} from 'react';
import {XDSCheckboxInput} from '@xds/core/CheckboxInput';
import {XDSStack} from '@xds/core/Layout';
import {XDSDivider} from '@xds/core/Divider';

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
    <XDSStack direction="vertical" gap={3}>
      <XDSCheckboxInput
        label="Select all notifications"
        description={`${checkedCount} of ${totalCount} enabled`}
        value={selectAllValue}
        onChange={handleSelectAll}
      />
      <XDSDivider />
      <XDSStack direction="vertical" gap={3}>
        <XDSCheckboxInput
          label="Email notifications"
          value={items.email}
          onChange={v => setItems(prev => ({...prev, email: v}))}
        />
        <XDSCheckboxInput
          label="Push notifications"
          value={items.push}
          onChange={v => setItems(prev => ({...prev, push: v}))}
        />
        <XDSCheckboxInput
          label="SMS alerts"
          value={items.sms}
          onChange={v => setItems(prev => ({...prev, sms: v}))}
        />
        <XDSCheckboxInput
          label="Slack messages"
          value={items.slack}
          onChange={v => setItems(prev => ({...prev, slack: v}))}
        />
      </XDSStack>
    </XDSStack>
  );
}
