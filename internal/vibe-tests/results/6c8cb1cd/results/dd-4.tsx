// Copyright (c) Meta Platforms, Inc. and affiliates.

import {useState} from 'react';
import {TabList} from '@astryxdesign/core/TabList';
import {Stack} from '@astryxdesign/core/Stack';
import {Heading, Text} from '@astryxdesign/core/Text';
import {Avatar} from '@astryxdesign/core/Avatar';
import {Card} from '@astryxdesign/core/Card';
import {Button} from '@astryxdesign/core/Button';
import {TextInput} from '@astryxdesign/core/TextInput';

function OverviewTab() {
  return (
    <Stack gap={4}>
      <Stack direction="row" gap={4} align="center">
        <Avatar name="Jane Doe" size="lg" />
        <Stack gap={1}>
          <Heading level={2}>Jane Doe</Heading>
          <Text color="secondary">Software Engineer</Text>
          <Text color="secondary">San Francisco, CA</Text>
        </Stack>
      </Stack>
      <Card padding={3}>
        <Stack gap={2}>
          <Text weight="semibold">Bio</Text>
          <Text>Full-stack engineer passionate about building great user experiences.</Text>
        </Stack>
      </Card>
    </Stack>
  );
}

function ActivityTab() {
  const activities = [
    {action: 'Merged PR #142', time: '2 hours ago'},
    {action: 'Commented on issue #89', time: '5 hours ago'},
    {action: 'Created branch feat/new-feature', time: '1 day ago'},
  ];
  return (
    <Stack gap={3}>
      {activities.map((activity, i) => (
        <Card key={i} padding={3}>
          <Stack direction="row" justify="between">
            <Text>{activity.action}</Text>
            <Text size="sm" color="secondary">{activity.time}</Text>
          </Stack>
        </Card>
      ))}
    </Stack>
  );
}

function SettingsTab() {
  return (
    <Stack gap={4}>
      <TextInput label="Display Name" defaultValue="Jane Doe" />
      <TextInput label="Email" defaultValue="jane@example.com" />
      <TextInput label="Location" defaultValue="San Francisco, CA" />
      <Button label="Save Changes" variant="primary" />
    </Stack>
  );
}

export function UserProfile() {
  const [tab, setTab] = useState('overview');

  return (
    <Stack gap={4} padding={4}>
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
      {tab === 'overview' && <OverviewTab />}
      {tab === 'activity' && <ActivityTab />}
      {tab === 'settings' && <SettingsTab />}
    </Stack>
  );
}

export default UserProfile;
