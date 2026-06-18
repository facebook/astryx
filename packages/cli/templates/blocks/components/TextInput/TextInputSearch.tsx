// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {useState} from 'react';
import {TextInput} from '@xds/core/TextInput';
import {Stack} from '@xds/core/Layout';
import {MagnifyingGlassIcon} from '@heroicons/react/24/outline';

export default function TextInputSearch() {
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState('design systems');

  return (
    <div style={{width: 300}}>
      <Stack direction="vertical" gap={3}>
        <TextInput
          label="Search field"
          value={query}
          onChange={setQuery}
          placeholder="Search projects…"
          startIcon={MagnifyingGlassIcon}
          hasClear
        />
        <TextInput
          label="Search field with value"
          value={filter}
          onChange={setFilter}
          placeholder="Filter…"
          startIcon={MagnifyingGlassIcon}
          hasClear
        />
      </Stack>
    </div>
  );
}
