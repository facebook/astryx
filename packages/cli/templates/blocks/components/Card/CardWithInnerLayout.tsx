// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {XDSCard} from '@xds/core/Card';
import {
  XDSLayout,
  XDSLayoutHeader,
  XDSLayoutContent,
  XDSLayoutFooter,
  XDSHStack,
} from '@xds/core/Layout';
import {XDSButton} from '@xds/core/Button';
import {XDSHeading, XDSText} from '@xds/core/Text';

export default function CardWithInnerLayout() {
  return (
    <XDSCard width={380}>
      <XDSLayout
        header={
          <XDSLayoutHeader hasDivider>
            <XDSHeading level={3}>Edit Profile</XDSHeading>
          </XDSLayoutHeader>
        }
        content={
          <XDSLayoutContent>
            <XDSText type="body" color="secondary">
              Update your display name, bio, and profile photo. Changes are
              saved immediately.
            </XDSText>
          </XDSLayoutContent>
        }
        footer={
          <XDSLayoutFooter hasDivider>
            <XDSHStack gap={2} hAlign="end">
              <XDSButton label="Cancel" variant="ghost" />
              <XDSButton label="Save changes" variant="primary" />
            </XDSHStack>
          </XDSLayoutFooter>
        }
      />
    </XDSCard>
  );
}
