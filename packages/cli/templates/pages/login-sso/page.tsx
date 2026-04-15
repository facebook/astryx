'use client';

import {useState} from 'react';
import * as stylex from '@stylexjs/stylex';
import {XDSVStack, XDSHStack} from '@xds/core/Layout';
import {XDSText, XDSHeading} from '@xds/core/Text';
import {XDSTextInput} from '@xds/core/TextInput';
import {XDSButton} from '@xds/core/Button';
import {XDSCard} from '@xds/core/Card';
import {XDSSection} from '@xds/core/Section';
import {XDSLink} from '@xds/core/Link';
import {XDSDivider} from '@xds/core/Divider';
import {colorVars, spacingVars} from '@xds/core/theme/tokens.stylex';

// ---------------------------------------------------------------------------
// Icons
// ---------------------------------------------------------------------------

const LogoIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    viewBox="0 0 24 24"
    fill="currentColor"
    width={24}
    height={24}
    {...props}>
    <rect x="3" y="3" width="18" height="18" rx="4" fill="currentColor" />
    <rect x="7" y="7" width="10" height="3" rx="1" fill="white" />
    <rect x="7" y="12" width="6" height="3" rx="1" fill="white" />
  </svg>
);

const BuildingIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" width={20} height={20}>
    <rect
      x="3"
      y="6"
      width="18"
      height="15"
      rx="2"
      stroke="currentColor"
      strokeWidth="1.5"
    />
    <path
      d="M8 21V10M16 21V10M3 10h18"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
    />
    <rect
      x="10"
      y="14"
      width="4"
      height="7"
      rx="1"
      stroke="currentColor"
      strokeWidth="1.5"
    />
  </svg>
);

const ShieldIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" width={24} height={24}>
    <path
      d="M12 3L4 7v6c0 4.4 3.4 8.5 8 9.5 4.6-1 8-5.1 8-9.5V7L12 3z"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinejoin="round"
    />
    <path
      d="M9 12l2 2 4-4"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const ArrowRightIcon = () => (
  <svg viewBox="0 0 16 16" fill="none" width={24} height={24}>
    <path
      d="M3 8h10M9 4l4 4-4 4"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const styles = stylex.create({
  pageBg: {
    backgroundColor: colorVars['--color-background-body'],
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
  dividerLine: {flexGrow: 1},
  centered: {textAlign: 'center'},
});

// Mock SSO providers keyed by email domain
const SSO_PROVIDERS: Record<
  string,
  {name: string; color: string; abbr: string; logo?: React.ReactNode}
> = {
  'google.com': {name: 'Google Workspace', color: '#4285F4', abbr: 'G'},
  'microsoft.com': {name: 'Microsoft Entra ID', color: '#00A4EF', abbr: 'M'},
  'okta.com': {name: 'Okta', color: '#007DC1', abbr: 'O'},
  'meta.com': {
    name: 'Meta SSO',
    color: '#ffffff',
    abbr: 'M',
    logo: (
      <img
        src="https://static.xx.fbcdn.net/rsrc.php/y9/r/tL_v571NdZ0.svg"
        height={16}
        alt="Meta"
        style={{display: 'block'}}
      />
    ),
  },
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
    <div
      {...stylex.props(styles.pageBg)}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'fixed',
        inset: 0,
        overflow: 'auto',
        padding: 24,
        gap: 16,
      }}>
      {/* Logo */}
      <XDSVStack gap={2} hAlign="center">
        <LogoIcon />
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
                  onKeyDown={(e: React.KeyboardEvent) => {
                    if (e.key === 'Enter') handleContinue();
                  }}
                />
                <XDSButton
                  label="Continue"
                  variant="primary"
                  xstyle={styles.fullWidth}
                  onClick={handleContinue}
                  isDisabled={!emailValid}
                />
              </XDSVStack>

              <XDSHStack gap={4} vAlign="center">
                <div style={{flex: 1}}>
                  <XDSDivider />
                </div>
                <XDSText type="supporting" color="secondary">
                  or
                </XDSText>
                <div style={{flex: 1}}>
                  <XDSDivider />
                </div>
              </XDSHStack>

              <XDSVStack gap={2}>
                <XDSButton
                  label="Continue with SSO"
                  variant="secondary"
                  xstyle={styles.fullWidth}>
                  Continue with SSO
                </XDSButton>
              </XDSVStack>

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
                <XDSVStack gap={1}>
                  <XDSHStack hAlign="center" style={{marginBottom: 8}}>
                    {provider.logo ?? (
                      <div
                        style={{
                          width: 48,
                          height: 48,
                          borderRadius: 12,
                          background: provider.color,
                          color: '#fff',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: 20,
                          fontWeight: 700,
                        }}>
                        {provider.abbr}
                      </div>
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
                <XDSSection variant="wash" style={{padding: 16}}>
                  <XDSHStack gap={2} vAlign="center">
                    <XDSText type="body" color="secondary">
                      <ShieldIcon />
                    </XDSText>
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
                  xstyle={styles.fullWidth}>
                  Continue with {provider.name}
                </XDSButton>
                <XDSButton
                  label="Use a different email"
                  variant="ghost"
                  xstyle={styles.fullWidth}
                  onClick={handleBack}>
                  Use a different email
                </XDSButton>
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
                  <XDSHStack style={{marginBottom: 4}}>
                    <XDSText type="label">Password</XDSText>
                  </XDSHStack>
                  <XDSTextInput
                    label="Password"
                    isLabelHidden
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
                        label="Forgot password?"
                        href="#"
                        size="sm"
                        color="secondary"
                        type="supporting">
                        Forgot password?
                      </XDSLink>
                    </div>
                  )}
                </XDSVStack>

                <XDSButton
                  label="Sign in"
                  variant="primary"
                  xstyle={styles.fullWidth}
                  onClick={() => setLoginFailed(true)}
                />
                <XDSButton
                  label="Use a different email"
                  variant="ghost"
                  xstyle={styles.fullWidth}
                  onClick={handleBack}>
                  Use a different email
                </XDSButton>
              </XDSVStack>
            </>
          )}
        </XDSVStack>
      </XDSCard>

      {/* Terms */}
      <div {...stylex.props(styles.centered)} style={{maxWidth: 400}}>
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
      </div>
    </div>
  );
}
