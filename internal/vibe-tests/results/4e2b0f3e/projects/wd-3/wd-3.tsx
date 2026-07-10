// Copyright (c) Meta Platforms, Inc. and affiliates.

import {Card} from '@astryxdesign/core/Card';
import {Button} from '@astryxdesign/core/Button';
import {TextInput} from '@astryxdesign/core/TextInput';
import {Heading} from '@astryxdesign/core/Heading';
import {Text} from '@astryxdesign/core/Text';
import {useState} from 'react';

type Step = 'welcome' | 'profile' | 'preferences' | 'done';

export default function OnboardingFlow() {
  const [step, setStep] = useState<Step>('welcome');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');

  return (
    <div className="flex items-center justify-center min-h-screen bg-surface">
      <Card width={480} padding={5}>
        {step === 'welcome' && (
          <div className="flex flex-col gap-4">
            <Heading level={2}>Welcome!</Heading>
            <Text>Let us get you set up in just a few steps.</Text>
            <Button label="Get Started" variant="primary" onClick={() => setStep('profile')} />
          </div>
        )}
        {step === 'profile' && (
          <div className="flex flex-col gap-4">
            <Heading level={2}>Profile Setup</Heading>
            <TextInput label="Name" value={name} onChange={setName} />
            <TextInput label="Email" value={email} onChange={setEmail} type="email" />
            <div className="flex gap-2">
              <Button label="Back" variant="ghost" onClick={() => setStep('welcome')} />
              <Button label="Next" variant="primary" onClick={() => setStep('preferences')} />
            </div>
          </div>
        )}
        {step === 'preferences' && (
          <div className="flex flex-col gap-4">
            <Heading level={2}>Preferences</Heading>
            <Text>Choose your notification preferences and display settings.</Text>
            <div className="flex gap-2">
              <Button label="Back" variant="ghost" onClick={() => setStep('profile')} />
              <Button label="Finish" variant="primary" onClick={() => setStep('done')} />
            </div>
          </div>
        )}
        {step === 'done' && (
          <div className="flex flex-col gap-4">
            <Heading level={2}>All Done!</Heading>
            <Text>Your account is ready. Start exploring.</Text>
            <Button label="Go to Dashboard" variant="primary" />
          </div>
        )}
      </Card>
    </div>
  );
}
