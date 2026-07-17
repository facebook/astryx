// Copyright (c) Meta Platforms, Inc. and affiliates.

import {useState} from 'react';
import {VStack} from '@astryxdesign/core/Stack';
import {Heading} from '@astryxdesign/core/Heading';
import {Text} from '@astryxdesign/core/Text';
import {CheckboxInput} from '@astryxdesign/core/CheckboxInput';
import {Button} from '@astryxdesign/core/Button';

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
    <div className="max-w-xl mx-auto p-6">
      <VStack gap={4}>
        <Heading level={2}>Terms and Conditions</Heading>
        <Text type="supporting">Please read and accept the following to continue.</Text>

        <div className="max-h-48 overflow-y-auto border rounded-lg p-4">
          <Text>{termsText}</Text>
        </div>

        <VStack gap={2}>
          <CheckboxInput
            label="I agree to the Terms of Service"
            value={termsAccepted}
            onChange={setTermsAccepted}
          />
          <CheckboxInput
            label="I agree to the Privacy Policy"
            value={privacyAccepted}
            onChange={setPrivacyAccepted}
          />
        </VStack>

        <Button
          label="Continue"
          variant="primary"
          isDisabled={!termsAccepted || !privacyAccepted}
        />
      </VStack>
    </div>
  );
}
