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

export default function LayoutBasicCardLayout() {
  return (
    <XDSCard width={400} height={350}>
      <XDSLayout
        header={
          <XDSLayoutHeader hasDivider>
            <div style={{fontWeight: 600, fontSize: 18}}>Card Title</div>
          </XDSLayoutHeader>
        }
        content={
          <XDSLayoutContent>
            <p style={{fontSize: 14, lineHeight: 1.5, margin: 0}}>
              This is a basic card layout with a header, scrollable content
              area, and footer. The layout automatically handles padding and
              spacing between sections.
            </p>
            <br />
            <p style={{fontSize: 14, lineHeight: 1.5, margin: 0}}>
              Try scrolling this content area when it overflows.
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
