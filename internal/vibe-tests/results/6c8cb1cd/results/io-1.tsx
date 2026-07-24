// Copyright (c) Meta Platforms, Inc. and affiliates.

import {useState, useCallback} from 'react';
import {Stack} from '@astryxdesign/core/Stack';
import {TextInput} from '@astryxdesign/core/TextInput';
import {Button} from '@astryxdesign/core/Button';
import {Text, Heading} from '@astryxdesign/core/Text';
import {Banner} from '@astryxdesign/core/Banner';

function validateEmail(email: string): string | null {
  if (!email) {return 'Email is required';}
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {return 'Please enter a valid email address';}
  return null;
}

export function SubscribeForm() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = useCallback(async () => {
    const validationError = validateEmail(email);
    if (validationError) {
      setError(validationError);
      return;
    }
    setError(null);
    setIsLoading(true);
    try {
      const response = await fetch('/api/subscribe', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({email}),
      });
      if (!response.ok) {throw new Error('Subscription failed');}
      setSuccess(true);
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [email]);

  if (success) {
    return (
      <Banner variant="success" title="Subscribed!">
        You have been subscribed with {email}.
      </Banner>
    );
  }

  return (
    <Stack gap={4} padding={4}>
      <Heading level={2}>Subscribe to updates</Heading>
      <TextInput
        label="Email address"
        value={email}
        onChange={setEmail}
        status={error ? {type: 'error', message: error} : undefined}
        placeholder="you@example.com"
      />
      <Button label="Subscribe" variant="primary" isLoading={isLoading} onClick={handleSubmit} />
    </Stack>
  );
}

export default SubscribeForm;
