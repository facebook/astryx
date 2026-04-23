'use client';

import {useState} from 'react';
import {XDSField} from '@xds/core/Field';
import {XDSTextInput} from '@xds/core/TextInput';
import {XDSStack} from '@xds/core/Layout';
import * as stylex from '@stylexjs/stylex';

const styles = stylex.create({
  root: {
    width: 320,
  },
});

export default function FieldShowcase() {
  const [email, setEmail] = useState('');

  const status =
    email.length > 0 && !email.includes('@')
      ? {type: 'error' as const, message: 'Enter a valid email address.'}
      : undefined;

  return (
    <XDSStack direction="vertical" gap={3} xstyle={styles.root}>
      <XDSField
        label="Email"
        inputID="field-email"
        description="We will never share your email."
        isRequired
        status={status}>
        <XDSTextInput
          label="Email"
          isLabelHidden
          value={email}
          onChange={setEmail}
          placeholder="you@example.com"
        />
      </XDSField>
    </XDSStack>
  );
}
