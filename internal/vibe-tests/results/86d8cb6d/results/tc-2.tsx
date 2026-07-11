// Copyright (c) Meta Platforms, Inc. and affiliates.

import { Card } from '@astryxdesign/core/Card';
import { Text } from '@astryxdesign/core/Text';
import { Stack } from '@astryxdesign/core/Stack';
import { Button } from '@astryxdesign/core/Button';
import { Badge } from '@astryxdesign/core/Badge';
import { Heading } from '@astryxdesign/core/Heading';

/**
 * Custom brand theme configuration.
 * Apply via the Astryx theme system:
 *   npx astryx theme build --accent "#7B61FF" --surface dark
 */
export default function BrandThemeDemo() {
  return (
    <Stack gap={4}>
      <Heading level={2}>Custom Brand Theme</Heading>
      <Text color="secondary">
        Primary accent: #7B61FF (purple), dark surface background
      </Text>
      <Card padding={3}>
        <Stack gap={3}>
          <Text type="label" weight="semibold">Theme Preview</Text>
          <Stack gap={2}>
            <Button variant="primary">Primary Action</Button>
            <Button variant="secondary">Secondary Action</Button>
            <Button variant="ghost">Ghost Action</Button>
          </Stack>
          <Stack gap={1}>
            <Badge variant="purple">Accent Badge</Badge>
            <Badge variant="neutral">Neutral Badge</Badge>
          </Stack>
          <Text color="secondary">
            The accent color flows through all interactive elements via the theme token system.
          </Text>
        </Stack>
      </Card>
    </Stack>
  );
}
