// Copyright (c) Meta Platforms, Inc. and affiliates.

import {Card} from '@astryxdesign/core/Card';
import {Button} from '@astryxdesign/core/Button';
import {TextInput} from '@astryxdesign/core/TextInput';
import {Heading} from '@astryxdesign/core/Heading';
import {Text} from '@astryxdesign/core/Text';
import {VStack} from '@astryxdesign/core/VStack';
import {HStack} from '@astryxdesign/core/HStack';
import {useState} from 'react';

type Step = 'welcome' | 'profile' | 'preferences' | 'done';

export default function OnboardingFlow() {
  const [step, setStep] = useState<Step>('welcome');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');

  return (
    <Card width={480} padding={5}>
      {step === 'welcome' && (
        <VStack gap={4}>
          <Heading level={2}>Welcome!</Heading>
          <Text>Let us get you set up in just a few steps.</Text>
          <Button label="Get Started" variant="primary" onClick={() => setStep('profile')} />
        </VStack>
      )}
      {step === 'profile' && (
        <VStack gap={4}>
          <Heading level={2}>Profile Setup</Heading>
          <TextInput label="Name" value={name} onChange={setName} />
          <TextInput label="Email" value={email} onChange={setEmail} type="email" />
          <HStack gap={2}>
            <Button label="Back" variant="ghost" onClick={() => setStep('welcome')} />
            <Button label="Next" variant="primary" onClick={() => setStep('preferences')} />
          </HStack>
        </VStack>
      )}
      {step === 'preferences' && (
        <VStack gap={4}>
          <Heading level={2}>Preferences</Heading>
          <Text>Choose your notification preferences and display settings.</Text>
          <HStack gap={2}>
            <Button label="Back" variant="ghost" onClick={() => setStep('profile')} />
            <Button label="Finish" variant="primary" onClick={() => setStep('done')} />
          </HStack>
        </VStack>
      )}
      {step === 'done' && (
        <VStack gap={4}>
          <Heading level={2}>All Done!</Heading>
          <Text>Your account is ready. Start exploring.</Text>
          <Button label="Go to Dashboard" variant="primary" />
        </VStack>
      )}
    </Card>
  );
}
