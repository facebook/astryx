'use client';

import {XDSSection} from '@xds/core/Section';
import {XDSStack} from '@xds/core/Layout';
import {XDSText} from '@xds/core/Text';
import * as stylex from '@stylexjs/stylex';
import {colorVars} from '@xds/core/theme/tokens.stylex';

const styles = stylex.create({
  transparentWrapper: {
    backgroundColor: colorVars['--color-background-blue'],
  },
});

export default function SectionVariants() {
  return (
    <XDSStack direction="vertical" gap={0}>
      <XDSSection variant="section" padding={5}>
        <XDSStack direction="vertical" gap={1}>
          <XDSText type="body" weight="bold">
            Section
          </XDSText>
          <XDSText type="supporting" color="secondary">
            White background.
          </XDSText>
        </XDSStack>
      </XDSSection>
      <XDSSection variant="wash" padding={5}>
        <XDSStack direction="vertical" gap={1}>
          <XDSText type="body" weight="bold">
            Wash
          </XDSText>
          <XDSText type="supporting" color="secondary">
            Gray background.
          </XDSText>
        </XDSStack>
      </XDSSection>
      <XDSStack direction="vertical" xstyle={styles.transparentWrapper}>
        <XDSSection variant="transparent" padding={5}>
          <XDSStack direction="vertical" gap={1}>
            <XDSText type="body" weight="bold">
              Transparent
            </XDSText>
            <XDSText type="supporting" color="secondary">
              No background, shows the color behind it.
            </XDSText>
          </XDSStack>
        </XDSSection>
      </XDSStack>
    </XDSStack>
  );
}
