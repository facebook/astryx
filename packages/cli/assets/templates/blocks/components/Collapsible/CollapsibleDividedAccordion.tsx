// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {Collapsible, CollapsibleGroup} from '@astryxdesign/core/Collapsible';
import {Text} from '@astryxdesign/core/Text';

export default function CollapsibleDividedAccordion() {
  return (
    <div style={{width: '100%', maxWidth: 400}}>
      <CollapsibleGroup type="single" hasDividers defaultValue="reset">
        <Collapsible trigger="How do I reset my password?" value="reset">
          <Text type="body">
            Go to Settings → Security → Change Password. You'll receive a
            confirmation email within a few minutes.
          </Text>
        </Collapsible>
        <Collapsible trigger="Can I change my username?" value="username">
          <Text type="body">
            Usernames can be changed once every 30 days from your profile
            settings.
          </Text>
        </Collapsible>
        <Collapsible trigger="How do I delete my account?" value="delete">
          <Text type="body">
            Account deletion is permanent. Your data will be removed within 30
            days.
          </Text>
        </Collapsible>
      </CollapsibleGroup>
    </div>
  );
}
