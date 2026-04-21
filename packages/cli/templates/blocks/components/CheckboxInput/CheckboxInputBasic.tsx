'use client';

import {useState} from 'react';
import {XDSCheckboxInput} from '@xds/core/CheckboxInput';
import {XDSStack} from '@xds/core/Layout';

export default function CheckboxInputBasic() {
  const [newsletter, setNewsletter] = useState<boolean | 'indeterminate'>(true);
  const [analytics, setAnalytics] = useState<boolean | 'indeterminate'>(false);
  const [premium, setPremium] = useState<boolean | 'indeterminate'>(false);

  return (
    <XDSStack direction="vertical" gap={4}>
      <XDSCheckboxInput
        label="Subscribe to newsletter"
        description="Receive weekly updates about new features and announcements."
        value={newsletter}
        onChange={setNewsletter}
        status={{type: 'success', message: 'You are subscribed'}}
      />
      <XDSCheckboxInput
        label="Share usage analytics"
        description="Help us improve by sharing anonymous usage data."
        value={analytics}
        onChange={setAnalytics}
        status={{
          type: 'warning',
          message: 'This data may be shared with partners',
        }}
      />
      <XDSCheckboxInput
        label="Premium features"
        description="Upgrade your plan to enable this option."
        value={premium}
        onChange={setPremium}
        isDisabled
      />
    </XDSStack>
  );
}
