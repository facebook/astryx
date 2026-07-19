// Copyright (c) Meta Platforms, Inc. and affiliates.

import {useState} from 'react';
import {Heading} from '@astryxdesign/core/Heading';
import {Text} from '@astryxdesign/core/Text';
import {Button} from '@astryxdesign/core/Button';
import {CheckboxInput} from '@astryxdesign/core/CheckboxInput';
import {Card} from '@astryxdesign/core/Card';

export default function TermsForm() {
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [agreePrivacy, setAgreePrivacy] = useState(false);

  const termsText = `1. Acceptance of Terms - By accessing this service you agree to be bound by these terms.\n\n2. Use of Service - You may use this service only for lawful purposes.\n\n3. Privacy - Your use of the service is subject to our Privacy Policy.\n\n4. Termination - We may terminate your access at any time for violation of these terms.\n\n5. Limitation of Liability - The service is provided as-is without warranties of any kind.`;

  return (
    <Card>
      <div className="flex flex-col gap-4 p-4">
        <Heading level={2}>Terms and Conditions</Heading>
        <div className="h-48 overflow-y-auto border rounded p-3 bg-gray-50">
          <Text>{termsText}</Text>
        </div>
        <div className="flex flex-col gap-2">
          <CheckboxInput label="I agree to the Terms and Conditions" value={agreeTerms} onChange={setAgreeTerms} />
          <CheckboxInput label="I agree to the Privacy Policy" value={agreePrivacy} onChange={setAgreePrivacy} />
        </div>
        <div className="flex gap-2 justify-end">
          <Button label="Decline" variant="secondary" onClick={() => {}} />
          <Button label="Accept" variant="primary" isDisabled={!agreeTerms || !agreePrivacy} onClick={() => {}} />
        </div>
      </div>
    </Card>
  );
}
