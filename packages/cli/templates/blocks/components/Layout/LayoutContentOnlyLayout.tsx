'use client';

import {XDSLayout, XDSLayoutContent, XDSVStack} from '@xds/core/Layout';
import {XDSCard} from '@xds/core/Card';
import {XDSHeading, XDSText} from '@xds/core/Text';

export default function LayoutContentOnlyLayout() {
  return (
    <XDSCard>
      <XDSLayout
        content={
          <XDSLayoutContent>
            <XDSVStack gap={3}>
              <XDSHeading level={4}>Simple Content</XDSHeading>
              <XDSText type="body">
                A layout can have just content without header or footer. This
                is useful for simple cards or content blocks that don&apos;t need
                structured sections.
              </XDSText>
            </XDSVStack>
          </XDSLayoutContent>
        }
      />
    </XDSCard>
  );
}
