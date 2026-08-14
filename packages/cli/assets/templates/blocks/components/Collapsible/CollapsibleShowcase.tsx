// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {Collapsible, CollapsibleGroup} from '@astryxdesign/core/Collapsible';
import {Text} from '@astryxdesign/core/Text';
import {Card} from '@astryxdesign/core/Card';
import {VStack} from '@astryxdesign/core/Layout';

export default function CollapsibleShowcase() {
  return (
    <Card width={400}>
      <CollapsibleGroup type="single" defaultValue="notifications">
        <VStack gap={6}>
          <Collapsible trigger="General settings" value="general">
            <Text type="body" color="secondary">
              Configure your display name, language, and time zone preferences.
            </Text>
          </Collapsible>
          <Collapsible trigger="Notifications" value="notifications">
            <Text type="body" color="secondary">
              Choose which email and push notifications you want to receive.
            </Text>
          </Collapsible>
          <Collapsible trigger="Privacy" value="privacy">
            <Text type="body" color="secondary">
              Manage your data sharing preferences and account visibility.
            </Text>
          </Collapsible>
        </VStack>
      </CollapsibleGroup>
    </Card>
  );
}
