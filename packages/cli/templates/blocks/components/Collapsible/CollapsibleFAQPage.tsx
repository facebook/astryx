'use client';

import {XDSCollapsible, XDSCollapsibleGroup} from '@xds/core/Collapsible';
import {XDSCard} from '@xds/core/Card';
import {XDSVStack} from '@xds/core/Layout';

export default function CollapsibleFAQPage() {
  return (
    <XDSCollapsibleGroup type="single">
      <XDSVStack gap={2}>
        <XDSCard>
          <XDSCollapsible trigger="How do I reset my password?" value="q1">
            <p style={{margin: 0}}>
              Go to Settings &rarr; Security &rarr; Change Password. You'll
              receive a confirmation email.
            </p>
          </XDSCollapsible>
        </XDSCard>
        <XDSCard>
          <XDSCollapsible trigger="Can I change my username?" value="q2">
            <p style={{margin: 0}}>
              Usernames can be changed once every 30 days from your profile
              settings.
            </p>
          </XDSCollapsible>
        </XDSCard>
        <XDSCard>
          <XDSCollapsible trigger="How do I delete my account?" value="q3">
            <p style={{margin: 0}}>
              Account deletion is permanent. Go to Settings &rarr; Account
              &rarr; Delete Account. Your data will be removed within 30 days.
            </p>
          </XDSCollapsible>
        </XDSCard>
        <XDSCard>
          <XDSCollapsible
            trigger="What payment methods are accepted?"
            value="q4">
            <p style={{margin: 0}}>
              We accept Visa, Mastercard, American Express, and PayPal.
            </p>
          </XDSCollapsible>
        </XDSCard>
      </XDSVStack>
    </XDSCollapsibleGroup>
  );
}
