'use client';

import {useState} from 'react';
import {XDSTextInput} from '@xds/core/TextInput';
import {XDSStack} from '@xds/core/Layout';
import {XDSText} from '@xds/core/Text';
import {MagnifyingGlassIcon} from '@heroicons/react/24/outline';

export default function TextInputSearchInput() {
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState('design systems');

  return (
    <XDSStack direction="vertical" gap={4}>
      <XDSStack direction="vertical" gap={1}>
        <XDSText type="supporting" color="secondary">
          Hidden label with icon and clear button
        </XDSText>
        <XDSTextInput
          label="Search"
          isLabelHidden
          value={query}
          onChange={setQuery}
          placeholder="Search projects…"
          startIcon={MagnifyingGlassIcon}
          hasClear
        />
      </XDSStack>
      <XDSStack direction="vertical" gap={1}>
        <XDSText type="supporting" color="secondary">
          With existing value
        </XDSText>
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
    </XDSStack>
  );
}
