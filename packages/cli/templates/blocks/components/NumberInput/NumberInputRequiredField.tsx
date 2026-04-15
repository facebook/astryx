'use client';

import {useState} from 'react';
import {XDSNumberInput} from '@xds/core/NumberInput';

export default function NumberInputRequiredField() {
  const [amount, setAmount] = useState<number | null>(null);

  return (
    <XDSNumberInput
      label="Amount"
      isRequired
      value={amount}
      onChange={setAmount}
    />
  );
}
