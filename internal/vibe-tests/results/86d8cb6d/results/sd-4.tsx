// Copyright (c) Meta Platforms, Inc. and affiliates.

import { Card } from '@astryxdesign/core/Card';
import { Button } from '@astryxdesign/core/Button';
import { Text } from '@astryxdesign/core/Text';
import { Stack } from '@astryxdesign/core/Stack';
import { CheckboxInput } from '@astryxdesign/core/CheckboxInput';
import { useState } from 'react';

const termsText = `Terms and Conditions

1. Acceptance of Terms
By accessing or using our service, you agree to be bound by these terms.

2. Use of Service
You may use the service only for lawful purposes and in accordance with these terms.

3. Privacy
Your use of the service is also governed by our Privacy Policy.

4. Intellectual Property
All content and materials available on the service are our property.

5. Limitation of Liability
In no event shall we be liable for any indirect, incidental, special, or consequential damages.

6. Governing Law
These terms shall be governed by and construed in accordance with applicable law.

7. Changes to Terms
We reserve the right to modify these terms at any time.`;

export default function TermsAcceptanceForm() {
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [agreePrivacy, setAgreePrivacy] = useState(false);

  return (
    <Card padding={4}>
      <Stack gap={3}>
        <Text type="label" weight="semibold">Terms and Conditions</Text>
        <div style={{ maxHeight: 200, overflow: 'auto', border: '1px solid var(--border-default)', borderRadius: 8, padding: 16 }}>
          <Text type="body" style={{ whiteSpace: 'pre-wrap' }}>{termsText}</Text>
        </div>
        <Stack gap={2}>
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
        </Stack>
        <Button
          variant="primary"
          disabled={!agreeTerms || !agreePrivacy}
        >
          Accept and Continue
        </Button>
      </Stack>
    </Card>
  );
}
