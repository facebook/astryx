'use client';

import {useState} from 'react';
import {XDSAvatar} from '@xds/core/Avatar';
import {XDSTypeahead, XDSTypeaheadItem} from '@xds/core/Typeahead';
import type {XDSSearchableItem, XDSSearchSource} from '@xds/core/Typeahead';

type UserItem = XDSSearchableItem<{avatar: string; role: string}>;

const userSource: XDSSearchSource<UserItem> = {
  search: (query: string) =>
    (
      [
        {
          id: 'alice',
          label: 'Alice',
          auxiliaryData: {avatar: '/alice.png', role: 'Admin'},
        },
      ] satisfies UserItem[]
    ).filter((u) => u.label.toLowerCase().includes(query.toLowerCase())),
  bootstrap: () => [
    {
      id: 'alice',
      label: 'Alice',
      auxiliaryData: {avatar: '/alice.png', role: 'Admin'},
    },
  ],
};

export default function TypeaheadWithCustomItemRendering() {
  const [assignee, setAssignee] = useState<UserItem | null>(null);

  return (
    <XDSTypeahead
      label="Assignee"
      searchSource={userSource}
      value={assignee}
      onChange={setAssignee}
      placeholder="Search users..."
      hasEntriesOnFocus
      renderItem={(item: UserItem) => (
        <XDSTypeaheadItem
          item={item}
          icon={
            <XDSAvatar src={item.auxiliaryData?.avatar} size="small" />
          }
          description={item.auxiliaryData?.role}
        />
      )}
    />
  );
}
