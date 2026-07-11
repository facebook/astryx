// Copyright (c) Meta Platforms, Inc. and affiliates.

import { Card } from '@astryxdesign/core/Card';
import { Text } from '@astryxdesign/core/Text';
import { Heading } from '@astryxdesign/core/Heading';
import { Stack } from '@astryxdesign/core/Stack';
import { Avatar } from '@astryxdesign/core/Avatar';
import { Badge } from '@astryxdesign/core/Badge';
import { Divider } from '@astryxdesign/core/Divider';

export default function ProfileCard() {
  return (
    <Card padding={4}>
      <Stack gap={3} hAlign="center">
        <Avatar size="large" name="Sarah Chen" />
        <Heading level={2}>Sarah Chen</Heading>
        <Badge variant="purple">Senior Engineer</Badge>
        <Text color="secondary" type="body">
          Passionate about building accessible, performant UI systems.
          Working on design tools and component libraries for the past 5 years.
        </Text>
        <Divider />
        <Text type="supporting" color="secondary">
          Joined March 2021
        </Text>
      </Stack>
    </Card>
  );
}
