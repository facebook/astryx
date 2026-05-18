// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {useState} from 'react';
import {XDSTextInput} from '@xds/core/TextInput';
import {XDSStack} from '@xds/core/Layout';
import {MagnifyingGlassIcon} from '@heroicons/react/24/outline';

export default function TextInputSearch() {
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState('design systems');

  return (
    <div style={{width: 300}}>
      <XDSStack direction="vertical" gap={3}>
        <XDSTextInput
          label="Search field"
          value={query}
          onChange={setQuery}
          placeholder="Search projects…"
          startIcon={MagnifyingGlassIcon}
          hasClear
        />
        <XDSTextInput
          label="Search field with value"
          value={filter}
          onChange={setFilter}
          placeholder="Filter…"
          startIcon={MagnifyingGlassIcon}
          hasClear
        />
      </XDSStack>
    </div>
  );
}
