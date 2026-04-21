'use client';

import {useState} from 'react';
import {XDSCheckboxList, XDSCheckboxListItem} from '@xds/core/CheckboxList';
import {XDSText} from '@xds/core/Text';

export default function CheckboxInputEndContent() {
  const [value, setValue] = useState<string[]>(['free']);

  return (
    <XDSCheckboxList
      label="Add-on packages"
      description="Select the plans you want to include"
      value={value}
      onChange={setValue}
      hasDividers>
      <XDSCheckboxListItem
        label="Free tier"
        value="free"
        description="Basic features included"
        endContent={
          <XDSText type="label" color="secondary">
            $0/mo
          </XDSText>
        }
      />
      <XDSCheckboxListItem
        label="Pro tier"
        value="pro"
        description="Advanced features and priority support"
        endContent={
          <XDSText type="label" color="secondary">
            $9/mo
          </XDSText>
        }
      />
      <XDSCheckboxListItem
        label="Enterprise"
        value="enterprise"
        description="Custom solutions for your organization"
        endContent={
          <XDSText type="label" color="secondary">
            Custom
          </XDSText>
        }
      />
    </XDSCheckboxList>
  );
}
