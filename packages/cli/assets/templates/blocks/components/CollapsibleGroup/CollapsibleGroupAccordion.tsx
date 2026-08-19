// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {Collapsible, CollapsibleGroup} from '@astryxdesign/core/Collapsible';
import {VStack} from '@astryxdesign/core/Layout';
import {Text} from '@astryxdesign/core/Text';

export default function CollapsibleGroupAccordion() {
  return (
    <CollapsibleGroup type="single" defaultValue="account">
      <VStack gap={2} width="100%">
        <Collapsible trigger="Account" value="account">
          <Text type="body" color="secondary">
            Manage your profile details, email address, and password.
          </Text>
        </Collapsible>
        <Collapsible trigger="Notifications" value="notifications">
          <Text type="body" color="secondary">
            Choose which activity triggers email and push notifications.
          </Text>
        </Collapsible>
        <Collapsible trigger="Billing" value="billing">
          <Text type="body" color="secondary">
            View invoices and update your payment method.
          </Text>
        </Collapsible>
      </VStack>
    </CollapsibleGroup>
  );
}
