'use client';

import {
  XDSLayout,
  XDSLayoutContent,
  XDSLayoutFooter,
  XDSHStack,
} from '@xds/core/Layout';
import {XDSCard} from '@xds/core/Card';
import {XDSButton} from '@xds/core/Button';
import {XDSText} from '@xds/core/Text';

export default function LayoutFooterShowcase() {
  return (
    <XDSLayout
      height="fill"
      content={
        <XDSLayoutContent>
          <XDSCard variant="muted" padding={3}>
            <XDSText type="supporting" color="secondary">
              Content area
            </XDSText>
          </XDSCard>
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
