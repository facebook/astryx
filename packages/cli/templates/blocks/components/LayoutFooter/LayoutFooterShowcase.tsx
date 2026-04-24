'use client';

import {
  XDSLayout,
  XDSLayoutContent,
  XDSLayoutFooter,
  XDSHStack,
} from '@xds/core/Layout';
import {XDSButton} from '@xds/core/Button';
import {XDSText} from '@xds/core/Text';

export default function LayoutFooterShowcase() {
  return (
    <XDSLayout
      height="fill"
      content={
        <XDSLayoutContent>
          <XDSText type="body" color="secondary">
            Form content goes here. The footer stays pinned at the bottom.
          </XDSText>
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
  );
}
