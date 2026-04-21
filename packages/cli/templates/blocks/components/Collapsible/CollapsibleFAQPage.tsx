'use client';

import {XDSCollapsible, XDSCollapsibleGroup} from '@xds/core/Collapsible';
import {XDSCard} from '@xds/core/Card';
import {XDSText} from '@xds/core/Text';
import {XDSVStack} from '@xds/core/Layout';

export default function CollapsibleFAQPage() {
  return (
    <XDSCollapsibleGroup type="single">
      <XDSVStack gap={2}>
        <XDSCard width="100%">
          <XDSCollapsible trigger="How do I reset my password?" value="q1">
            <XDSText type="body">
              Go to Settings, then Security, then Change Password. You will
              receive a confirmation email within a few minutes.
            </XDSText>
          </XDSCollapsible>
        </XDSCard>
        <XDSCard width="100%">
          <XDSCollapsible trigger="Can I change my username?" value="q2">
            <XDSText type="body">
              Usernames can be changed once every 30 days from your profile
              settings.
            </XDSText>
          </XDSCollapsible>
        </XDSCard>
        <XDSCard width="100%">
          <XDSCollapsible trigger="How do I delete my account?" value="q3">
            <XDSText type="body">
              Account deletion is permanent. Go to Settings, then Account, then
              Delete Account. Your data will be removed within 30 days.
            </XDSText>
          </XDSCollapsible>
        </XDSCard>
        <XDSCard width="100%">
          <XDSCollapsible
            trigger="What payment methods are accepted?"
            value="q4">
            <XDSText type="body">
              We accept Visa, Mastercard, American Express, and PayPal.
            </XDSText>
          </XDSCollapsible>
        </XDSCard>
      </XDSVStack>
    </XDSCollapsibleGroup>
  );
}
