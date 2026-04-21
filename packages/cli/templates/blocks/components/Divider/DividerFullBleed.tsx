'use client';

import {XDSDivider} from '@xds/core/Divider';
import {XDSCard} from '@xds/core/Card';
import {XDSSection} from '@xds/core/Section';
import {XDSVStack} from '@xds/core/Layout';
import {XDSText} from '@xds/core/Text';

export default function DividerFullBleed() {
  return (
    <XDSSection variant="wash">
      <XDSCard>
        <XDSVStack gap={3}>
          <XDSText type="label">Full bleed divider</XDSText>
          <XDSText type="body">
            The divider extends to container edges, ignoring padding.
          </XDSText>
          <XDSDivider isFullBleed />
          <XDSText type="body">Content below the divider.</XDSText>
        </XDSVStack>
      </XDSCard>
    </XDSSection>
  );
}
