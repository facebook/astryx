'use client';

import {useState} from 'react';
import {XDSMultiSelector} from '@xds/core/MultiSelector';

export default function MultiSelectorSections() {
  const [selected, setSelected] = useState<string[]>([]);

  return (
    <XDSMultiSelector
      label="Permissions"
      options={[
        {
          type: 'section',
          title: 'Read',
          options: [
            {value: 'read_posts', label: 'Read posts'},
            {value: 'read_comments', label: 'Read comments'},
          ],
        },
        {
          type: 'section',
          title: 'Write',
          options: [
            {value: 'write_posts', label: 'Write posts'},
            {value: 'write_comments', label: 'Write comments'},
          ],
        },
      ]}
      value={selected}
      onChange={setSelected}
    />
  );
}
