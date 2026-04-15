'use client';

import {useState} from 'react';
import {XDSRadioList, XDSRadioListItem} from '@xds/core/RadioList';

export default function RadioListWithDescriptions() {
  const [plan, setPlan] = useState('free');

  return (
    <XDSRadioList label="Plan" value={plan} onChange={setPlan}>
      <XDSRadioListItem
        label="Free"
        value="free"
        description="Basic features, limited usage"
      />
      <XDSRadioListItem
        label="Pro"
        value="pro"
        description="All features, unlimited usage"
      />
    </XDSRadioList>
  );
}
