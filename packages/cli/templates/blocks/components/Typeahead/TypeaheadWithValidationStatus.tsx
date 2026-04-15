'use client';

import {useState} from 'react';
import {XDSTypeahead} from '@xds/core/Typeahead';
import type {XDSSearchableItem, XDSSearchSource} from '@xds/core/Typeahead';

const managerSource: XDSSearchSource = {
  search: (query: string) =>
    (
      [{id: 'alice', label: 'Alice'}] satisfies XDSSearchableItem[]
    ).filter((u) => u.label.toLowerCase().includes(query.toLowerCase())),
  bootstrap: () => [{id: 'alice', label: 'Alice'}],
};

export default function TypeaheadWithValidationStatus() {
  const [manager, setManager] = useState<XDSSearchableItem | null>(null);

  return (
    <XDSTypeahead
      label="Manager"
      searchSource={managerSource}
      value={manager}
      onChange={setManager}
      isRequired
      status={{type: 'error', message: 'A manager is required'}}
    />
  );
}
