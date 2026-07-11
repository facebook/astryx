// Copyright (c) Meta Platforms, Inc. and affiliates.

import { Button } from './components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './components/ui/card';
import { Checkbox } from './components/ui/checkbox';
import { Label } from './components/ui/label';
import { ScrollArea } from './components/ui/scroll-area';
import { useState } from 'react';

const termsText = `Terms and Conditions\n\n1. Acceptance of Terms\nBy accessing or using our service, you agree to be bound by these terms.\n\n2. Use of Service\nYou may use the service only for lawful purposes.\n\n3. Privacy\nYour use is governed by our Privacy Policy.\n\n4. Intellectual Property\nAll content is our property.\n\n5. Limitation of Liability\nWe are not liable for indirect damages.\n\n6. Governing Law\nThese terms are governed by applicable law.\n\n7. Changes\nWe may modify these terms at any time.`;

export default function TermsAcceptanceForm() {
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [agreePrivacy, setAgreePrivacy] = useState(false);

  return (
    <Card className="max-w-lg">
      <CardHeader>
        <CardTitle>Terms and Conditions</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <ScrollArea className="h-48 rounded-md border p-4">
          <p className="text-sm whitespace-pre-wrap">{termsText}</p>
        </ScrollArea>
        <div className="space-y-3">
          <div className="flex items-center space-x-2">
            <Checkbox id="terms" checked={agreeTerms} onCheckedChange={(v) => setAgreeTerms(!!v)} />
            <Label htmlFor="terms">I agree to the Terms and Conditions</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox id="privacy" checked={agreePrivacy} onCheckedChange={(v) => setAgreePrivacy(!!v)} />
            <Label htmlFor="privacy">I agree to the Privacy Policy</Label>
          </div>
        </div>
        <Button disabled={!agreeTerms || !agreePrivacy} className="w-full">Accept and Continue</Button>
      </CardContent>
    </Card>
  );
}
