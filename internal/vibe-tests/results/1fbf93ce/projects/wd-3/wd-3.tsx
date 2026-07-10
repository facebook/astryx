// Copyright (c) Meta Platforms, Inc. and affiliates.

import {Card, CardContent, CardHeader, CardTitle, CardDescription} from '@/components/ui/card';
import {Button} from '@/components/ui/button';
import {Input} from '@/components/ui/input';
import {Label} from '@/components/ui/label';
import {useState} from 'react';

type Step = 'welcome' | 'profile' | 'preferences' | 'done';

export default function OnboardingFlow() {
  const [step, setStep] = useState<Step>('welcome');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');

  return (
    <div className="flex items-center justify-center min-h-screen p-4">
      <Card className="w-[480px]">
        {step === 'welcome' && (
          <>
            <CardHeader>
              <CardTitle>Welcome!</CardTitle>
              <CardDescription>Let us get you set up in a few steps.</CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={() => setStep('profile')}>Get Started</Button>
            </CardContent>
          </>
        )}
        {step === 'profile' && (
          <>
            <CardHeader>
              <CardTitle>Profile Setup</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input id="name" value={name} onChange={(e) => setName(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
              </div>
              <div className="flex gap-2">
                <Button variant="ghost" onClick={() => setStep('welcome')}>Back</Button>
                <Button onClick={() => setStep('preferences')}>Next</Button>
              </div>
            </CardContent>
          </>
        )}
        {step === 'preferences' && (
          <>
            <CardHeader>
              <CardTitle>Preferences</CardTitle>
              <CardDescription>Choose your notification preferences.</CardDescription>
            </CardHeader>
            <CardContent className="flex gap-2">
              <Button variant="ghost" onClick={() => setStep('profile')}>Back</Button>
              <Button onClick={() => setStep('done')}>Finish</Button>
            </CardContent>
          </>
        )}
        {step === 'done' && (
          <>
            <CardHeader>
              <CardTitle>All Done!</CardTitle>
              <CardDescription>Your account is ready.</CardDescription>
            </CardHeader>
            <CardContent>
              <Button>Go to Dashboard</Button>
            </CardContent>
          </>
        )}
      </Card>
    </div>
  );
}
