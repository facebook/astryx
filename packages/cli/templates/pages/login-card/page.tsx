// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {useState} from 'react';
import {CubeIcon} from '@heroicons/react/24/outline';
import {XDSVStack} from '@xds/core/Layout';
import {XDSCenter} from '@xds/core/Center';
import {XDSText, XDSHeading} from '@xds/core/Text';
import {XDSTextInput} from '@xds/core/TextInput';
import {XDSButton} from '@xds/core/Button';
import {XDSCard} from '@xds/core/Card';
import {XDSLink} from '@xds/core/Link';
import {XDSDivider} from '@xds/core/Divider';
import {XDSIcon} from '@xds/core/Icon';

// Brand logos from xds_oss asset set — no heroicons equivalent
// AppleLogo from xds_oss asset set
const APPLE_LOGO_URL =
  'https://lookaside.facebook.com/assets/xds_oss/AppleLogo.png';
// GoogleLogo from xds_oss asset set
const GOOGLE_LOGO_URL =
  'https://lookaside.facebook.com/assets/xds_oss/GoogleLogo.png';

export default function LoginSimple() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginFailed, setLoginFailed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = () => {
    if (!email || !password) {
      setLoginFailed(true);
      return;
    }
    setIsLoading(true);
    setLoginFailed(false);
    setTimeout(() => {
      setIsLoading(false);
      setLoginFailed(true);
    }, 2000);
  };

  return (
    <XDSCenter axis="both" height="100dvh">
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
          <XDSVStack gap={4} hAlign="stretch">
            {/* Header */}
            <XDSVStack gap={1} hAlign="center">
              <XDSHeading level={2}>Welcome back</XDSHeading>
              <XDSText type="body" color="secondary" size="sm">
                Sign in to your account
              </XDSText>
            </XDSVStack>

            {/* Form fields */}
            <XDSVStack gap={2}>
              <XDSTextInput
                label="Email"
                isLabelHidden
                type="email"
                placeholder="name@company.com"
                value={email}
                onChange={setEmail}
                size="lg"
              />
              <XDSVStack gap={1}>
                <XDSTextInput
                  label="Password"
                  isLabelHidden
                  placeholder="Enter your password"
                  type="password"
                  value={password}
                  onChange={(v: string) => {
                    setPassword(v);
                    setLoginFailed(false);
                  }}
                  size="lg"
                  status={
                    loginFailed
                      ? {
                          type: 'error',
                          message: 'Incorrect password. Try again.',
                        }
                      : undefined
                  }
                />
                {loginFailed && (
                  <XDSVStack hAlign="end">
                    <XDSLink
                      href="#"
                      size="sm"
                      color="secondary"
                      type="supporting">
                      Forgot password?
                    </XDSLink>
                  </XDSVStack>
                )}
              </XDSVStack>
            </XDSVStack>

            {/* Login button */}
            <XDSButton
              label="Login"
              variant="primary"
              size="lg"
              isLoading={isLoading}
              onClick={handleLogin}
            />

            {/* Divider */}
            <XDSDivider label="Or continue with" />

            {/* Social buttons */}
            <XDSVStack gap={3} hAlign="stretch">
              <XDSButton
                label="Login with Apple"
                variant="secondary"
                icon={
                  <img src={APPLE_LOGO_URL} alt="" width={16} height={16} />
                }
                size="lg"
              />
              <XDSButton
                label="Login with Google"
                variant="secondary"
                icon={
                  <img src={GOOGLE_LOGO_URL} alt="" width={16} height={16} />
                }
                size="lg"
              />
            </XDSVStack>

            {/* Sign up link */}
            <XDSVStack hAlign="center">
              <XDSText type="supporting" color="secondary">
                Don&apos;t have an account?{' '}
                <XDSLink href="#" type="supporting">
                  Sign up
                </XDSLink>
              </XDSText>
            </XDSVStack>
          </XDSVStack>
        </XDSCard>

        {/* Terms */}
        <XDSVStack hAlign="center" width={400}>
          <XDSText type="supporting" color="secondary" justify="center">
            By clicking continue, you agree to our{' '}
            <XDSLink href="#" type="supporting">
              Terms of Service
            </XDSLink>{' '}
            and{' '}
            <XDSLink href="#" type="supporting">
              Privacy Policy
            </XDSLink>
            .
          </XDSText>
        </XDSVStack>
      </XDSVStack>
    </XDSCenter>
  );
}
