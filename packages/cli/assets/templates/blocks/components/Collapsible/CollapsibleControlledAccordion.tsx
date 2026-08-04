// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {useState} from 'react';
import {Collapsible, CollapsibleGroup} from '@astryxdesign/core/Collapsible';
import {Card} from '@astryxdesign/core/Card';
import {Text} from '@astryxdesign/core/Text';
import {VStack} from '@astryxdesign/core/Layout';

export default function CollapsibleControlledAccordion() {
  const [open, setOpen] = useState<string | string[]>('profile');
  return (
    <CollapsibleGroup type="single" value={open} onChange={setOpen}>
      <VStack gap={2} style={{width: '100%', maxWidth: 400}}>
        <Card>
          <Collapsible trigger="Profile Information" value="profile">
            <Text type="body">
              Update your name, email, and profile photo. Changes are saved
              automatically.
            </Text>
          </Collapsible>
        </Card>
        <Card>
          <Collapsible trigger="Security" value="security">
            <Text type="body">
              Manage two-factor authentication, active sessions, and login
              history.
            </Text>
          </Collapsible>
        </Card>
        <Card>
          <Collapsible trigger="Billing" value="billing">
            <Text type="body">
              View invoices, update payment method, and manage your subscription
              plan.
            </Text>
          </Collapsible>
        </Card>
      </VStack>
    </CollapsibleGroup>
  );
}
