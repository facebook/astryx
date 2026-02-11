'use client';

import {useState} from 'react';
import * as stylex from '@stylexjs/stylex';
import {XDSLayout, XDSLayoutContent} from '@xds/core';
import {XDSText} from '@xds/core';
import {XDSTextInput} from '@xds/core';
import {XDSButton} from '@xds/core';
import {XDSVStack} from '@xds/core';

const styles = stylex.create({
  container: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100vh',
  },
  card: {
    width: '100%',
    maxWidth: '400px',
    padding: 'var(--spacing-7)',
    backgroundColor: 'var(--color-surface)',
    borderRadius: 'var(--radius-container)',
    boxShadow: 'var(--elevation-menu)',
  },
});

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle login
  };

  return (
    <XDSLayout>
      <XDSLayoutContent xstyle={styles.container}>
        <form onSubmit={handleSubmit}>
          <div {...stylex.props(styles.card)}>
            <XDSVStack gap="space5">
              <XDSText type="large" weight="semibold">
                Sign in
              </XDSText>

              <XDSTextInput
                label="Email"
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@example.com"
              />

              <XDSTextInput
                label="Password"
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Enter your password"
              />

              <XDSButton variant="primary" type="submit">
                Sign in
              </XDSButton>
            </XDSVStack>
          </div>
        </form>
      </XDSLayoutContent>
    </XDSLayout>
  );
}
