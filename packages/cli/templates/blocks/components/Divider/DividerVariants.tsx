'use client';

import {XDSDivider} from '@xds/core/Divider';
import {XDSCard} from '@xds/core/Card';
import {XDSSection} from '@xds/core/Section';
import {XDSVStack} from '@xds/core/Layout';
import {XDSText} from '@xds/core/Text';

export default function DividerVariants() {
  return (
    <XDSSection variant="wash">
      <XDSCard>
        <XDSVStack gap={3}>
          <XDSText type="label">Account Settings</XDSText>
          <XDSText type="body">
            Manage your profile, security, and notification preferences.
          </XDSText>
          <XDSDivider />
          <XDSText type="label">Security</XDSText>
          <XDSText type="body">
            Two-factor authentication is enabled. Last login: Apr 18, 2026.
          </XDSText>
          <XDSDivider label="or" />
          <XDSText type="body">
            Sign in with a different method to verify your identity.
          </XDSText>
          <XDSDivider variant="strong" />
          <XDSText type="supporting" color="secondary">
            Subtle dividers separate related sections. Labeled dividers mark
            alternatives. Strong dividers create high-contrast boundaries.
          </XDSText>
        </XDSVStack>
      </XDSCard>
    </XDSSection>
  );
}
