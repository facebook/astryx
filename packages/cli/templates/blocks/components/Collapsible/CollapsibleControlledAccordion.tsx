'use client';

import {useState} from 'react';
import {XDSCollapsible, XDSCollapsibleGroup} from '@xds/core/Collapsible';
import {XDSCard} from '@xds/core/Card';
import {XDSText} from '@xds/core/Text';
import {XDSVStack} from '@xds/core/Layout';

export default function CollapsibleControlledAccordion() {
  const [open, setOpen] = useState<string | string[]>('profile');
  return (
    <XDSCollapsibleGroup type="single" value={open} onChange={setOpen}>
      <XDSVStack gap={2}>
        <XDSCard>
          <XDSCollapsible trigger="Profile Information" value="profile">
            <XDSText type="body">
              Update your name, email, and profile photo. Changes are saved
              automatically.
            </XDSText>
          </XDSCollapsible>
        </XDSCard>
        <XDSCard>
          <XDSCollapsible trigger="Security" value="security">
            <XDSText type="body">
              Manage two-factor authentication, active sessions, and login
              history.
            </XDSText>
          </XDSCollapsible>
        </XDSCard>
        <XDSCard>
          <XDSCollapsible trigger="Billing" value="billing">
            <XDSText type="body">
              View invoices, update payment method, and manage your subscription
              plan.
            </XDSText>
          </XDSCollapsible>
        </XDSCard>
      </XDSVStack>
    </XDSCollapsibleGroup>
  );
}
