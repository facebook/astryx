'use client';

import {useState} from 'react';
import {XDSAvatar} from '@xds/core/Avatar';
import {XDSTypeahead, XDSTypeaheadItem} from '@xds/core/Typeahead';

export default function TypeaheadWithCustomItemRendering() {
  const [assignee, setAssignee] = useState(null);

  return (
    <XDSTypeahead
      label="Assignee"
      searchSource={userSource}
      value={assignee}
      onChange={setAssignee}
      placeholder="Search users..."
      hasEntriesOnFocus
      renderItem={(item) => (
        <XDSTypeaheadItem
          item={item}
          icon={<XDSAvatar src={item.auxiliaryData.avatar} size="sm" />}
          description={item.auxiliaryData.role}
        />
      )}
    />
  );
}
