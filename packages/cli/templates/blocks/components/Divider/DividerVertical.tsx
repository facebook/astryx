// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import * as stylex from '@stylexjs/stylex';
import {XDSDivider} from '@xds/core/Divider';
import {XDSCard} from '@xds/core/Card';
import {XDSSection} from '@xds/core/Section';
import {XDSHStack, XDSVStack, XDSStackItem} from '@xds/core/Layout';
import {XDSText} from '@xds/core/Text';

const styles = stylex.create({
  dividerFill: {
    alignSelf: 'stretch',
    height: 'auto',
  },
});

export default function DividerVertical() {
  return (
    <XDSSection width="100%">
      <XDSCard>
        <XDSHStack gap={4} align="stretch">
          <XDSStackItem size="fill">
            <XDSVStack gap={1}>
              <XDSText type="label">Revenue</XDSText>
              <XDSText type="label">$24,500</XDSText>
              <XDSText type="supporting" color="secondary">
                +12% vs last month
              </XDSText>
            </XDSVStack>
          </XDSStackItem>
          <XDSDivider orientation="vertical" xstyle={styles.dividerFill} />
          <XDSStackItem size="fill">
            <XDSVStack gap={1}>
              <XDSText type="label">Users</XDSText>
              <XDSText type="label">1,240</XDSText>
              <XDSText type="supporting" color="secondary">
                +8% vs last month
              </XDSText>
            </XDSVStack>
          </XDSStackItem>
          <XDSDivider orientation="vertical" xstyle={styles.dividerFill} />
          <XDSStackItem size="fill">
            <XDSVStack gap={1}>
              <XDSText type="label">Conversion</XDSText>
              <XDSText type="label">3.2%</XDSText>
              <XDSText type="supporting" color="secondary">
                -0.5% vs last month
              </XDSText>
            </XDSVStack>
          </XDSStackItem>
        </XDSHStack>
      </XDSCard>
    </XDSSection>
  );
}
