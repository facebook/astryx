'use client';

import * as stylex from '@stylexjs/stylex';
import {XDSVStack, XDSHStack} from '@xds/core/Layout';
import {XDSButton} from '@xds/core/Button';
import {XDSHeading} from '@xds/core/Text';
import {XDSDivider} from '@xds/core';

const styles = stylex.create({
  container: {
    maxWidth: 640,
  },
});

export default function ButtonsPage() {
  return (
    <div {...stylex.props(styles.container)}>
      <XDSVStack gap="space6">
        <XDSHeading level={1}>Buttons</XDSHeading>

        <XDSVStack gap="space3">
          <XDSHeading level={2}>Variants</XDSHeading>
          <XDSHStack gap="space3" align="center">
            <XDSButton variant="primary">Primary</XDSButton>
            <XDSButton variant="secondary">Secondary</XDSButton>
            <XDSButton variant="ghost">Ghost</XDSButton>
          </XDSHStack>
        </XDSVStack>

        <XDSDivider />

        <XDSVStack gap="space3">
          <XDSHeading level={2}>Sizes</XDSHeading>
          <XDSHStack gap="space3" align="center">
            <XDSButton size="small">Small</XDSButton>
            <XDSButton size="medium">Medium</XDSButton>
            <XDSButton size="large">Large</XDSButton>
          </XDSHStack>
        </XDSVStack>

        <XDSDivider />

        <XDSVStack gap="space3">
          <XDSHeading level={2}>States</XDSHeading>
          <XDSHStack gap="space3" align="center">
            <XDSButton variant="primary">Default</XDSButton>
            <XDSButton variant="primary" isDisabled>
              Disabled
            </XDSButton>
          </XDSHStack>
        </XDSVStack>
      </XDSVStack>
    </div>
  );
}
