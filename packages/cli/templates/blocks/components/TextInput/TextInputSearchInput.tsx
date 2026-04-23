'use client';

import {useState} from 'react';
import {XDSTextInput} from '@xds/core/TextInput';
import {XDSStack} from '@xds/core/Layout';
import {MagnifyingGlassIcon} from '@heroicons/react/24/outline';

export default function TextInputSearchInput() {
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState('design systems');

  return (
    <div style={{width: 300}}>
      <XDSStack direction="vertical" gap={3}>
        <XDSTextInput
          label="Search"
          isLabelHidden
          value={query}
          onChange={setQuery}
          placeholder="Search projects…"
          startIcon={MagnifyingGlassIcon}
          hasClear
        />
        <XDSTextInput
          label="Filter results"
          isLabelHidden
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
