'use client';

import {XDSDivider} from '@xds/core/Divider';
import {XDSCard} from '@xds/core/Card';
import {XDSSection} from '@xds/core/Section';
import {XDSVStack} from '@xds/core/Layout';
import {XDSText} from '@xds/core/Text';

export default function DividerWithLabel() {
  return (
    <XDSSection variant="wash">
      <XDSCard>
        <XDSVStack gap={3}>
          <XDSText type="body">Content above</XDSText>
          <XDSDivider label="or" />
          <XDSText type="body">Content below</XDSText>
        </XDSVStack>
      </XDSCard>
    </XDSSection>
  );
}
