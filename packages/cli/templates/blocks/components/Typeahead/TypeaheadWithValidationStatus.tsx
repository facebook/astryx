'use client';

import {useState} from 'react';
import {XDSTypeahead} from '@xds/core/Typeahead';

// @ts-expect-error migrated example
// @ts-expect-error migrated example
const managerSource = {
  search: (query: string) => [{label: 'Alice', value: 'alice'}].filter(u => u.label.toLowerCase().includes(query.toLowerCase())),
  bootstrap: () => [{label: 'Alice', value: 'alice'}],
};

export default function TypeaheadWithValidationStatus() {
  const [manager, setManager] = useState(null);

  return (
    // @ts-expect-error migrated example
    // @ts-expect-error migrated example
    <XDSTypeahead
      label="Manager"
      // @ts-expect-error migrated example
      searchSource={managerSource}
      value={manager}
      // @ts-expect-error migrated example
      onChange={setManager}
      isRequired
      status={{ type: 'error', message: 'A manager is required' }}
    />
  );
}
