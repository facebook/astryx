// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {useState} from 'react';
import {CheckboxList, CheckboxListItem} from '@astryxdesign/core/CheckboxList';
import {Badge} from '@astryxdesign/core/Badge';

export default function CheckboxListWithEndContent() {
  const [value, setValue] = useState<string[]>(['free']);
  return (
    <CheckboxList
      label="Add-on packages"
      value={value}
      onChange={setValue}
      hasDividers>
      <CheckboxListItem
        label="Free tier"
        value="free"
        description="Basic features included"
        endContent={<Badge variant="success" label="$0/mo" />}
      />
      <CheckboxListItem
        label="Pro tier"
        value="pro"
        description="Advanced analytics and integrations"
        endContent={<Badge variant="info" label="$9/mo" />}
      />
      <CheckboxListItem
        label="Enterprise"
        value="enterprise"
        description="Custom solutions and dedicated support"
        endContent={<Badge variant="purple" label="Custom" />}
      />
    </CheckboxList>
  );
}
