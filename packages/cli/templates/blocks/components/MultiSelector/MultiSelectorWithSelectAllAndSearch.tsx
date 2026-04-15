'use client';

import {useState} from 'react';
import {XDSMultiSelector} from '@xds/core/MultiSelector';

export default function MultiSelectorWithSelectAllAndSearch() {
  const [selected, setSelected] = useState<string[]>([]);

  return (
    <XDSMultiSelector
      label="Columns"
      options={['Name', 'Email', 'Role', 'Status', 'Created']}
      value={selected}
      onChange={setSelected}
      hasSelectAll
      hasSearch
    />
  );
}

export const showcase = {
  aspectRatio: 4 / 3,
  render: MultiSelectorWithSelectAllAndSearch,
};
