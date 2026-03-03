'use client';

import {useState} from 'react';
import * as stylex from '@stylexjs/stylex';
import {XDSLayout, XDSLayoutContent} from '@xds/core';
import {XDSText} from '@xds/core';
import {XDSTextInput} from '@xds/core';
import {XDSButton} from '@xds/core';
import {XDSStack} from '@xds/core';

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
    <XDSLayout
      content={
        <XDSLayoutContent>
          <div {...stylex.props(styles.container)}>
            <form onSubmit={handleSubmit}>
              <div {...stylex.props(styles.card)}>
                <XDSStack direction="vertical" gap="space5">
                  <XDSText type="large" weight="semibold">
                    Sign in
                  </XDSText>

                  <XDSTextInput
                    label="Email"
                    value={email}
                    onChange={setEmail}
                    placeholder="you@example.com"
                  />

                  <XDSTextInput
                    label="Password"
                    value={password}
                    onChange={setPassword}
                    placeholder="Enter your password"
                  />

                  <XDSButton label="Sign in" variant="primary" type="submit" />
                </XDSStack>
              </div>
            </form>
          </div>
        </XDSLayoutContent>
      }
    />
  );
}
