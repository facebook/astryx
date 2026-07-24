// Copyright (c) Meta Platforms, Inc. and affiliates.

import {useState} from 'react';
import {TabList} from '@astryxdesign/core/TabList';
import {Heading, Text} from '@astryxdesign/core/Text';
import {Avatar} from '@astryxdesign/core/Avatar';
import {Card} from '@astryxdesign/core/Card';
import {Button} from '@astryxdesign/core/Button';
import {TextInput} from '@astryxdesign/core/TextInput';
import {Stack} from '@astryxdesign/core/Stack';

function OverviewTab() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-4">
        <Avatar name="Jane Doe" size="lg" />
        <div>
          <Heading level={2}>Jane Doe</Heading>
          <Text color="secondary">Software Engineer</Text>
          <Text color="secondary">San Francisco, CA</Text>
        </div>
      </div>
      <Card padding={3}>
        <Stack gap={2}>
          <Text weight="semibold">Bio</Text>
          <Text>Full-stack engineer passionate about building great user experiences.</Text>
        </Stack>
      </Card>
    </div>
  );
}

function ActivityTab() {
  const activities = [
    {action: 'Merged PR #142', time: '2 hours ago'},
    {action: 'Commented on issue #89', time: '5 hours ago'},
    {action: 'Created branch feat/new-feature', time: '1 day ago'},
  ];
  return (
    <div className="flex flex-col gap-3">
      {activities.map((activity, i) => (
        <Card key={i} padding={3}>
          <div className="flex justify-between items-center">
            <Text>{activity.action}</Text>
            <Text size="sm" color="secondary">{activity.time}</Text>
          </div>
        </Card>
      ))}
    </div>
  );
}

function SettingsTab() {
  return (
    <div className="flex flex-col gap-4 max-w-md">
      <TextInput label="Display Name" defaultValue="Jane Doe" />
      <TextInput label="Email" defaultValue="jane@example.com" />
      <TextInput label="Location" defaultValue="San Francisco, CA" />
      <Button label="Save Changes" variant="primary" />
    </div>
  );
}

export function UserProfile() {
  const [tab, setTab] = useState('overview');

  return (
    <div className="flex flex-col gap-6 p-6">
      <Heading level={1}>User Profile</Heading>
      <TabList
        value={tab}
        onChange={setTab}
        items={[
          {value: 'overview', label: 'Overview'},
          {value: 'activity', label: 'Activity'},
          {value: 'settings', label: 'Settings'},
        ]}
      />
      <div className="mt-4">
        {tab === 'overview' && <OverviewTab />}
        {tab === 'activity' && <ActivityTab />}
        {tab === 'settings' && <SettingsTab />}
      </div>
    </div>
  );
}

export default UserProfile;
