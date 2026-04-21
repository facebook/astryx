'use client';

import * as stylex from '@stylexjs/stylex';
import {XDSCollapsible} from '@xds/core/Collapsible';
import {XDSText} from '@xds/core/Text';
import {XDSVStack} from '@xds/core/Layout';

const styles = stylex.create({
  fullWidth: {width: '100%'},
});

export default function CollapsibleWithoutCard() {
  return (
    <XDSVStack gap={2} xstyle={styles.fullWidth}>
      <XDSCollapsible trigger="Deployment Details">
        <XDSText type="body">
          Last deployed on April 18, 2026 at 3:42 PM by Sarah Chen. Build
          duration was 2m 14s with zero warnings.
        </XDSText>
      </XDSCollapsible>
      <XDSCollapsible trigger="Environment Variables" defaultIsOpen={false}>
        <XDSText type="body">
          12 variables configured. Last updated March 30, 2026. All secrets are
          encrypted at rest with AES-256.
        </XDSText>
      </XDSCollapsible>
      <XDSCollapsible trigger="Build Logs" defaultIsOpen={false}>
        <XDSText type="body">
          Build completed successfully. 847 modules compiled, 0 errors, 0
          warnings. Bundle size: 142 KB gzipped.
        </XDSText>
      </XDSCollapsible>
    </XDSVStack>
  );
}
