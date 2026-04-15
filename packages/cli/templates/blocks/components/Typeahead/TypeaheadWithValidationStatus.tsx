'use client';

import {useState} from 'react';
import {XDSTypeahead} from '@xds/core/Typeahead';

export default function TypeaheadWithValidationStatus() {
  const [manager, setManager] = useState(null);

  return (
    <XDSTypeahead
      label="Manager"
      searchSource={managerSource}
      value={manager}
      onChange={setManager}
      isRequired
      status={{ type: 'error', message: 'A manager is required' }}
    />
  );
}
