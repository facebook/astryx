// Copyright (c) Meta Platforms, Inc. and affiliates.

import {useState} from 'react';
import {VStack} from '@astryxdesign/core/Stack';
import {Heading} from '@astryxdesign/core/Heading';
import {Text} from '@astryxdesign/core/Text';
import {CheckboxInput} from '@astryxdesign/core/CheckboxInput';
import {Button} from '@astryxdesign/core/Button';
import stylex from '@stylexjs/stylex';

const styles = stylex.create({
  termsBox: {
    maxHeight: 200,
    overflowY: 'auto',
    padding: 16,
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: 'var(--color-border)',
    borderRadius: 8,
  },
});

const termsText = `These Terms of Service govern your use of our platform. By accessing or using the service, you agree to be bound by these terms.

1. Account Registration: You must provide accurate information when creating an account.
2. Acceptable Use: You agree not to misuse the service or help anyone else do so.
3. Privacy: Your use of the service is subject to our Privacy Policy.
4. Termination: We may suspend or terminate your access at any time.
5. Limitation of Liability: The service is provided "as is" without warranties.
6. Changes: We reserve the right to modify these terms at any time.
7. Governing Law: These terms are governed by applicable law.`;

export default function TermsAcceptance() {
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [privacyAccepted, setPrivacyAccepted] = useState(false);

  const canContinue = termsAccepted && privacyAccepted;

  return (
    <VStack gap={4} maxWidth={600} padding={4}>
      <Heading level={2}>Terms and Conditions</Heading>
      <Text type="supporting">Please read and accept the following to continue.</Text>

      <div {...stylex.props(styles.termsBox)}>
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
        isDisabled={!canContinue}
      />
    </VStack>
  );
}
