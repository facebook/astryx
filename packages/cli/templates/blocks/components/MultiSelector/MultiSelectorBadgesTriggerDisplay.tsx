'use client';

import {useState} from 'react';
import {XDSMultiSelector} from '@xds/core/MultiSelector';

export default function MultiSelectorBadgesTriggerDisplay() {
  const [selected, setSelected] = useState<string[]>([]);

  return (
    <XDSMultiSelector
      label="Filters"
      options={['Active', 'Inactive', 'Pending', 'Archived']}
      value={selected}
      onChange={setSelected}
      triggerDisplay="badges"
      maxBadges={2}
    />
  );
}
