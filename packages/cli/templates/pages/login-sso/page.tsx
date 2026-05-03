'use client';

import {useState} from 'react';
import * as stylex from '@stylexjs/stylex';
import {ShieldCheckIcon} from '@heroicons/react/24/outline';
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
import {XDSAvatar} from '@xds/core/Avatar';
import {shadowVars} from '@xds/core/theme/tokens.stylex';

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

// building from xds_oss asset set
const BG_URL =
  'https://lookaside.facebook.com/assets/xds_oss/building.jpg';

const styles = stylex.create({
  page: {
    height: '100dvh',
    backgroundImage: `url(${BG_URL})`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
  },
  card: {
    boxShadow: shadowVars['--shadow-high'],
    borderWidth: 0,
  },
  fullWidth: {
    width: '100%',
  },
});

type SSOProvider = {
  name: string;
  abbr: string;
};
const SSO_PROVIDERS: Record<string, SSOProvider> = {
  'google.com': {name: 'Google Workspace', abbr: 'G'},
  'microsoft.com': {name: 'Microsoft Entra ID', abbr: 'M'},
  'okta.com': {name: 'Okta', abbr: 'O'},
  'meta.com': {name: 'Meta SSO', abbr: 'M'},
  'apple.com': {name: 'Apple Business', abbr: 'A'},
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
  const [isLoading, setIsLoading] = useState(false);

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

  const handleBack = () => {
    setStep('email');
    setLoginFailed(false);
    setIsLoading(false);
  };

  const handleSignIn = () => {
    if (!password) {
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
    <XDSCenter axis="both" xstyle={styles.page}>
      <XDSCard padding={8} width={400} xstyle={styles.card}>
                  <XDSVStack gap={4}>
                {/* ── Step 1: Email entry ── */}
                {step === 'email' && (
                  <>
                    <XDSVStack gap={1} hAlign="center">
                      <XDSText type="display-1" as="h2">Welcome back</XDSText>
                      <XDSText type="body" color="secondary" size="sm">
                        Enter your details to sign in to your account
                      </XDSText>
                    </XDSVStack>

                    <XDSVStack gap={2}>
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
                      <XDSTextInput
                        label="Password"
                        isLabelHidden
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={setPassword}
                        size="lg"
                      />
                    </XDSVStack>

                    <XDSLink
                      href="#"
                      size="sm"
                      color="secondary"
                      type="supporting">
                      Having trouble signing in?
                    </XDSLink>

                    <XDSButton
                      label="Sign in"
                      variant="primary"
                      size="lg"
                      xstyle={styles.fullWidth}
                      onClick={handleContinue}
                      isDisabled={!emailValid}
                    />

                    <XDSDivider label="Or sign in with" />

                    <XDSButton
                      label="Continue with SSO"
                      variant="secondary"
                      size="lg"
                      xstyle={styles.fullWidth}
                    />

                    <XDSVStack hAlign="center">
                      <XDSText type="supporting" color="secondary">
                        Don&apos;t have an account?{' '}
                        <XDSLink href="#" type="supporting">
                          Request access
                        </XDSLink>
                      </XDSText>
                    </XDSVStack>
                  </>
                )}

                {/* ── Step 2a: SSO provider detected ── */}
                {step === 'sso-confirm' && provider && (
                  <>
                    <XDSVStack gap={2} hAlign="center">
                      <XDSAvatar name={provider.name} size={48} />
                      <XDSText type="display-3" as="h2">
                        Sign in with {provider.name}
                      </XDSText>
                      <XDSText type="body" color="secondary" size="sm">
                        You will be redirected back after signing in.
                      </XDSText>
                    </XDSVStack>

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
                        isLoading={isLoading}
                        xstyle={styles.fullWidth}
                        onClick={() => setIsLoading(true)}
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
                        isLoading={isLoading}
                        xstyle={styles.fullWidth}
                        onClick={handleSignIn}
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
    </XDSCenter>
  );
}
