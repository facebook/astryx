'use client';

import {useState} from 'react';
import {XDSAvatar} from '@xds/core/Avatar';
import {XDSTypeahead, XDSTypeaheadItem} from '@xds/core/Typeahead';

// @ts-expect-error migrated example
// @ts-expect-error migrated example
const userSource = {
  search: (query: string) => [{label: 'Alice', value: 'alice', auxiliaryData: {avatar: '/alice.png', role: 'Admin'}}].filter(u => u.label.toLowerCase().includes(query.toLowerCase())),
  bootstrap: () => [{label: 'Alice', value: 'alice', auxiliaryData: {avatar: '/alice.png', role: 'Admin'}}],
};

export default function TypeaheadWithCustomItemRendering() {
  const [assignee, setAssignee] = useState(null);

  return (
    // @ts-expect-error migrated example
    // @ts-expect-error migrated example
    <XDSTypeahead
      label="Assignee"
      // @ts-expect-error migrated example
      searchSource={userSource}
      value={assignee}
      // @ts-expect-error migrated example
      onChange={setAssignee}
      placeholder="Search users..."
      hasEntriesOnFocus
      renderItem={(item) => (
        <XDSTypeaheadItem
          item={item}
          // @ts-expect-error migrated example
          icon={<XDSAvatar src={item.auxiliaryData.avatar} size="sm" />}
          // @ts-expect-error migrated example
          description={item.auxiliaryData.role}
        />
      )}
    />
  );
}
