// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {XDSSection} from '@xds/core/Section';
import {XDSStack} from '@xds/core/Layout';
import {XDSHeading, XDSText} from '@xds/core/Text';

export default function SectionWithDividers() {
  return (
    <XDSStack direction="vertical" gap={0}>
      <XDSSection variant="section" padding={5} dividers={['bottom']}>
        <XDSStack direction="vertical" gap={1}>
          <XDSHeading level={4}>Account</XDSHeading>
          <XDSText type="body" color="secondary">
            Manage your profile, email, and password.
          </XDSText>
        </XDSStack>
      </XDSSection>
      <XDSSection variant="section" padding={5} dividers={['bottom']}>
        <XDSStack direction="vertical" gap={1}>
          <XDSHeading level={4}>Notifications</XDSHeading>
          <XDSText type="body" color="secondary">
            Choose what updates you receive and how.
          </XDSText>
        </XDSStack>
      </XDSSection>
      <XDSSection variant="section" padding={5}>
        <XDSStack direction="vertical" gap={1}>
          <XDSHeading level={4}>Privacy</XDSHeading>
          <XDSText type="body" color="secondary">
            Control who can see your activity and data.
          </XDSText>
        </XDSStack>
      </XDSSection>
    </XDSStack>
  );
}
