'use client';

import {useState} from 'react';
import * as stylex from '@stylexjs/stylex';
import {CubeIcon, ShieldCheckIcon} from '@heroicons/react/24/outline';
import {XDSVStack, XDSHStack} from '@xds/core/Layout';
import {XDSCenter} from '@xds/core/Center';
import {XDSText} from '@xds/core/Text';
import {XDSTextInput} from '@xds/core/TextInput';
import {XDSButton} from '@xds/core/Button';
import {XDSCard} from '@xds/core/Card';
import {XDSSection} from '@xds/core/Section';
import {XDSLink} from '@xds/core/Link';
import {XDSDivider} from '@xds/core/Divider';
import {XDSIcon} from '@xds/core/Icon';
import {colorVars, radiusVars} from '@xds/core/theme/tokens.stylex';

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const styles = stylex.create({
  page: {
    backgroundColor: colorVars['--color-background-body'],
  },
  fullWidth: {
    width: '100%',
  },
  providerBadge: (bgColor: string) => ({
    borderRadius: radiusVars['--radius-container'],
    backgroundColor: bgColor,
    color: '#fff',
    fontSize: 20,
    fontWeight: 700,
  }),
});

const META_LOGO_URL = '/templates/meta-logo.svg';

type SSOProvider = {
  name: string;
  color: string;
  abbr: string;
  logoUrl?: string;
};
const SSO_PROVIDERS: Record<string, SSOProvider> = {
  'google.com': {name: 'Google Workspace', color: '#4285F4', abbr: 'G'},
  'microsoft.com': {name: 'Microsoft Entra ID', color: '#00A4EF', abbr: 'M'},
  'okta.com': {name: 'Okta', color: '#007DC1', abbr: 'O'},
  'meta.com': {name: 'Meta SSO', color: '#0668E1', abbr: 'M', logoUrl: META_LOGO_URL},
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
    <XDSCenter axis="both" height="100dvh" xstyle={styles.page}>
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
                <XDSVStack gap={1} hAlign="center">
                  <XDSText type="display-1" as="h2">Welcome back</XDSText>
                  <XDSText type="body" color="secondary" size="sm">
                    Enter your work email to continue
                  </XDSText>
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
                <XDSVStack gap={2} hAlign="center">
                  {provider.logoUrl ? (
                    <img src={provider.logoUrl} width={48} height={48} alt="" />
                  ) : (
                    <XDSCenter
                      axis="both"
                      width={48}
                      height={48}
                      xstyle={styles.providerBadge(provider.color)}>
                      {provider.abbr}
                    </XDSCenter>
                  )}
                  <XDSText type="display-1" as="h2">
                    Sign in with {provider.name}
                  </XDSText>
                  <XDSText type="body" color="secondary" size="sm">
                    You will be redirected back after signing in.
                  </XDSText>
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
                <XDSVStack gap={1} hAlign="center">
                  <XDSText type="display-1" as="h2">Welcome back</XDSText>
                  <XDSText type="body" color="secondary" size="sm">
                    {email}
                  </XDSText>
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
        <XDSVStack hAlign="center">
          <XDSText type="supporting" color="secondary">
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
