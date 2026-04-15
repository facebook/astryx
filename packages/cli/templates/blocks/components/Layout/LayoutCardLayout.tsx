'use client';

import {
  XDSLayout,
  XDSLayoutHeader,
  XDSLayoutContent,
  XDSLayoutFooter,
  XDSCard,
  XDSHStack,
} from '@xds/core/Layout';
import {XDSButton} from '@xds/core/Button';

export default function LayoutCardLayout() {
  return (
    <XDSCard>
      <XDSLayout
        header={<XDSLayoutHeader hasDivider>Title</XDSLayoutHeader>}
        content={<XDSLayoutContent>Body content</XDSLayoutContent>}
        footer={
          <XDSLayoutFooter hasDivider>
            <XDSHStack gap={2} hAlign="end">
              <XDSButton variant="secondary" label="Cancel">
                Cancel
              </XDSButton>
              <XDSButton variant="primary" label="Save">
                Save
              </XDSButton>
            </XDSHStack>
          </XDSLayoutFooter>
        }
      />
    </XDSCard>
  );
}
