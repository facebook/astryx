// Copyright (c) Meta Platforms, Inc. and affiliates.

import {useState} from 'react';
import {Button} from '@/components/ui/button';
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from '@/components/ui/card';
import {Input} from '@/components/ui/input';
import {Label} from '@/components/ui/label';
import {Checkbox} from '@/components/ui/checkbox';

export default function OnboardingFlow() {
  const [step, setStep] = useState(0);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');

  const next = () => setStep(s => s + 1);
  const back = () => setStep(s => s - 1);

  return (
    <div className="max-w-lg mx-auto">
      <Card>
        {step === 0 && (
          <>
            <CardHeader>
              <CardTitle>Welcome</CardTitle>
              <CardDescription>Thanks for joining. Let us get you set up in a few steps.</CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={next}>Get Started</Button>
            </CardContent>
          </>
        )}
        {step === 1 && (
          <>
            <CardHeader>
              <CardTitle>Profile Setup</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input id="name" value={name} onChange={e => setName(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} />
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={back}>Back</Button>
                <Button onClick={next}>Next</Button>
              </div>
            </CardContent>
          </>
        )}
        {step === 2 && (
          <>
            <CardHeader>
              <CardTitle>Preferences</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2">
                <Checkbox id="dark" />
                <Label htmlFor="dark">Enable dark mode</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox id="notifs" defaultChecked />
                <Label htmlFor="notifs">Email notifications</Label>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={back}>Back</Button>
                <Button onClick={next}>Next</Button>
              </div>
            </CardContent>
          </>
        )}
        {step === 3 && (
          <>
            <CardHeader>
              <CardTitle>All Done</CardTitle>
              <CardDescription>Your account is set up and ready to use.</CardDescription>
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
