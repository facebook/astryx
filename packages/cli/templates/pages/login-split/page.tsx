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

// Per-column minimum width. Kept small (240) on purpose: XDSGrid emits
// minmax(MIN, 1fr), and that MIN is a HARD floor that does NOT shrink below
// itself even when the container is narrower — so MIN + the grid's inset on
// each side AND the page padding must fit a phone, or the single column
// overflows the card and the content is clipped. Budget on a 320px phone:
// 320 − 2×24 (page padding) − 2×16 (stacked grid inset) = 240, so 240 is the
// largest MIN that still fits the smallest common phones (down to 320px).
const COLUMN_MIN_WIDTH = 240;
// The grid is capped at 2 columns (columns.max=2) and reflows to one when its
// container is narrower than 2×MIN + 32(gap) = 512px. A container query (not a
// viewport media query) reorders the image AND tightens the inset to match
// that exact point — keyed to the card width, not the window — so it never
// desyncs (e.g. a narrow card in a wide viewport).
const STACK_QUERY = '@container login-split (max-width: 511px)';

const styles = stylex.create({
  // Page surface for the <XDSCenter axis="both"> root (matches the other login
  // templates). minHeight:100% fills the host — the docsite's bounded preview
  // frame or the app viewport — so the centered card never leaves an unpainted
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
  // Applied to the XDSGrid so the grid (not an extra wrapper div) owns the
  // frame: padding is the 32px inset, gap={8} is the single inter-cell gutter.
  // Pad the grid, not the XDSCard, because XDSCard's padding sets the
  // --container-padding-* vars that the form's XDSSection escapes (negative
  // margins) — which would cancel the inset on the form side only. containerType
  // makes the grid the query container STACK_QUERY measures against.
  splitGrid: {
    containerType: 'inline-size',
    containerName: 'login-split',
    // 32px frame on wide layouts; 16px once stacked so the column's hard min
    // width (see COLUMN_MIN_WIDTH) plus the inset still fits a phone.
    padding: {
      default: spacingVars['--spacing-8'],
      [STACK_QUERY]: spacingVars['--spacing-4'],
    },
  },
  imageCell: {
    // order:-1 moves the image above the form when the grid stacks.
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
        {/* Card — wrapper caps width + centers; grid reflows to one column
            when its container is narrower than ~512px (see STACK_QUERY). */}
        <div {...stylex.props(styles.cardWrap)}>
          <XDSCard padding={0} width="100%">
            <XDSGrid
              columns={{minWidth: COLUMN_MIN_WIDTH, max: 2}}
              gap={8}
              align="stretch"
              xstyle={styles.splitGrid}>
              {/* Left — Form */}
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

              {/* Right (wide) / Top (stacked) — Cover image.
                  A borderless XDSCard clips the image to rounded corners
                  (overflow:clip + radius) so the image needs no own radius. */}
              <div {...stylex.props(styles.imageCell)}>
                <XDSCard variant="transparent" padding={0} height="100%">
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
