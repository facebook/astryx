'use client';

import {useState} from 'react';
import {XDSSelector, XDSSelectorItem} from '@xds/core/Selector';

function UserIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
    </svg>
  );
}

const users = [
  {value: 'alice', label: 'Alice', email: 'alice@example.com'},
  {value: 'bob', label: 'Bob', email: 'bob@example.com'},
];

export default function SelectorCustomRendering() {
  const [value, setValue] = useState('');

  return (
    // @ts-expect-error migrated example
    // @ts-expect-error migrated example
    <XDSSelector
      label="User"
      options={users}
      value={value}
      onChange={setValue}>
      {(user) => (
        <XDSSelectorItem
          icon={UserIcon}
          label={user.label}
          // @ts-expect-error migrated example
          description={user.email}
        />
      )}
    </XDSSelector>
  );
}
