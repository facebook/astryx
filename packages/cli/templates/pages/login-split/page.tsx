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
import {colorVars, spacingVars} from '@xds/core/theme/tokens.stylex';

// light-working-vertical-1 from xds_oss asset set
const COVER_IMAGE_URL =
  'https://lookaside.facebook.com/assets/xds_oss/light-working-vertical-1.png';
// AppleLogo from xds_oss asset set
const APPLE_LOGO_URL =
  'https://lookaside.facebook.com/assets/xds_oss/AppleLogo.png';
// GoogleLogo from xds_oss asset set
const GOOGLE_LOGO_URL =
  'https://lookaside.facebook.com/assets/xds_oss/GoogleLogo.png';

// XDSGrid emits minmax(MIN, 1fr) where MIN is a hard floor, so MIN plus the
// grid inset and page padding must fit the narrowest phone or the column is
// clipped. 320 − 2×24 (page) − 2×16 (stacked inset) = 240.
const COLUMN_MIN_WIDTH = 240;
// repeat:'fit' (auto-fit) collapses the two columns to one — expanding to fill —
// below 2×MIN + 32(gap) = 512px. The container query reorders the image and
// tightens the inset at that same point, keyed to the card width (not the
// window) so it never desyncs.
const STACK_QUERY = '@container login-split (max-width: 511px)';

const styles = stylex.create({
  // minHeight:100% fills the host so the centered card never leaves an unpainted
  // band; padding keeps it off the surface edges.
  page: {
    minHeight: '100%',
    backgroundColor: colorVars['--color-background-body'],
    padding: spacingVars['--spacing-6'],
  },
  cardWrap: {
    width: '100%',
    maxWidth: 1000,
    marginInline: 'auto',
  },
  // Pad the grid, not the XDSCard: the form's XDSSection escapes XDSCard's
  // --container-padding-* vars, which would cancel the inset on the form side.
  // containerType makes this the query container for STACK_QUERY.
  splitGrid: {
    containerType: 'inline-size',
    containerName: 'login-split',
    padding: {
      default: spacingVars['--spacing-8'],
      [STACK_QUERY]: spacingVars['--spacing-4'],
    },
  },
  imageCell: {
    // Fill the track: the image's XDSCard is content-width by default.
    width: '100%',
    // order:-1 moves the image above the form when stacked.
    order: {
      default: 0,
      [STACK_QUERY]: -1,
    },
  },
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
    <XDSCenter axis="both" xstyle={styles.page}>
      <XDSVStack gap={4} width="100%">
        <div {...stylex.props(styles.cardWrap)}>
          <XDSCard padding={0} width="100%">
            <XDSGrid
              columns={{minWidth: COLUMN_MIN_WIDTH, repeat: 'fit'}}
              gap={8}
              align="stretch"
              xstyle={styles.splitGrid}>
              {/* Form */}
              <XDSSection variant="transparent" padding={0} height="100%">
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
                        <XDSVStack gap={4} hAlign="stretch" width="100%">
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
                                        message:
                                          'Incorrect password. Try again.',
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

                          <XDSGrid columns={2} gap={3} justify="stretch">
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
                          </XDSGrid>
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

              {/* Cover image — the transparent XDSCard clips it to rounded
                  corners (overflow:clip + radius), so the image needs no radius. */}
              <div {...stylex.props(styles.imageCell)}>
                <XDSCard
                  variant="transparent"
                  padding={0}
                  width="100%"
                  height="100%">
                  <img
                    {...stylex.props(styles.coverImage)}
                    src={COVER_IMAGE_URL}
                    alt="Two people working at a desk"
                  />
                </XDSCard>
              </div>
            </XDSGrid>
          </XDSCard>
        </div>

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
