'use client';

import {useState} from 'react';
import {XDSRadioList, XDSRadioListItem} from '@xds/core/RadioList';

export default function RadioListPricingTier() {
  const [value, setValue] = useState('');

  return (
    <XDSRadioList label="Plan" value={value} onChange={setValue}>
      <XDSRadioListItem
        label="Free"
        value="free"
        endContent={<span style={{color: '#0D8626'}}>$0/mo</span>}
      />
      <XDSRadioListItem
        label="Pro"
        value="pro"
        endContent={<span style={{color: '#0064E0'}}>$9/mo</span>}
      />
      <XDSRadioListItem
        label="Enterprise"
        value="enterprise"
        endContent={<span style={{color: '#5B08D8'}}>Custom</span>}
      />
    </XDSRadioList>
  );
}
