'use client';

import * as stylex from '@stylexjs/stylex';
import {XDSDivider} from '@xds/core/Divider';
import {XDSCard} from '@xds/core/Card';
import {XDSHStack, XDSVStack} from '@xds/core/Layout';
import {XDSText} from '@xds/core/Text';
import {colorVars, spacingVars} from '@xds/core/theme';

const styles = stylex.create({
  container: {
    backgroundColor: colorVars['--color-background-body'],
    padding: spacingVars['--spacing-5'],
    minHeight: '100%',
  },
  divider: {alignSelf: 'stretch'},
});

export default function DividerVertical() {
  return (
    <div {...stylex.props(styles.container)}>
      <XDSCard>
        <XDSHStack gap={4}>
          <XDSVStack gap={1}>
            <XDSText type="label">Revenue</XDSText>
            <XDSText type="bodyBold">$24,500</XDSText>
            <XDSText type="supporting" color="secondary">
              +12% vs last month
            </XDSText>
          </XDSVStack>
          <XDSDivider orientation="vertical" xstyle={styles.divider} />
          <XDSVStack gap={1}>
            <XDSText type="label">Users</XDSText>
            <XDSText type="bodyBold">1,240</XDSText>
            <XDSText type="supporting" color="secondary">
              +8% vs last month
            </XDSText>
          </XDSVStack>
          <XDSDivider orientation="vertical" xstyle={styles.divider} />
          <XDSVStack gap={1}>
            <XDSText type="label">Conversion</XDSText>
            <XDSText type="bodyBold">3.2%</XDSText>
            <XDSText type="supporting" color="secondary">
              -0.5% vs last month
            </XDSText>
          </XDSVStack>
        </XDSHStack>
      </XDSCard>
    </div>
  );
}
