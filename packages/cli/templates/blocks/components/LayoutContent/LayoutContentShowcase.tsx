'use client';

import {XDSLayout, XDSLayoutContent, XDSLayoutHeader} from '@xds/core/Layout';
import {XDSText, XDSHeading} from '@xds/core/Text';
import {XDSVStack} from '@xds/core/Layout';

export default function LayoutContentShowcase() {
  return (
    <XDSLayout
      height="fill"
      header={<XDSLayoutHeader hasDivider>Page Title</XDSLayoutHeader>}
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
