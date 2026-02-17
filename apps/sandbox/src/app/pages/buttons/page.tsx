'use client';

import {XDSButton} from '@xds/core';
import {XDSVStack} from '@xds/core';
import {XDSHStack} from '@xds/core';
import {XDSText} from '@xds/core';
import {XDSHeading} from '@xds/core';
import {XDSDivider} from '@xds/core';

export default function ButtonsPage() {
  return (
    <XDSVStack gap="space4">
      <XDSHeading level={1}>Buttons</XDSHeading>
      <XDSText type="body" color="secondary">
        Button variants, sizes, and states.
      </XDSText>

      <XDSDivider />

      <XDSVStack gap="space2">
        <XDSHeading level={3}>Variants</XDSHeading>
        <XDSHStack gap="space2">
          <XDSButton variant="primary" label="Primary" />
          <XDSButton variant="secondary" label="Secondary" />
          <XDSButton variant="ghost" label="Ghost" />
          <XDSButton variant="destructive" label="Destructive" />
        </XDSHStack>
      </XDSVStack>

      <XDSDivider />

      <XDSVStack gap="space2">
        <XDSHeading level={3}>Sizes</XDSHeading>
        <XDSHStack gap="space2" align="center">
          <XDSButton variant="primary" size="sm" label="Small" />
          <XDSButton variant="primary" size="md" label="Medium" />
          <XDSButton variant="primary" size="lg" label="Large" />
        </XDSHStack>
      </XDSVStack>

      <XDSDivider />

      <XDSVStack gap="space2">
        <XDSHeading level={3}>States</XDSHeading>
        <XDSHStack gap="space2">
          <XDSButton variant="primary" label="Disabled" isDisabled />
          <XDSButton variant="primary" label="Loading" isLoading />
        </XDSHStack>
      </XDSVStack>
    </XDSVStack>
  );
}
