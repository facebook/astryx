'use client';

import {
  XDSLayout,
  XDSLayoutContent,
  XDSLayoutHeader,
  XDSLayoutFooter,
  XDSLayoutPanel,
  XDSCard,
  XDSVStack,
} from '@xds/core/Layout';
import {XDSCenter} from '@xds/core/Center';
import {XDSText, XDSHeading} from '@xds/core/Text';

export default function LayoutContentShowcase() {
  return (
    <XDSCenter width={500}>
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
          <XDSLayoutContent role="main">
            <XDSVStack gap={3}>
              <XDSHeading level={5}>Main Content Area</XDSHeading>
              <XDSText type="body" color="secondary">
                LayoutContent provides automatic padding and scroll containment.
                It fills the remaining space between the header and footer.
              </XDSText>
              <XDSText type="body" color="secondary">
                Content that overflows will scroll within this area while the
                header and footer remain fixed.
              </XDSText>
            </XDSVStack>
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
