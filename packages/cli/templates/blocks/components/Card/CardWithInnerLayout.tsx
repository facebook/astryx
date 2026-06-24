// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {Card} from '@astryxdesign/core/Card';
import {
  Layout,
  LayoutHeader,
  LayoutContent,
  LayoutFooter,
  HStack,
} from '@astryxdesign/core/Layout';
import {Button} from '@astryxdesign/core/Button';
import {Heading, Text} from '@astryxdesign/core/Text';

export default function CardWithInnerLayout() {
  return (
    <Card width={380}>
      <Layout
        header={
          <LayoutHeader hasDivider>
            <Heading level={3}>Edit Profile</Heading>
          </LayoutHeader>
        }
        content={
          <LayoutContent>
            <Text type="body" color="secondary">
              Update your display name, bio, and profile photo. Changes are
              saved immediately.
            </Text>
          </LayoutContent>
        }
        footer={
          <LayoutFooter hasDivider>
            <HStack gap={2} hAlign="end">
              <Button label="Cancel" variant="ghost" />
              <Button label="Save changes" variant="primary" />
            </HStack>
          </LayoutFooter>
        }
      />
    </Card>
  );
}
