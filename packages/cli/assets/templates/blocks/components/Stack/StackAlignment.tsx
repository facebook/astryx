// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {Stack} from '@astryxdesign/core/Layout';
import {Card} from '@astryxdesign/core/Card';
import {Button} from '@astryxdesign/core/Button';
import {Text} from '@astryxdesign/core/Text';

export default function StackAlignment() {
  return (
    <Stack direction="vertical" gap={3} width="100%" style={{maxWidth: 500}}>
      <Card padding={4}>
        <Stack direction="vertical" gap={4}>
          <Text type="supporting" color="secondary">
            Start (left)
          </Text>
          <Stack direction="horizontal" gap={1} hAlign="start">
            <Button label="Cancel" variant="secondary" size="sm" />
            <Button label="Save" variant="primary" size="sm" />
          </Stack>
        </Stack>
      </Card>
      <Card padding={4}>
        <Stack direction="vertical" gap={4}>
          <Text type="supporting" color="secondary">
            Center
          </Text>
          <Stack direction="horizontal" gap={1} hAlign="center">
            <Button label="Cancel" variant="secondary" size="sm" />
            <Button label="Save" variant="primary" size="sm" />
          </Stack>
        </Stack>
      </Card>
      <Card padding={4}>
        <Stack direction="vertical" gap={4}>
          <Text type="supporting" color="secondary">
            End (right)
          </Text>
          <Stack direction="horizontal" gap={1} hAlign="end">
            <Button label="Cancel" variant="secondary" size="sm" />
            <Button label="Save" variant="primary" size="sm" />
          </Stack>
        </Stack>
      </Card>
    </Stack>
  );
}
