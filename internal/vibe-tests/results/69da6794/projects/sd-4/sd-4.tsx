// Copyright (c) Meta Platforms, Inc. and affiliates.

import {useState} from 'react';
import {VStack} from '@astryxdesign/core/Stack';
import {HStack} from '@astryxdesign/core/Stack';
import {Heading} from '@astryxdesign/core/Heading';
import {Text} from '@astryxdesign/core/Text';
import {Button} from '@astryxdesign/core/Button';
import {CheckboxInput} from '@astryxdesign/core/CheckboxInput';
import {Card} from '@astryxdesign/core/Card';
import {TextArea} from '@astryxdesign/core/TextArea';

export default function TermsForm() {
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [agreePrivacy, setAgreePrivacy] = useState(false);

  const termsText = `Terms and Conditions\n\n1. Acceptance of Terms\nBy accessing this service you agree to be bound by these terms.\n\n2. Use of Service\nYou may use this service only for lawful purposes.\n\n3. Privacy\nYour use of the service is subject to our Privacy Policy.\n\n4. Termination\nWe may terminate your access at any time for violation of these terms.\n\n5. Limitation of Liability\nThe service is provided as-is without warranties of any kind.`;

  return (
    <Card>
      <VStack gap={4}>
        <Heading level={2}>Terms and Conditions</Heading>
        <TextArea
          label="Terms"
          isLabelHidden
          value={termsText}
          onChange={() => {}}
          isDisabled
        />
        <VStack gap={2}>
          <CheckboxInput
            label="I agree to the Terms and Conditions"
            value={agreeTerms}
            onChange={setAgreeTerms}
          />
          <CheckboxInput
            label="I agree to the Privacy Policy"
            value={agreePrivacy}
            onChange={setAgreePrivacy}
          />
        </VStack>
        <HStack gap={2} justify="end">
          <Button label="Decline" variant="secondary" onClick={() => {}} />
          <Button
            label="Accept"
            variant="primary"
            isDisabled={!agreeTerms || !agreePrivacy}
            onClick={() => {}}
          />
        </HStack>
      </VStack>
    </Card>
  );
}
