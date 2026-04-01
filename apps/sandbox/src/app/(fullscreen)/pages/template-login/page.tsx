'use client';

import {useState} from 'react';
import * as stylex from '@stylexjs/stylex';
import {XDSVStack, XDSHStack} from '@xds/core/Layout';
import {XDSText, XDSHeading} from '@xds/core/Text';
import {XDSTextInput} from '@xds/core/TextInput';
import {XDSButton} from '@xds/core/Button';
import {XDSCard} from '@xds/core/Card';
import {XDSLink} from '@xds/core/Link';
import {XDSDivider} from '@xds/core/Divider';

// Icons
const LogoIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="currentColor" width={24} height={24} {...props}>
    <rect x="3" y="3" width="18" height="18" rx="4" fill="currentColor" />
    <rect x="7" y="7" width="10" height="3" rx="1" fill="white" />
    <rect x="7" y="12" width="6" height="3" rx="1" fill="white" />
  </svg>
);

const AppleIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="currentColor" width={16} height={16} {...props}>
    <path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
  </svg>
);

const GoogleIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="currentColor" width={16} height={16} {...props}>
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
  </svg>
);

const styles = stylex.create({
  page: {
    display: 'flex',
    flexDirection: 'column',
    minHeight: '100svh',
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  wrapper: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    width: '100%',
    maxWidth: 340,
    gap: 16,
  },
  fullWidth: {
    width: '100%',
  },
  passwordLabelRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  signupText: {
    textAlign: 'center',
  },
  dividerRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 16,
    width: '100%',
  },
  dividerLine: {
    flexGrow: 1,
  },
  centered: {
    textAlign: 'center',
  },
  footer: {
    textAlign: 'center',
  },
});

export default function LoginTemplate() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  return (
    <div style={{display: 'flex', flexDirection: 'column', minHeight: '100svh', width: '100%', alignItems: 'center', justifyContent: 'center', padding: 24}}>
      <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%', maxWidth: 340, gap: 16}}>
        {/* Logo */}
        <XDSHStack gap={2}>
          <LogoIcon />
          <XDSText type="body" weight="bold">Acme Inc.</XDSText>
        </XDSHStack>

        {/* Card */}
        <XDSCard>
          <XDSVStack gap={4}>
            {/* Header */}
            <div {...stylex.props(styles.centered)}>
              <XDSVStack gap={2}>
                <XDSHeading level={2}>Welcome back</XDSHeading>
                <XDSText type="body" color="secondary">
                  Login with your Apple or Google account
                </XDSText>
              </XDSVStack>
            </div>

            {/* Social buttons */}
            <XDSVStack gap={3}>
              <XDSButton
                label="Login with Apple"
                variant="secondary"
                icon={<AppleIcon />}
                xstyle={styles.fullWidth}
              >
                Login with Apple
              </XDSButton>
              <XDSButton
                label="Login with Google"
                variant="secondary"
                icon={<GoogleIcon />}
                xstyle={styles.fullWidth}
              >
                Login with Google
              </XDSButton>
            </XDSVStack>

            {/* Divider */}
            <div {...stylex.props(styles.dividerRow)}>
              <div {...stylex.props(styles.dividerLine)}>
                <XDSDivider />
              </div>
              <XDSText type="supporting" color="secondary">Or continue with</XDSText>
              <div {...stylex.props(styles.dividerLine)}>
                <XDSDivider />
              </div>
            </div>

            {/* Form fields */}
            <XDSVStack gap={4}>
              <XDSTextInput
                label="Email"
                type="email"
                placeholder="m@example.com"
                value={email}
                onChange={setEmail}
              />
              <XDSVStack gap={1}>
                <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
                  <XDSText type="label">Password</XDSText>
                  <XDSLink label="Forgot your password?" href="#">
                    <XDSText type="supporting">Forgot your password?</XDSText>
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
            </XDSVStack>

            {/* Login button */}
            <XDSButton
              label="Login"
              variant="primary"
              xstyle={styles.fullWidth}
            />

            {/* Sign up link */}
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

        {/* Terms footer */}
        <div {...stylex.props(styles.footer)}>
          <XDSText type="supporting" color="secondary">
            By clicking continue, you agree to our{' '}
            <XDSLink label="Terms of Service" href="#">
              <XDSText type="supporting">Terms of Service</XDSText>
            </XDSLink>{' '}
            and{' '}
            <XDSLink label="Privacy Policy" href="#">
              <XDSText type="supporting">Privacy Policy</XDSText>
            </XDSLink>
            .
          </XDSText>
        </div>
      </div>
    </div>
  );
}
