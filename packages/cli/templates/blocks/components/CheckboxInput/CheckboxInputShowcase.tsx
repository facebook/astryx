'use client';

import {useState} from 'react';
import {XDSCheckboxInput} from '@xds/core/CheckboxInput';
import {XDSStack} from '@xds/core/Layout';

export default function CheckboxInputShowcase() {
  const [notifications, setNotifications] = useState(true);
  const [marketing, setMarketing] = useState(false);
  const [analytics, setAnalytics] = useState(false);

  const allChecked = notifications && marketing && analytics;
  const someChecked = notifications || marketing || analytics;

  return (
    <XDSStack direction="vertical" gap={3}>
      <XDSCheckboxInput
        label="Select all"
        value={allChecked ? true : someChecked ? 'indeterminate' : false}
        onChange={checked => {
          setNotifications(checked);
          setMarketing(checked);
          setAnalytics(checked);
        }}
      />
      <XDSStack direction="vertical" gap={2}>
        <XDSCheckboxInput
          label="Email notifications"
          description="Receive updates about your account activity."
          value={notifications}
          onChange={setNotifications}
        />
        <XDSCheckboxInput
          label="Marketing emails"
          description="Receive tips, product updates, and offers."
          value={marketing}
          onChange={setMarketing}
        />
        <XDSCheckboxInput
          label="Analytics cookies"
          description="Help us improve by sharing anonymous usage data."
          value={analytics}
          onChange={setAnalytics}
        />
      </XDSStack>
    </XDSStack>
  );
}
