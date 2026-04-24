'use client';

import {XDSLayout, XDSLayoutContent, XDSLayoutHeader} from '@xds/core/Layout';
import {XDSCard} from '@xds/core/Card';
import {XDSText, XDSHeading} from '@xds/core/Text';
import {XDSVStack} from '@xds/core/Layout';

export default function LayoutContentShowcase() {
  return (
    <XDSLayout
      height="fill"
      header={
        <XDSLayoutHeader hasDivider>
          <XDSCard variant="muted" padding={2}>
            <XDSText type="supporting" color="secondary">
              Header
            </XDSText>
          </XDSCard>
        </XDSLayoutHeader>
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
    />
  );
}
