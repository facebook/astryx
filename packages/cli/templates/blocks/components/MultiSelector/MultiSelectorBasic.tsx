'use client';

import {useState} from 'react';
import {XDSMultiSelector} from '@xds/core/MultiSelector';

export default function MultiSelectorBasic() {
  const [selected, setSelected] = useState<string[]>([]);

  return (
    <XDSMultiSelector
      label="Columns"
      options={['Name', 'Email', 'Role', 'Status']}
      value={selected}
      onChange={setSelected}
    />
  );
}
