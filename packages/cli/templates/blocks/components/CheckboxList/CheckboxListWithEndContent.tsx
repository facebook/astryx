// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {useState} from 'react';
import {XDSCheckboxList, XDSCheckboxListItem} from '@xds/core/CheckboxList';
import {XDSBadge} from '@xds/core/Badge';

export default function CheckboxListWithEndContent() {
  const [value, setValue] = useState<string[]>(['free']);
  return (
    <XDSCheckboxList
      label="Add-on packages"
      value={value}
      onChange={setValue}
      hasDividers>
      <XDSCheckboxListItem
        label="Free tier"
        value="free"
        description="Basic features included"
        endContent={<XDSBadge variant="success" label="$0/mo" />}
      />
      <XDSCheckboxListItem
        label="Pro tier"
        value="pro"
        description="Advanced analytics and integrations"
        endContent={<XDSBadge variant="info" label="$9/mo" />}
      />
      <XDSCheckboxListItem
        label="Enterprise"
        value="enterprise"
        description="Custom solutions and dedicated support"
        endContent={<XDSBadge variant="purple" label="Custom" />}
      />
    </XDSCheckboxList>
  );
}
