// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {useState} from 'react';
import {Field} from '@astryxdesign/core/Field';
import {TextInput} from '@astryxdesign/core/TextInput';
import {Stack} from '@astryxdesign/core/Layout';
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
    <Stack direction="vertical" gap={3} xstyle={styles.root}>
      <Field
        label="Email"
        inputID="field-email"
        description="We will never share your email."
        isRequired
        status={status}>
        <TextInput
          label="Email"
          isLabelHidden
          value={email}
          onChange={setEmail}
          placeholder="you@example.com"
        />
      </Field>
    </Stack>
  );
}
