'use client';

import {useState} from 'react';
import {XDSRadioList, XDSRadioListItem} from '@xds/core/RadioList';

export default function RadioListItemShowcase() {
  const [value, setValue] = useState('standard');

  return (
    <XDSRadioList label="Shipping method" value={value} onChange={setValue}>
      <XDSRadioListItem
        label="Standard"
        value="standard"
        description="5–7 business days"
      />
      <XDSRadioListItem
        label="Express"
        value="express"
        description="2–3 business days"
      />
      <XDSRadioListItem
        label="Overnight"
        value="overnight"
        description="Next business day"
      />
      <XDSRadioListItem
        label="Same day"
        value="sameday"
        description="Not available in your area"
        isDisabled
      />
    </XDSRadioList>
  );
}
