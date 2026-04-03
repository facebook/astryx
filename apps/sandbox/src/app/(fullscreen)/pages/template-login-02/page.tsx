'use client';

import {useState} from 'react';
import * as stylex from '@stylexjs/stylex';
import {XDSVStack, XDSHStack} from '@xds/core/Layout';
import {XDSCard} from '@xds/core/Card';
import {XDSText, XDSHeading} from '@xds/core/Text';
import {XDSTextInput} from '@xds/core/TextInput';
import {XDSButton} from '@xds/core/Button';
import {XDSLink} from '@xds/core/Link';
import {XDSDivider} from '@xds/core/Divider';
import {
  colorVars,
  spacingVars,
  radiusVars,
} from '@xds/core/theme/tokens.stylex';
import {ImageIcon} from '../../../icons';

const AppleIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    viewBox="0 0 24 24"
    fill="currentColor"
    width={16}
    height={16}
    {...props}>
    <path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
  </svg>
);

const GoogleIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    viewBox="0 0 24 24"
    fill="currentColor"
    width={16}
    height={16}
    {...props}>
    <path
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
      fill="#4285F4"
    />
    <path
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      fill="#34A853"
    />
    <path
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      fill="#FBBC05"
    />
    <path
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      fill="#EA4335"
    />
  </svg>
);

const MetaIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    viewBox="0 0 24 24"
    fill="currentColor"
    width={16}
    height={16}
    {...props}>
    <path d="M6.916 4.603c-1.293 0-2.378.89-3.252 2.14C2.453 8.558 1.8 11.073 1.8 13.2c0 1.225.293 2.198.865 2.88.54.643 1.31.97 2.215.97 1.168 0 2.085-.59 3.084-2.013.79-1.126 1.583-2.685 2.575-4.63l.387-.76c.828-1.627 1.778-3.377 2.937-4.726C15.15 3.49 16.622 2.8 18.25 2.8c1.85 0 3.387.87 4.454 2.4C23.76 6.69 24.2 8.933 24.2 11.5c0 2.758-.68 5.083-1.907 6.72C21.1 19.825 19.363 20.8 17.3 20.8v-2.9c1.26 0 2.233-.573 2.97-1.59.783-1.078 1.23-2.7 1.23-4.81 0-1.94-.332-3.553-.977-4.67-.6-1.04-1.44-1.63-2.573-1.63-1.078 0-1.972.613-2.873 1.8-.7.92-1.384 2.135-2.178 3.66l-.478.924c-1.005 1.94-1.88 3.468-2.876 4.676C8.242 18.018 6.92 18.9 5.1 18.9c-1.648 0-2.97-.62-3.888-1.713C.33 16.118-.1 14.578-.1 12.8c0-2.53.722-5.383 2.1-7.53C3.37 3.1 5.065 2 6.916 2v2.603z" />
  </svg>
);

const styles = stylex.create({
  pageBg: {
    backgroundColor: colorVars['--color-background-body'],
  },
  cardBg: {
    backgroundColor: colorVars['--color-background-card'],
  },
  imageBg: {
    backgroundColor: colorVars['--color-background-muted'],
  },
  card: {
    display: 'flex',
    maxWidth: 900,
    width: '100%',
    backgroundColor: colorVars['--color-background-card'],
    borderRadius: radiusVars['--radius-container'],
    overflow: 'hidden',
    boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
  },
  formSide: {
    flex: 1,
    padding: spacingVars['--spacing-8'],
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
  },
  imageSide: {
    flex: 1,
    backgroundColor: colorVars['--color-background-muted'],
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 400,
  },
  fullWidth: {
    width: '100%',
  },
  dividerRow: {
    display: 'flex',
    alignItems: 'center',
    gap: spacingVars['--spacing-4'],
    width: '100%',
  },
  dividerLine: {
    flexGrow: 1,
  },
  centered: {
    textAlign: 'center',
  },
  passwordRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  socialRow: {
    display: 'flex',
    gap: spacingVars['--spacing-3'],
  },
  socialButton: {
    flex: 1,
  },
});

export default function LoginTwoColumn() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginFailed, setLoginFailed] = useState(false);

  return (
    <div
      {...stylex.props(styles.pageBg)}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100svh',
        height: '100%',
        padding: 24,
        position: 'fixed',
        inset: 0,
        overflow: 'auto',
        gap: 16,
      }}>
      {/* Card */}
      <XDSCard padding={0} maxWidth={900} width="100%">
        <XDSHStack>
          {/* Left — Form */}
          <div
            style={{
              width: 400,
              minWidth: 400,
              padding: 32,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
            }}>
            <XDSVStack gap={4}>
              <XDSVStack hAlign="center" xstyle={styles.centered}>
                <XDSVStack gap={1}>
                  <XDSHeading level={2}>Welcome back</XDSHeading>
                  <XDSText type="body" color="secondary" size="sm">
                    Login to your Product Inc. account
                  </XDSText>
                </XDSVStack>
              </XDSVStack>

              <XDSVStack gap={2}>
                <XDSTextInput
                  label="Email"
                  isLabelHidden
                  type="email"
                  placeholder="name@company.com"
                  value={email}
                  onChange={setEmail}
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
                    <div style={{textAlign: 'right'}}>
                      <XDSLink
                        label="Forgot your password?"
                        href="#"
                        size="sm"
                        color="secondary"
                        type="supporting">
                        Forgot your password?
                      </XDSLink>
                    </div>
                  )}
                </XDSVStack>
              </XDSVStack>

              <XDSButton
                label="Login"
                variant="primary"
                xstyle={styles.fullWidth}
                onClick={() => setLoginFailed(true)}
              />

              <XDSHStack gap={4} vAlign="center">
                <div style={{flex: 1}}>
                  <XDSDivider />
                </div>
                <XDSText type="supporting" color="secondary">
                  Or continue with
                </XDSText>
                <div style={{flex: 1}}>
                  <XDSDivider />
                </div>
              </XDSHStack>

              <div {...stylex.props(styles.socialRow)}>
                <XDSButton
                  label="Apple"
                  variant="secondary"
                  icon={<AppleIcon />}
                  xstyle={styles.socialButton}>
                  Apple
                </XDSButton>
                <XDSButton
                  label="Google"
                  variant="secondary"
                  icon={<GoogleIcon />}
                  xstyle={styles.socialButton}>
                  Google
                </XDSButton>
              </div>

              <XDSVStack hAlign="center" xstyle={styles.centered}>
                <XDSText type="supporting" color="secondary">
                  Don&apos;t have an account?{' '}
                  <XDSLink label="Sign up" href="#" type="supporting">
                    Sign up
                  </XDSLink>
                </XDSText>
              </XDSVStack>
            </XDSVStack>
          </div>

          {/* Right — Image placeholder */}
          <div
            {...stylex.props(styles.imageBg)}
            style={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              minHeight: 400,
              borderRadius: '0 12px 12px 0',
            }}>
            <ImageIcon
              style={{
                width: 64,
                height: 64,
                opacity: 0.3,
                color: 'var(--color-text-disabled)',
              }}
            />
          </div>
        </XDSHStack>
      </XDSCard>

      {/* Terms — outside card */}
      <XDSVStack hAlign="center" xstyle={styles.centered}>
        <XDSText type="supporting" color="secondary">
          By clicking continue, you agree to our{' '}
          <XDSLink label="Terms of Service" href="#" type="supporting">
            Terms of Service
          </XDSLink>{' '}
          and{' '}
          <XDSLink label="Privacy Policy" href="#" type="supporting">
            Privacy Policy
          </XDSLink>
          .
        </XDSText>
      </XDSVStack>
    </div>
  );
}
