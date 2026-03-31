'use client';

import {useState} from 'react';
import * as stylex from '@stylexjs/stylex';
import {XDSVStack} from '@xds/core/Layout';
import {XDSText, XDSHeading} from '@xds/core/Text';
import {XDSTextInput} from '@xds/core/TextInput';
import {XDSButton} from '@xds/core/Button';
import {XDSCheckboxInput} from '@xds/core/CheckboxInput';
import {XDSLink} from '@xds/core/Link';

const styles = stylex.create({
  page: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    minHeight: '100vh',
  },
  brandPanel: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    padding: 48,
    backgroundColor: 'var(--color-action-primary, #0066ff)',
    color: '#fff',
  },
  brandLogo: {display: 'flex', alignItems: 'center', gap: 12},
  logoMark: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.2)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 20,
    fontWeight: 700,
  },
  brandTitle: {
    fontSize: 40,
    fontWeight: 700,
    lineHeight: 1.2,
    color: '#fff',
    marginBottom: 16,
  },
  brandSub: {fontSize: 18, lineHeight: 1.5, opacity: 0.85, color: '#fff'},
  brandFooter: {opacity: 0.6, fontSize: 14, color: '#fff'},
  formPanel: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 48,
    backgroundColor: 'var(--color-surface-default, #fff)',
  },
  formContainer: {width: '100%', maxWidth: 400},
  dividerRow: {display: 'flex', alignItems: 'center', gap: 16},
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: 'var(--color-border, #e0e0e0)',
  },
  row: {display: 'flex', justifyContent: 'space-between', alignItems: 'center'},
});

export default function LoginTemplate() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(false);

  return (
    <div {...stylex.props(styles.page)}>
      <div {...stylex.props(styles.brandPanel)}>
        <div {...stylex.props(styles.brandLogo)}>
          <div {...stylex.props(styles.logoMark)}>A</div>
          <span style={{fontSize: 18, fontWeight: 600, color: '#fff'}}>
            Acme
          </span>
        </div>
        <div style={{maxWidth: 480}}>
          <div {...stylex.props(styles.brandTitle)}>
            Build better products, faster.
          </div>
          <div {...stylex.props(styles.brandSub)}>
            Streamline your workflow with our all-in-one platform. Trusted by
            10,000+ teams worldwide.
          </div>
        </div>
        <div {...stylex.props(styles.brandFooter)}>
          &copy; 2026 Acme Inc. All rights reserved.
        </div>
      </div>

      <div {...stylex.props(styles.formPanel)}>
        <div {...stylex.props(styles.formContainer)}>
          <XDSVStack gap={6}>
            <XDSVStack gap={2}>
              <XDSHeading level={1}>Welcome back</XDSHeading>
              <XDSText type="body" color="secondary">
                Enter your credentials to access your account
              </XDSText>
            </XDSVStack>

            <XDSVStack gap={3}>
              <XDSButton
                label="Continue with Google"
                variant="secondary"
                size="md"
              />
              <XDSButton
                label="Continue with GitHub"
                variant="secondary"
                size="md"
              />
            </XDSVStack>

            <div {...stylex.props(styles.dividerRow)}>
              <div {...stylex.props(styles.dividerLine)} />
              <XDSText type="supporting" color="secondary">
                or continue with email
              </XDSText>
              <div {...stylex.props(styles.dividerLine)} />
            </div>

            <XDSVStack gap={4}>
              <XDSTextInput
                label="Email"
                placeholder="name@company.com"
                value={email}
                onChange={setEmail}
              />
              <XDSTextInput
                label="Password"
                placeholder="Enter your password"
                value={password}
                onChange={setPassword}
                type="password"
              />
            </XDSVStack>

            <div {...stylex.props(styles.row)}>
              <XDSCheckboxInput
                label="Remember me"
                value={remember}
                onChange={setRemember}
              />
              <XDSLink label="Forgot password" href="#">
                Forgot password?
              </XDSLink>
            </div>

            <XDSButton label="Sign in" variant="primary" size="md" />

            <XDSText type="supporting" color="secondary">
              Don&apos;t have an account?{' '}
              <XDSLink label="Sign up" href="#">
                Sign up
              </XDSLink>
            </XDSText>
          </XDSVStack>
        </div>
      </div>
    </div>
  );
}
