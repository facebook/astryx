// Copyright (c) Meta Platforms, Inc. and affiliates.

import {useState} from 'react';
import {VStack} from '@astryxdesign/core/Stack';
import {HStack} from '@astryxdesign/core/Stack';
import {Button} from '@astryxdesign/core/Button';
import {Heading} from '@astryxdesign/core/Heading';
import {Text} from '@astryxdesign/core/Text';
import {TextInput} from '@astryxdesign/core/TextInput';
import {CheckboxInput} from '@astryxdesign/core/CheckboxInput';
import {Stepper} from '@astryxdesign/core/Stepper';
import {Card} from '@astryxdesign/core/Card';

export default function OnboardingFlow() {
  const [step, setStep] = useState(0);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [darkMode, setDarkMode] = useState(false);
  const [notifications, setNotifications] = useState(true);

  const next = () => setStep(s => s + 1);
  const back = () => setStep(s => s - 1);

  return (
    <VStack gap={4}>
      <Card>
        <VStack gap={4}>
          {step === 0 && (
            <VStack gap={3}>
              <Heading level={2}>Welcome</Heading>
              <Text>Thanks for joining. Let us get you set up in a few steps.</Text>
              <Button label="Get Started" variant="primary" onClick={next} />
            </VStack>
          )}
          {step === 1 && (
            <VStack gap={3}>
              <Heading level={2}>Profile Setup</Heading>
              <TextInput label="Name" value={name} onChange={setName} />
              <TextInput label="Email" value={email} onChange={setEmail} type="email" />
              <HStack gap={2}>
                <Button label="Back" variant="secondary" onClick={back} />
                <Button label="Next" variant="primary" onClick={next} />
              </HStack>
            </VStack>
          )}
          {step === 2 && (
            <VStack gap={3}>
              <Heading level={2}>Preferences</Heading>
              <CheckboxInput label="Enable dark mode" value={darkMode} onChange={setDarkMode} />
              <CheckboxInput label="Email notifications" value={notifications} onChange={setNotifications} />
              <HStack gap={2}>
                <Button label="Back" variant="secondary" onClick={back} />
                <Button label="Next" variant="primary" onClick={next} />
              </HStack>
            </VStack>
          )}
          {step === 3 && (
            <VStack gap={3}>
              <Heading level={2}>All Done</Heading>
              <Text>Your account is set up and ready to use.</Text>
              <Button label="Go to Dashboard" variant="primary" onClick={() => {}} />
            </VStack>
          )}
        </VStack>
      </Card>
    </VStack>
  );
}
