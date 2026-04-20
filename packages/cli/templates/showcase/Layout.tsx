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

export default function LayoutShowcase() {
  return (
    <XDSCard width={400} height={300}>
      <XDSLayout
        header={
          <XDSLayoutHeader hasDivider>
            <div style={{fontWeight: 600, fontSize: 16}}>Card Title</div>
          </XDSLayoutHeader>
        }
        content={
          <XDSLayoutContent>
            <p style={{fontSize: 14, lineHeight: 1.5, margin: 0}}>
              A basic card layout with header, scrollable content area, and
              footer with action buttons.
            </p>
          </XDSLayoutContent>
        }
        footer={
          <XDSLayoutFooter hasDivider>
            <XDSHStack gap={2} hAlign="end">
              <XDSButton label="Cancel" variant="secondary">
                Cancel
              </XDSButton>
              <XDSButton label="Save" variant="primary">
                Save
              </XDSButton>
            </XDSHStack>
          </XDSLayoutFooter>
        }
      />
    </XDSCard>
  );
}
