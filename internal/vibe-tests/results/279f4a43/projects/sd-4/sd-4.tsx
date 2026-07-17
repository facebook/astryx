// Copyright (c) Meta Platforms, Inc. and affiliates.

import {useState} from 'react';
import {Button} from '../components/ui/button';
import {Checkbox} from '../components/ui/checkbox';
import {Label} from '../components/ui/label';
import {ScrollArea} from '../components/ui/scroll-area';

const termsText = `These Terms of Service govern your use of our platform. By accessing or using the service, you agree to be bound by these terms.

1. Account Registration: You must provide accurate information.
2. Acceptable Use: You agree not to misuse the service.
3. Privacy: Your use is subject to our Privacy Policy.
4. Termination: We may suspend access at any time.
5. Limitation of Liability: Provided "as is" without warranties.`;

export default function TermsAcceptance() {
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [privacyAccepted, setPrivacyAccepted] = useState(false);

  return (
    <div className="max-w-xl mx-auto p-6 space-y-6">
      <h2 className="text-2xl font-bold">Terms and Conditions</h2>
      <p className="text-sm text-muted-foreground">Please read and accept the following to continue.</p>

      <ScrollArea className="h-48 border rounded-lg p-4">
        <p className="text-sm">{termsText}</p>
      </ScrollArea>

      <div className="space-y-3">
        <div className="flex items-center space-x-2">
          <Checkbox id="terms" checked={termsAccepted} onCheckedChange={(c) => setTermsAccepted(c === true)} />
          <Label htmlFor="terms">I agree to the Terms of Service</Label>
        </div>
        <div className="flex items-center space-x-2">
          <Checkbox id="privacy" checked={privacyAccepted} onCheckedChange={(c) => setPrivacyAccepted(c === true)} />
          <Label htmlFor="privacy">I agree to the Privacy Policy</Label>
        </div>
      </div>

      <Button disabled={!termsAccepted || !privacyAccepted}>Continue</Button>
    </div>
  );
}
