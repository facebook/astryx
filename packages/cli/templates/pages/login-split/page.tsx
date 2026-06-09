// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {useState} from 'react';
import * as stylex from '@stylexjs/stylex';
import {XDSVStack, XDSHStack, XDSStackItem} from '@xds/core/Layout';
import {XDSGrid} from '@xds/core/Grid';
import {XDSCenter} from '@xds/core/Center';
import {XDSCard} from '@xds/core/Card';
import {XDSSection} from '@xds/core/Section';
import {XDSText} from '@xds/core/Text';
import {XDSIcon} from '@xds/core/Icon';
import {XDSEmptyState} from '@xds/core/EmptyState';
import {SquaresPlusIcon, CheckCircleIcon} from '@heroicons/react/24/outline';
import {XDSTextInput} from '@xds/core/TextInput';
import {XDSButton} from '@xds/core/Button';
import {XDSLink} from '@xds/core/Link';
import {XDSDivider} from '@xds/core/Divider';

// light-working-vertical-1 from xds_oss asset set
const COVER_IMAGE_URL =
  'https://lookaside.facebook.com/assets/xds_oss/light-working-vertical-1.png';
// AppleLogo from xds_oss asset set
const APPLE_LOGO_URL =
  'https://lookaside.facebook.com/assets/xds_oss/AppleLogo.png';
// GoogleLogo from xds_oss asset set
const GOOGLE_LOGO_URL =
  'https://lookaside.facebook.com/assets/xds_oss/GoogleLogo.png';

const styles = stylex.create({
  // The card's overflow:clip + border-radius rounds the outer corners,
  // so the image only needs cover-fit sizing (no own border-radius).
  coverImage: {
    width: '100%',
    height: '100%',
    objectFit: 'cover' as const,
  },
});

export default function LoginTwoColumn() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginFailed, setLoginFailed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleLogin = () => {
    if (!email || !password) {
      setLoginFailed(true);
      return;
    }
    setIsLoading(true);
    setLoginFailed(false);
    setTimeout(() => {
      setIsLoading(false);
      setIsSuccess(true);
    }, 2000);
  };

  return (
    <XDSCenter axis="both" height="100dvh">
      <XDSVStack gap={4} hAlign="center">
        {/* Card */}
        <XDSCard padding={0} maxWidth={1000} width="100%">
          <XDSGrid columns={{minWidth: 360}} align="stretch">
            {/* Left — Form */}
            <XDSSection variant="transparent" padding={8} height="100%">
              <XDSVStack gap={4} height="100%">
                <XDSHStack gap={2} vAlign="center">
                  <XDSIcon icon={SquaresPlusIcon} />
                  <XDSText type="body" weight="bold">
                    Product Inc.
                  </XDSText>
                </XDSHStack>

                <XDSStackItem size="fill">
                  <XDSCenter axis="vertical" height="100%">
                    {isSuccess ? (
                      <XDSEmptyState
                        title="You're signed in"
                        description="Redirecting to your dashboard…"
                        icon={<XDSIcon icon={CheckCircleIcon} size="lg" />}
                      />
                    ) : (
                      <XDSVStack gap={4} hAlign="stretch">
                        <XDSVStack gap={1}>
                          <XDSText type="display-1" as="h2">
                            Welcome back
                          </XDSText>
                          <XDSText type="body" color="secondary" size="sm">
                            Login to your Product Inc. account
                          </XDSText>
                        </XDSVStack>

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
                                  Forgot your password?
                                </XDSLink>
                              </XDSVStack>
                            )}
                          </XDSVStack>
                        </XDSVStack>

                        <XDSButton
                          label="Login"
                          variant="primary"
                          size="lg"
                          isLoading={isLoading}
                          onClick={handleLogin}
                        />

                        <XDSDivider label="Or continue with" />

                        <XDSHStack gap={3}>
                          <XDSStackItem size="fill">
                            <XDSButton
                              label="Apple"
                              variant="secondary"
                              icon={
                                <img
                                  src={APPLE_LOGO_URL}
                                  alt=""
                                  width={16}
                                  height={16}
                                />
                              }
                              size="lg"
                            />
                          </XDSStackItem>
                          <XDSStackItem size="fill">
                            <XDSButton
                              label="Google"
                              variant="secondary"
                              icon={
                                <img
                                  src={GOOGLE_LOGO_URL}
                                  alt=""
                                  width={16}
                                  height={16}
                                />
                              }
                              size="lg"
                            />
                          </XDSStackItem>
                        </XDSHStack>
                      </XDSVStack>
                    )}
                  </XDSCenter>
                </XDSStackItem>

                {!isSuccess && (
                  <XDSText type="supporting" color="secondary">
                    Don&apos;t have an account?{' '}
                    <XDSLink href="#" type="supporting">
                      Sign up
                    </XDSLink>
                  </XDSText>
                )}
              </XDSVStack>
            </XDSSection>

            {/* Right — Cover image (card clips the outer corners) */}
            <img
              {...stylex.props(styles.coverImage)}
              src={COVER_IMAGE_URL}
              alt="Two people working at a desk"
            />
          </XDSGrid>
        </XDSCard>

        {/* Terms */}
        <XDSVStack hAlign="center">
          <XDSText type="supporting" color="secondary">
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
