'use client';

import {useState} from 'react';
import {XDSLayout, XDSLayoutContent} from '@xds/core';
import {XDSText} from '@xds/core';
import {XDSTextInput} from '@xds/core';
import {XDSButton} from '@xds/core';
import {XDSCard} from '@xds/core';
import {XDSCenter} from '@xds/core';
import {XDSFormLayout} from '@xds/core';

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
          <XDSCenter width="100%" height="100vh">
            <form onSubmit={handleSubmit}>
              <XDSCard maxWidth={400} width="100%">
                <XDSFormLayout>
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
                </XDSFormLayout>
              </XDSCard>
            </form>
          </XDSCenter>
        </XDSLayoutContent>
      }
    />
  );
}
