// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {XDSDivider} from '@xds/core/Divider';
import {XDSCard} from '@xds/core/Card';
import {XDSSection} from '@xds/core/Section';
import {XDSVStack} from '@xds/core/Layout';
import {XDSText} from '@xds/core/Text';

export default function DividerVariants() {
  return (
    <XDSSection variant="transparent" width="100%">
      <XDSCard width={400}>
        <XDSVStack gap={3}>
          <XDSVStack gap={1}>
            <XDSText type="label">Sign in with email</XDSText>
            <XDSText type="body">
              Enter your email and password to access your account.
            </XDSText>
          </XDSVStack>
          <XDSDivider label="or" />
          <XDSVStack gap={1}>
            <XDSText type="label">Sign in with SSO</XDSText>
            <XDSText type="body">
              Use your company credentials to sign in automatically.
            </XDSText>
          </XDSVStack>
          <XDSDivider variant="strong" />
          <XDSText type="supporting" color="secondary">
            By signing in, you agree to our Terms of Service and Privacy Policy.
          </XDSText>
        </XDSVStack>
      </XDSCard>
    </XDSSection>
  );
}
