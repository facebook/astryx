// Copyright (c) Meta Platforms, Inc. and affiliates.

import {useState} from 'react';
import {Button} from '@/components/ui/button';
import {Card, CardContent, CardHeader, CardTitle} from '@/components/ui/card';
import {Checkbox} from '@/components/ui/checkbox';
import {Label} from '@/components/ui/label';
import {ScrollArea} from '@/components/ui/scroll-area';

export default function TermsForm() {
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [agreePrivacy, setAgreePrivacy] = useState(false);

  return (
    <Card className="max-w-lg">
      <CardHeader>
        <CardTitle>Terms and Conditions</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <ScrollArea className="h-48 rounded border p-4">
          <div className="space-y-4 text-sm">
            <p><strong>1. Acceptance of Terms</strong></p>
            <p>By accessing this service you agree to be bound by these terms.</p>
            <p><strong>2. Use of Service</strong></p>
            <p>You may use this service only for lawful purposes.</p>
            <p><strong>3. Privacy</strong></p>
            <p>Your use of the service is subject to our Privacy Policy.</p>
            <p><strong>4. Termination</strong></p>
            <p>We may terminate your access at any time for violation of these terms.</p>
            <p><strong>5. Limitation of Liability</strong></p>
            <p>The service is provided as-is without warranties of any kind.</p>
          </div>
        </ScrollArea>
        <div className="space-y-3">
          <div className="flex items-center space-x-2">
            <Checkbox id="terms" checked={agreeTerms} onCheckedChange={setAgreeTerms} />
            <Label htmlFor="terms">I agree to the Terms and Conditions</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox id="privacy" checked={agreePrivacy} onCheckedChange={setAgreePrivacy} />
            <Label htmlFor="privacy">I agree to the Privacy Policy</Label>
          </div>
        </div>
        <div className="flex gap-2 justify-end">
          <Button variant="outline">Decline</Button>
          <Button disabled={!agreeTerms || !agreePrivacy}>Accept</Button>
        </div>
      </CardContent>
    </Card>
  );
}
