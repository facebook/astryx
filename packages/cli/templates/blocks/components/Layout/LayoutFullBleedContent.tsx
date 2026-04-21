'use client';

import {
  XDSLayout,
  XDSLayoutHeader,
  XDSLayoutContent,
  XDSLayoutFooter,
  XDSHStack,
} from '@xds/core/Layout';
import {XDSCard} from '@xds/core/Card';
import {XDSButton} from '@xds/core/Button';

export default function LayoutFullBleedContent() {
  return (
    <XDSCard width={400} height={350}>
      <XDSLayout
        header={
          <XDSLayoutHeader hasDivider>
            <div style={{fontWeight: 600, fontSize: 18}}>Full Bleed Example</div>
          </XDSLayoutHeader>
        }
        content={
          <XDSLayoutContent padding={0}>
            <div
              style={{
                padding: 16,
                fontSize: 14,
                lineHeight: 1.5,
                minHeight: 100,
                backgroundColor: 'rgba(0,0,0,0.04)',
              }}>
              This content uses padding=0 to remove padding, allowing it to
              touch the edges. Useful for tables, images, or other
              edge-to-edge content.
            </div>
          </XDSLayoutContent>
        }
        footer={
          <XDSLayoutFooter hasDivider>
            <XDSHStack gap={2} hAlign="end">
              <XDSButton label="Close" variant="secondary">
                Close
              </XDSButton>
            </XDSHStack>
          </XDSLayoutFooter>
        }
      />
    </XDSCard>
  );
}
