'use client';

import * as stylex from '@stylexjs/stylex';
import {XDSDivider} from '@xds/core/Divider';
import {XDSCard} from '@xds/core/Card';
import {XDSVStack} from '@xds/core/Layout';
import {XDSText} from '@xds/core/Text';
import {colorVars, spacingVars} from '@xds/core/theme';

const styles = stylex.create({
  container: {
    backgroundColor: colorVars['--color-background-body'],
    padding: spacingVars['--spacing-5'],
    minHeight: '100%',
  },
});

export default function DividerVariants() {
  return (
    <div {...stylex.props(styles.container)}>
      <XDSCard>
        <XDSVStack gap={3}>
          <XDSVStack gap={1}>
            <XDSText type="label">Sign in with email</XDSText>
            <XDSText type="body">
              Enter your email and password to access your account.
            </XDSText>
          </XDSVStack>
          <XDSDivider label="or" />
          <XDSVStack gap={1}>
            <XDSText type="label">Sign in with SSO</XDSText>
            <XDSText type="body">
              Use your company credentials to sign in automatically.
            </XDSText>
          </XDSVStack>
          <XDSDivider variant="strong" label="Strong" />
          <XDSText type="supporting" color="secondary">
            By signing in, you agree to our Terms of Service and Privacy Policy.
          </XDSText>
        </XDSVStack>
      </XDSCard>
    </div>
  );
}
