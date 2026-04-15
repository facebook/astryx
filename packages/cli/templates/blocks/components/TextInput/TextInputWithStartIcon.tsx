'use client';

import {useState} from 'react';
import {XDSTextInput} from '@xds/core/TextInput';

function MagnifyingGlassIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="10" />
    </svg>
  );
}

export default function TextInputWithStartIcon() {
  const [query, setQuery] = useState('');

  return (
    <XDSTextInput
      label="Search"
      value={query}
      onChange={setQuery}
      startIcon={MagnifyingGlassIcon}
      placeholder="Search..."
    />
  );
}
