'use client';

import {XDSCheckboxInput} from '@xds/core/CheckboxInput';
import {useState} from 'react';

export default function CheckboxInputWithDescription() {
  const [subscribed, setSubscribed] = useState(false);
  return (
    <XDSCheckboxInput
      label="Subscribe to newsletter"
      description="Receive weekly updates about new features"
      value={subscribed}
      onChange={setSubscribed}
    />
  );
}
