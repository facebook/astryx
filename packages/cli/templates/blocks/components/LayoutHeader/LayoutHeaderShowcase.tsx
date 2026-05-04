'use client';

import {
  XDSLayout,
  XDSLayoutHeader,
  XDSLayoutContent,
  XDSLayoutFooter,
  XDSLayoutPanel,
  XDSCard,
  XDSHStack,
} from '@xds/core/Layout';
import {XDSCenter} from '@xds/core/Center';
import {XDSHeading} from '@xds/core/Text';
import {XDSButton} from '@xds/core/Button';

export default function LayoutHeaderShowcase() {
  return (
    <XDSCenter width={400}>
      <XDSLayout
        style={{width: '100%'}}
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
        start={
          <XDSLayoutPanel hasDivider width={140}>
            <XDSCard variant="muted" />
          </XDSLayoutPanel>
        }
        content={
          <XDSLayoutContent>
            <XDSCard variant="muted" />
          </XDSLayoutContent>
        }
        footer={
          <XDSLayoutFooter hasDivider>
            <XDSCard variant="muted" />
          </XDSLayoutFooter>
        }
      />
    </XDSCenter>
  );
}
