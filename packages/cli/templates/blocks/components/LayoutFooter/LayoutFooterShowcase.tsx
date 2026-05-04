'use client';

import {
  XDSLayout,
  XDSLayoutContent,
  XDSLayoutHeader,
  XDSLayoutFooter,
  XDSLayoutPanel,
  XDSCard,
  XDSHStack,
} from '@xds/core/Layout';
import {XDSCenter} from '@xds/core/Center';
import {XDSButton} from '@xds/core/Button';

export default function LayoutFooterShowcase() {
  return (
    <XDSCenter width={400}>
      <XDSLayout
        style={{width: '100%'}}
        height="fill"
        header={
          <XDSLayoutHeader hasDivider>
            <XDSCard variant="muted" />
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
    </XDSCenter>
  );
}
