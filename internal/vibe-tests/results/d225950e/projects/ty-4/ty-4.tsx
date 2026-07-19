// Copyright (c) Meta Platforms, Inc. and affiliates.

import {useState} from 'react';
import {Heading} from '@astryxdesign/core/Heading';
import {Text} from '@astryxdesign/core/Text';
import {Switch} from '@astryxdesign/core/Switch';
import {TextInput} from '@astryxdesign/core/TextInput';
import {Button} from '@astryxdesign/core/Button';
import {Divider} from '@astryxdesign/core/Divider';

export default function SettingsPage() {
  const [displayName, setDisplayName] = useState('John Doe');
  const [email, setEmail] = useState('john@example.com');
  const [darkMode, setDarkMode] = useState(false);
  const [compactView, setCompactView] = useState(false);
  const [emailNotifs, setEmailNotifs] = useState(true);
  const [pushNotifs, setPushNotifs] = useState(true);
  const [weeklyDigest, setWeeklyDigest] = useState(false);

  return (
    <div className="flex flex-col gap-6 max-w-2xl mx-auto p-6">
      <Heading level={1}>Settings</Heading>

      <section className="flex flex-col gap-3 p-4 border rounded-lg">
        <Heading level={2}>Profile</Heading>
        <Text color="secondary">Manage your personal information and account details.</Text>
        <Divider />
        <TextInput label="Display Name" value={displayName} onChange={setDisplayName} />
        <TextInput label="Email" value={email} onChange={setEmail} type="email" />
        <Button label="Save Profile" variant="primary" />
      </section>

      <section className="flex flex-col gap-3 p-4 border rounded-lg">
        <Heading level={2}>Appearance</Heading>
        <Text color="secondary">Customize how the app looks and feels.</Text>
        <Divider />
        <Switch label="Dark mode" value={darkMode} onChange={setDarkMode} />
        <Switch label="Compact view" value={compactView} onChange={setCompactView} />
      </section>

      <section className="flex flex-col gap-3 p-4 border rounded-lg">
        <Heading level={2}>Notifications</Heading>
        <Text color="secondary">Choose how and when you want to be notified.</Text>
        <Divider />
        <Switch label="Email notifications" value={emailNotifs} onChange={setEmailNotifs} />
        <Switch label="Push notifications" value={pushNotifs} onChange={setPushNotifs} />
        <Switch label="Weekly digest" value={weeklyDigest} onChange={setWeeklyDigest} />
      </section>
    </div>
  );
}
