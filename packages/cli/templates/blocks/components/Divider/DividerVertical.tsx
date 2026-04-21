'use client';

import {XDSDivider} from '@xds/core/Divider';
import {XDSCard} from '@xds/core/Card';
import {XDSSection} from '@xds/core/Section';
import {XDSHStack} from '@xds/core/Layout';
import {XDSText} from '@xds/core/Text';

export default function DividerVertical() {
  return (
    <XDSSection variant="wash">
      <XDSCard height={200}>
        <XDSHStack gap={4} style={{height: '100%'}}>
          <XDSText type="body">Left content</XDSText>
          <XDSDivider orientation="vertical" />
          <XDSText type="body">Right content</XDSText>
        </XDSHStack>
      </XDSCard>
    </XDSSection>
  );
}
