'use client';

import {useState} from 'react';
import * as stylex from '@stylexjs/stylex';
import {XDSVStack} from '@xds/core/Layout';
import {XDSCenter} from '@xds/core/Center';
import {XDSText, XDSHeading} from '@xds/core/Text';
import {XDSTextInput} from '@xds/core/TextInput';
import {XDSButton} from '@xds/core/Button';
import {XDSCard} from '@xds/core/Card';
import {XDSIcon} from '@xds/core/Icon';
import {CubeIcon} from '@heroicons/react/24/outline';
import {colorVars, spacingVars} from '@xds/core/theme/tokens.stylex';

const styles = stylex.create({
  page: {
    minHeight: '100dvh',
    padding: spacingVars['--spacing-6'],
    backgroundColor: colorVars['--color-background-body'],
  },
  fullWidth: {
    width: '100%',
  },
  centered: {textAlign: 'center'},
});

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  return (
    <XDSCenter axis="both" xstyle={styles.page}>
      <XDSVStack gap={4} hAlign="center">
        {/* Logo */}
        <XDSVStack gap={2} hAlign="center">
          <XDSIcon icon={CubeIcon} size="lg" />
          <XDSText type="body" weight="bold" size="lg">
            Product Inc.
          </XDSText>
        </XDSVStack>

        {/* Card */}
        <XDSCard padding={8} width={400}>
          <XDSVStack gap={4}>
            <XDSVStack hAlign="center" xstyle={styles.centered}>
              <XDSVStack gap={1}>
                <XDSHeading level={2}>Sign in</XDSHeading>
                <XDSText type="body" color="secondary" size="sm">
                  Enter your credentials to continue
                </XDSText>
              </XDSVStack>
            </XDSVStack>

            <XDSTextInput
              label="Email"
              value={email}
              onChange={setEmail}
              placeholder="you@example.com"
              type="email"
              size="lg"
            />

            <XDSTextInput
              label="Password"
              value={password}
              onChange={setPassword}
              placeholder="Enter your password"
              type="password"
              size="lg"
            />

            <XDSButton
              label="Sign in"
              variant="primary"
              size="lg"
              xstyle={styles.fullWidth}
            />
          </XDSVStack>
        </XDSCard>
      </XDSVStack>
    </XDSCenter>
  );
}
