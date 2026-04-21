'use client';

import {useState} from 'react';
import {XDSCheckboxList, XDSCheckboxListItem} from '@xds/core/CheckboxList';

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
        endContent={<span style={{color: '#0D8626'}}>$0/mo</span>}
      />
      <XDSCheckboxListItem
        label="Pro tier"
        value="pro"
        description="Advanced features"
        endContent={<span style={{color: '#0064E0'}}>$9/mo</span>}
      />
      <XDSCheckboxListItem
        label="Enterprise"
        value="enterprise"
        description="Custom solutions"
        endContent={<span style={{color: '#5B08D8'}}>Custom</span>}
      />
    </XDSCheckboxList>
  );
}
