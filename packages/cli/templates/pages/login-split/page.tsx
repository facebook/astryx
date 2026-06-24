// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {useState} from 'react';
import * as stylex from '@stylexjs/stylex';
import {VStack, HStack, StackItem} from '@astryxdesign/core/Layout';
import {Grid} from '@astryxdesign/core/Grid';
import {Center} from '@astryxdesign/core/Center';
import {Card} from '@astryxdesign/core/Card';
import {Section} from '@astryxdesign/core/Section';
import {Text} from '@astryxdesign/core/Text';
import {Icon} from '@astryxdesign/core/Icon';
import {EmptyState} from '@astryxdesign/core/EmptyState';
import {SquaresPlusIcon, CheckCircleIcon} from '@heroicons/react/24/outline';
import {TextInput} from '@astryxdesign/core/TextInput';
import {Button} from '@astryxdesign/core/Button';
import {Link} from '@astryxdesign/core/Link';
import {Divider} from '@astryxdesign/core/Divider';
import {colorVars, spacingVars} from '@astryxdesign/core/theme/tokens.stylex';

const COVER_IMAGE_URL =
  'https://lookaside.facebook.com/assets/astryx/light-working-vertical-1.png';
const APPLE_LOGO_URL =
  'https://lookaside.facebook.com/assets/astryx/AppleLogo.png';
const GOOGLE_LOGO_URL =
  'https://lookaside.facebook.com/assets/astryx/GoogleLogo.png';

// Grid emits minmax(MIN, 1fr) where MIN is a hard floor, so MIN plus the
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
  // Pad the grid, not the Card: the form's Section escapes Card's
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
    // Fill the track: the image's Card is content-width by default.
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
    <Center axis="both" xstyle={styles.page}>
      <VStack gap={4} width="100%">
        <div {...stylex.props(styles.cardWrap)}>
          <Card padding={0} width="100%">
            <Grid
              columns={{minWidth: COLUMN_MIN_WIDTH, repeat: 'fit'}}
              gap={8}
              align="stretch"
              xstyle={styles.splitGrid}>
              {/* Form */}
              <Section variant="transparent" padding={0} height="100%">
                <VStack gap={4} height="100%">
                  <HStack gap={2} vAlign="center">
                    <Icon icon={SquaresPlusIcon} />
                    <Text type="body" weight="bold">
                      Product Inc.
                    </Text>
                  </HStack>

                  <StackItem size="fill">
                    <Center axis="vertical" height="100%">
                      {isSuccess ? (
                        <EmptyState
                          title="You're signed in"
                          description="Redirecting to your dashboard…"
                          icon={<Icon icon={CheckCircleIcon} size="lg" />}
                        />
                      ) : (
                        <VStack gap={4} hAlign="stretch" width="100%">
                          <VStack gap={1}>
                            <Text type="display-1" as="h2">
                              Welcome back
                            </Text>
                            <Text type="body" color="secondary" size="sm">
                              Login to your Product Inc. account
                            </Text>
                          </VStack>

                          <VStack gap={2}>
                            <TextInput
                              label="Email"
                              isLabelHidden
                              type="email"
                              placeholder="name@company.com"
                              value={email}
                              onChange={setEmail}
                              size="lg"
                            />
                            <VStack gap={1}>
                              <TextInput
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
                                <VStack hAlign="end">
                                  <Link
                                    href="#"
                                    size="sm"
                                    color="secondary"
                                    type="supporting">
                                    Forgot your password?
                                  </Link>
                                </VStack>
                              )}
                            </VStack>
                          </VStack>

                          <Button
                            label="Login"
                            variant="primary"
                            size="lg"
                            isLoading={isLoading}
                            onClick={handleLogin}
                          />

                          <Divider label="Or continue with" />

                          <Grid columns={2} gap={3} justify="stretch">
                            <Button
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
                            <Button
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
                          </Grid>
                        </VStack>
                      )}
                    </Center>
                  </StackItem>

                  {!isSuccess && (
                    <Text type="supporting" color="secondary">
                      Don&apos;t have an account?{' '}
                      <Link href="#" type="supporting">
                        Sign up
                      </Link>
                    </Text>
                  )}
                </VStack>
              </Section>

              {/* Cover image — the transparent Card clips it to rounded
                  corners (overflow:clip + radius), so the image needs no radius. */}
              <div {...stylex.props(styles.imageCell)}>
                <Card
                  variant="transparent"
                  padding={0}
                  width="100%"
                  height="100%">
                  <img
                    {...stylex.props(styles.coverImage)}
                    src={COVER_IMAGE_URL}
                    alt="Two people working at a desk"
                  />
                </Card>
              </div>
            </Grid>
          </Card>
        </div>

        <VStack hAlign="center">
          <Text type="supporting" color="secondary">
            By clicking continue, you agree to our{' '}
            <Link href="#" type="supporting">
              Terms of Service
            </Link>{' '}
            and{' '}
            <Link href="#" type="supporting">
              Privacy Policy
            </Link>
            .
          </Text>
        </VStack>
      </VStack>
    </Center>
  );
}
