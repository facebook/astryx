'use client';

import {
  XDSLayout,
  XDSLayoutHeader,
  XDSLayoutContent,
  XDSHStack,
} from '@xds/core/Layout';
import {XDSHeading} from '@xds/core/Text';
import {XDSButton} from '@xds/core/Button';
import {XDSText} from '@xds/core/Text';

export default function LayoutHeaderShowcase() {
  return (
    <XDSLayout
      height="fill"
      header={
        <XDSLayoutHeader hasDivider>
          <XDSHStack gap={2} vAlign="center" hAlign="between">
            <XDSHeading level={4}>Dashboard</XDSHeading>
            <XDSHStack gap={2}>
              <XDSButton label="Export" variant="secondary">
                Export
              </XDSButton>
              <XDSButton label="New Item" variant="primary">
                New Item
              </XDSButton>
            </XDSHStack>
          </XDSHStack>
        </XDSLayoutHeader>
      }
      content={
        <XDSLayoutContent>
          <XDSText type="body" color="secondary">
            Page content below the header.
          </XDSText>
        </XDSLayoutContent>
      }
    />
  );
}
