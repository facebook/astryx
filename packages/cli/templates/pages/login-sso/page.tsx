'use client';

import {useState} from 'react';
import * as stylex from '@stylexjs/stylex';
import {CubeIcon, ShieldCheckIcon} from '@heroicons/react/24/outline';
import {XDSVStack, XDSHStack} from '@xds/core/Layout';
import {XDSCenter} from '@xds/core/Center';
import {XDSText, XDSHeading} from '@xds/core/Text';
import {XDSTextInput} from '@xds/core/TextInput';
import {XDSButton} from '@xds/core/Button';
import {XDSCard} from '@xds/core/Card';
import {XDSSection} from '@xds/core/Section';
import {XDSLink} from '@xds/core/Link';
import {XDSDivider} from '@xds/core/Divider';
import {XDSIcon} from '@xds/core/Icon';
import {colorVars, spacingVars, radiusVars} from '@xds/core/theme/tokens.stylex';

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

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
  providerBadge: (bgColor: string) => ({
    width: 48,
    height: 48,
    borderRadius: radiusVars['--radius-container'],
    backgroundColor: bgColor,
    color: '#fff',
    fontSize: 20,
    fontWeight: 700,
  }),
  providerLogo: {
    width: 48,
    height: 48,
  },
  termsFooter: {
    maxWidth: 400,
  },
});

// Meta infinity-loop logo (from https://upload.wikimedia.org/wikipedia/commons/d/d0/Meta_Platforms_logo.svg)
function MetaLogo(props: React.SVGProps<SVGSVGElement>) {
  const id = Math.random().toString(36).slice(2, 8);
  const g1 = `ml-g1-${id}`;
  const g2 = `ml-g2-${id}`;
  return (
    <svg viewBox="0 0 290 191" {...props}>
      <defs>
        <linearGradient id={g1} x1="61" y1="117" x2="259" y2="127" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#0064e1" /><stop offset="0.4" stopColor="#0064e1" /><stop offset="0.83" stopColor="#0073ee" /><stop offset="1" stopColor="#0082fb" />
        </linearGradient>
        <linearGradient id={g2} x1="45" y1="139" x2="45" y2="66" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#0082fb" /><stop offset="1" stopColor="#0064e0" />
        </linearGradient>
      </defs>
      <path fill="#0081fb" d="m31.06,125.96c0,10.98 2.41,19.41 5.56,24.51 4.13,6.68 10.29,9.51 16.57,9.51 8.1,0 15.51-2.01 29.79-21.76 11.44-15.83 24.92-38.05 33.99-51.98l15.36-23.6c10.67-16.39 23.02-34.61 37.18-46.96 11.56-10.08 24.03-15.68 36.58-15.68 21.07,0 41.14,12.21 56.5,35.11 16.81,25.08 24.97,56.67 24.97,89.27 0,19.38-3.82,33.62-10.32,44.87-6.28,10.88-18.52,21.75-39.11,21.75l0-31.02c17.63,0 22.03-16.2 22.03-34.74 0-26.42-6.16-55.74-19.73-76.69-9.63-14.86-22.11-23.94-35.84-23.94-14.85,0-26.8,11.2-40.23,31.17-7.14,10.61-14.47,23.54-22.7,38.13l-9.06,16.05c-18.2,32.27-22.81,39.62-31.91,51.75-15.95,21.24-29.57,29.29-47.5,29.29-21.27,0-34.72-9.21-43.05-23.09-6.8-11.31-10.14-26.15-10.14-43.06z" />
      <path fill={`url(#${g1})`} d="m24.49,37.3c14.24-21.95 34.79-37.3 58.36-37.3 13.65,0 27.22,4.04 41.39,15.61 15.5,12.65 32.02,33.48 52.63,67.81l7.39,12.32c17.84,29.72 27.99,45.01 33.93,52.22 7.64,9.26 12.99,12.02 19.94,12.02 17.63,0 22.03-16.2 22.03-34.74l27.4-.86c0,19.38-3.82,33.62-10.32,44.87-6.28,10.88-18.52,21.75-39.11,21.75-12.8,0-24.14-2.78-36.68-14.61-9.64-9.08-20.91-25.21-29.58-39.71l-25.79-43.08c-12.94-21.62-24.81-37.74-31.68-45.04-7.39-7.85-16.89-17.33-32.05-17.33-12.27,0-22.69,8.61-31.41,21.78z" />
      <path fill={`url(#${g2})`} d="m82.35,31.23c-12.27,0-22.69,8.61-31.41,21.78-12.33,18.61-19.88,46.33-19.88,72.95 0,10.98 2.41,19.41 5.56,24.51l-26.48,17.44c-6.8-11.31-10.14-26.15-10.14-43.06 0-30.75 8.44-62.8 24.49-87.55 14.24-21.95 34.79-37.3 58.36-37.3z" />
    </svg>
  );
}

// Mock SSO providers keyed by email domain
type SSOProvider = {name: string; color: string; abbr: string; logo?: React.ComponentType<React.SVGProps<SVGSVGElement>>};
const SSO_PROVIDERS: Record<string, SSOProvider> = {
  'google.com': {name: 'Google Workspace', color: '#4285F4', abbr: 'G'},
  'microsoft.com': {name: 'Microsoft Entra ID', color: '#00A4EF', abbr: 'M'},
  'okta.com': {name: 'Okta', color: '#007DC1', abbr: 'O'},
  'meta.com': {name: 'Meta SSO', color: '#0668E1', abbr: 'M', logo: MetaLogo},
  'apple.com': {name: 'Apple Business', color: '#000000', abbr: 'A'},
};

function getProvider(email: string) {
  const domain = email.split('@')[1]?.toLowerCase();
  return domain ? (SSO_PROVIDERS[domain] ?? null) : null;
}

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

type Step = 'email' | 'sso-confirm' | 'password-fallback';

export default function LoginSSO() {
  const [step, setStep] = useState<Step>('email');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginFailed, setLoginFailed] = useState(false);

  const provider = getProvider(email);
  const emailValid = isValidEmail(email);

  const handleContinue = () => {
    if (!emailValid) return;
    if (provider) {
      setStep('sso-confirm');
    } else {
      setStep('password-fallback');
    }
  };

  const handleBack = () => setStep('email');

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
            {/* ── Step 1: Email entry ── */}
            {step === 'email' && (
              <>
                <XDSVStack hAlign="center" xstyle={styles.centered}>
                  <XDSVStack gap={1}>
                    <XDSHeading level={2}>Welcome back</XDSHeading>
                    <XDSText type="body" color="secondary" size="sm">
                      Enter your work email to continue
                    </XDSText>
                  </XDSVStack>
                </XDSVStack>

                <XDSVStack gap={4}>
                  <XDSTextInput
                    label="Work email"
                    isLabelHidden
                    type="email"
                    placeholder="you@company.com"
                    value={email}
                    onChange={setEmail}
                    size="lg"
                    onKeyDown={(e: React.KeyboardEvent) => {
                      if (e.key === 'Enter') handleContinue();
                    }}
                  />
                  <XDSButton
                    label="Continue"
                    variant="primary"
                    size="lg"
                    xstyle={styles.fullWidth}
                    onClick={handleContinue}
                    isDisabled={!emailValid}
                  />
                </XDSVStack>

                <XDSDivider label="or" />

                <XDSButton
                  label="Continue with SSO"
                  variant="secondary"
                  size="lg"
                  xstyle={styles.fullWidth}
                />

                <XDSVStack hAlign="center">
                  <XDSText type="supporting" color="secondary">
                    Don&apos;t have an account?{' '}
                    <XDSLink label="Sign up" href="#" type="supporting">
                      Sign up
                    </XDSLink>
                  </XDSText>
                </XDSVStack>
              </>
            )}

            {/* ── Step 2a: SSO provider detected ── */}
            {step === 'sso-confirm' && provider && (
              <>
                <XDSVStack hAlign="center" xstyle={styles.centered}>
                  <XDSVStack gap={2}>
                    <XDSHStack hAlign="center">
                      {provider.logo ? (
                        <provider.logo {...stylex.props(styles.providerLogo)} />
                      ) : (
                        <XDSCenter
                          axis="both"
                          xstyle={styles.providerBadge(provider.color)}>
                          {provider.abbr}
                        </XDSCenter>
                      )}
                    </XDSHStack>
                    <XDSHeading level={2}>
                      Sign in with {provider.name}
                    </XDSHeading>
                    <XDSText type="body" color="secondary" size="sm">
                      You will be redirected back after signing in.
                    </XDSText>
                  </XDSVStack>
                </XDSVStack>

                {/* SSO info card */}
                <XDSCard padding={0}>
                  <XDSSection variant="wash" padding={4}>
                    <XDSHStack gap={2} vAlign="center">
                      <XDSIcon icon={ShieldCheckIcon} color="secondary" />
                      <XDSVStack gap={0}>
                        <XDSText type="label">{provider.name}</XDSText>
                        <XDSText type="supporting" color="secondary">
                          {email}
                        </XDSText>
                      </XDSVStack>
                    </XDSHStack>
                  </XDSSection>
                </XDSCard>

                <XDSVStack gap={3}>
                  <XDSButton
                    label={`Continue with ${provider.name}`}
                    variant="primary"
                    size="lg"
                    xstyle={styles.fullWidth}
                  />
                  <XDSButton
                    label="Use a different email"
                    variant="ghost"
                    size="lg"
                    xstyle={styles.fullWidth}
                    onClick={handleBack}
                  />
                </XDSVStack>
              </>
            )}

            {/* ── Step 2b: No SSO — password fallback ── */}
            {step === 'password-fallback' && (
              <>
                <XDSVStack hAlign="center" xstyle={styles.centered}>
                  <XDSVStack gap={1}>
                    <XDSHeading level={2}>Welcome back</XDSHeading>
                    <XDSText type="body" color="secondary" size="sm">
                      {email}
                    </XDSText>
                  </XDSVStack>
                </XDSVStack>

                <XDSVStack gap={4}>
                  <XDSVStack gap={1}>
                    <XDSTextInput
                      label="Password"
                      type="password"
                      value={password}
                      size="lg"
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
                      <XDSVStack hAlign="end">
                        <XDSLink
                          label="Forgot password?"
                          href="#"
                          size="sm"
                          color="secondary"
                          type="supporting">
                          Forgot password?
                        </XDSLink>
                      </XDSVStack>
                    )}
                  </XDSVStack>

                  <XDSButton
                    label="Sign in"
                    variant="primary"
                    size="lg"
                    xstyle={styles.fullWidth}
                    onClick={() => setLoginFailed(true)}
                  />
                  <XDSButton
                    label="Use a different email"
                    variant="ghost"
                    size="lg"
                    xstyle={styles.fullWidth}
                    onClick={handleBack}
                  />
                </XDSVStack>
              </>
            )}
          </XDSVStack>
        </XDSCard>

        {/* Terms */}
        <XDSVStack hAlign="center" xstyle={styles.termsFooter}>
          <XDSText type="supporting" color="secondary" xstyle={styles.centered}>
            By continuing, you agree to our{' '}
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
      </XDSVStack>
    </XDSCenter>
  );
}
