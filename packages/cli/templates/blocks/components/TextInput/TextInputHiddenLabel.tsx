'use client';

import {useState} from 'react';
import {XDSTextInput} from '@xds/core/TextInput';

export default function TextInputHiddenLabel() {
  const [query, setQuery] = useState('');

  return (
    <XDSTextInput label="Search" isLabelHidden value={query} onChange={setQuery} placeholder="Search..." />
  );
}
