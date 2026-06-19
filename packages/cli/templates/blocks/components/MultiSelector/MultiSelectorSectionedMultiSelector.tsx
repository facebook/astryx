// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {useState} from 'react';
import {MultiSelector} from '@xds/core/MultiSelector';

export default function MultiSelectorSectionedMultiSelector() {
  const [value, setValue] = useState<string[]>([]);
  return (
    <div style={{width: 300}}>
      <MultiSelector
        label="Permissions"
        options={[
          {
            type: 'section',
            title: 'Read',
            options: [
              {value: 'read_posts', label: 'Read posts'},
              {value: 'read_comments', label: 'Read comments'},
              {value: 'read_users', label: 'Read users'},
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
        value={value}
        onChange={setValue}
        placeholder="Select permissions..."
      />
    </div>
  );
}
