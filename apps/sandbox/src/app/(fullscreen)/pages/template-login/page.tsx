'use client';

import {useState} from 'react';
import * as stylex from '@stylexjs/stylex';
import {XDSVStack} from '@xds/core/Layout';
import {XDSText, XDSHeading} from '@xds/core/Text';
import {XDSTextInput} from '@xds/core/TextInput';
import {XDSButton} from '@xds/core/Button';
import {XDSCard} from '@xds/core/Card';
import {XDSLink} from '@xds/core/Link';

const styles = stylex.create({
  page: {
    display: 'flex',
    minHeight: '100svh',
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  wrapper: {
    width: '100%',
    maxWidth: 384,
  },
  passwordRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  signupText: {
    textAlign: 'center',
  },
});

export default function LoginTemplate() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  return (
    <div {...stylex.props(styles.page)}>
      <div {...stylex.props(styles.wrapper)}>
        <XDSVStack gap={6}>
          <XDSCard>
            <XDSVStack gap={6}>
              <XDSVStack gap={2}>
                <XDSHeading level={2}>Login</XDSHeading>
                <XDSText type="body" color="secondary">
                  Enter your email below to login to your account
                </XDSText>
              </XDSVStack>
              <XDSVStack gap={6}>
                <XDSTextInput
                  label="Email"
                  type="email"
                  placeholder="m@example.com"
                  value={email}
                  onChange={setEmail}
                />
                <XDSVStack gap={2}>
                  <div {...stylex.props(styles.passwordRow)}>
                    <XDSText type="label">Password</XDSText>
                    <XDSLink label="Forgot your password?" href="#">
                      Forgot your password?
                    </XDSLink>
                  </div>
                  <XDSTextInput
                    label="Password"
                    isLabelHidden
                    type="password"
                    value={password}
                    onChange={setPassword}
                  />
                </XDSVStack>
                <XDSButton label="Login" variant="primary" />
                <XDSButton label="Login with Google" variant="secondary" />
              </XDSVStack>
              <div {...stylex.props(styles.signupText)}>
                <XDSText type="supporting" color="secondary">
                  Don&apos;t have an account?{' '}
                  <XDSLink label="Sign up" href="#">
                    Sign up
                  </XDSLink>
                </XDSText>
              </div>
            </XDSVStack>
          </XDSCard>
        </XDSVStack>
      </div>
    </div>
  );
}
