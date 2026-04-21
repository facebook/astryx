'use client';

import {XDSDivider} from '@xds/core/Divider';
import {XDSCard} from '@xds/core/Card';
import {XDSSection} from '@xds/core/Section';
import {XDSVStack} from '@xds/core/Layout';
import {XDSText} from '@xds/core/Text';

export default function DividerInCard() {
  return (
    <XDSSection variant="wash">
      <XDSCard>
        <XDSVStack gap={3}>
          <XDSText type="label">Card Title</XDSText>
          <XDSDivider />
          <XDSText type="body">
            This demonstrates how a divider can be used to separate content
            sections within a card or panel.
          </XDSText>
          <XDSDivider label="More Info" />
          <XDSText type="supporting">
            Additional details can appear below a labeled divider.
          </XDSText>
        </XDSVStack>
      </XDSCard>
    </XDSSection>
  );
}
