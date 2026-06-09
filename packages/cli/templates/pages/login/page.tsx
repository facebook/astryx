// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {useState} from 'react';
import {XDSVStack} from '@xds/core/Layout';
import {XDSCenter} from '@xds/core/Center';
import {XDSText, XDSHeading} from '@xds/core/Text';
import {XDSTextInput} from '@xds/core/TextInput';
import {XDSButton} from '@xds/core/Button';
import {XDSCard} from '@xds/core/Card';
import {XDSIcon} from '@xds/core/Icon';
import {XDSBanner} from '@xds/core/Banner';
import {CubeIcon} from '@heroicons/react/24/outline';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSignIn = () => {
    setError('');
    if (!email || !password) {
      setError('Please enter both email and password.');
      return;
    }
    setIsLoading(true);
    setTimeout(() => setIsLoading(false), 2000);
  };

  return (
    <XDSCenter axis="both" height="100dvh">
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
          <XDSVStack gap={4} hAlign="stretch">
            <XDSVStack gap={1} hAlign="center">
              <XDSHeading level={2}>Sign in</XDSHeading>
              <XDSText type="body" color="secondary" size="sm">
                Enter your credentials to continue
              </XDSText>
            </XDSVStack>

            {error && (
              <XDSBanner status="error" title={error} container="card" />
            )}

            <XDSTextInput
              label="Email"
              value={email}
              onChange={setEmail}
              placeholder="you@example.com"
              type="email"
              size="lg"
            />

            <XDSTextInput
              label="Password"
              value={password}
              onChange={setPassword}
              placeholder="Enter your password"
              type="password"
              size="lg"
            />

            <XDSButton
              label="Sign in"
              variant="primary"
              size="lg"
              isLoading={isLoading}
              onClick={handleSignIn}
            />
          </XDSVStack>
        </XDSCard>
      </XDSVStack>
    </XDSCenter>
  );
}
