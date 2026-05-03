'use client';

import {useState} from 'react';
import * as stylex from '@stylexjs/stylex';
import {XDSVStack, XDSHStack, XDSStackItem} from '@xds/core/Layout';
import {XDSGrid} from '@xds/core/Grid';
import {XDSCenter} from '@xds/core/Center';
import {XDSCard} from '@xds/core/Card';
import {XDSText} from '@xds/core/Text';
import {XDSIcon} from '@xds/core/Icon';
import {XDSEmptyState} from '@xds/core/EmptyState';
import {SquaresPlusIcon, CheckCircleIcon} from '@heroicons/react/24/outline';
import {XDSTextInput} from '@xds/core/TextInput';
import {XDSButton} from '@xds/core/Button';
import {XDSLink} from '@xds/core/Link';
import {XDSDivider} from '@xds/core/Divider';
import {
  colorVars,
  spacingVars,
  radiusVars,
} from '@xds/core/theme/tokens.stylex';

// light-working-vertical-1 from xds_oss asset set
const COVER_IMAGE_URL =
  'https://lookaside.facebook.com/assets/xds_oss/light-working-vertical-1.png';

const AppleIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="currentColor" width={16} height={16} aria-hidden="true" {...props}>
    <path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
  </svg>
);

const GoogleIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="currentColor" width={16} height={16} aria-hidden="true" {...props}>
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
  </svg>
);

const styles = stylex.create({
  page: {
    backgroundColor: colorVars['--color-background-body'],
  },
  fullWidth: {
    width: '100%',
  },
  formColumn: {
    padding: spacingVars['--spacing-8'],
  },
  imageColumn: {
    paddingBlock: spacingVars['--spacing-4'],
    paddingInlineEnd: spacingVars['--spacing-4'],
  },
  coverImage: {
    width: '100%',
    height: '100%',
    objectFit: 'cover' as const,
    borderRadius: radiusVars['--radius-container'],
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
    <XDSCenter axis="both" height="100dvh" xstyle={styles.page}>
      <XDSVStack gap={4} hAlign="center">
        {/* Card */}
        <XDSCard padding={0} maxWidth={1000} width="100%">
          <XDSGrid columns={2} align="stretch">
            {/* Left — Form */}
            <XDSVStack xstyle={styles.formColumn}>
              <XDSHStack gap={2} vAlign="center">
                <XDSIcon icon={SquaresPlusIcon} />
                <XDSText type="body" weight="bold">Product Inc.</XDSText>
              </XDSHStack>

              <XDSStackItem size="fill">
                <XDSCenter axis="vertical" height="100%">
                  {isSuccess ? (
                    <XDSEmptyState
                      title="You're signed in"
                      description="Redirecting to your dashboard…"
                      icon={<CheckCircleIcon width={48} height={48} />}
                    />
                  ) : (
                  <XDSVStack gap={4} xstyle={styles.fullWidth}>
                    <XDSVStack gap={1}>
                      <XDSText type="display-1" as="h2">Welcome back</XDSText>
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
                      xstyle={styles.fullWidth}
                      onClick={handleLogin}
                    />

                    <XDSDivider label="Or continue with" />

                    <XDSHStack gap={3}>
                      <XDSStackItem size="fill">
                        <XDSButton
                          label="Apple"
                          variant="secondary"
                          icon={<AppleIcon />}
                          size="lg"
                          xstyle={styles.fullWidth}
                        />
                      </XDSStackItem>
                      <XDSStackItem size="fill">
                        <XDSButton
                          label="Google"
                          variant="secondary"
                          icon={<GoogleIcon />}
                          size="lg"
                          xstyle={styles.fullWidth}
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

            {/* Right — Cover image */}
            <XDSVStack xstyle={styles.imageColumn}>
              <img
                {...stylex.props(styles.coverImage)}
                src={COVER_IMAGE_URL}
                alt="Two people working at a desk"
              />
            </XDSVStack>
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
