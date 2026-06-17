// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {useState} from 'react';
import {Selector} from '@xds/core/Selector';
import {VStack} from '@xds/core/Layout';

export default function SelectorWithStatus() {
  const [value1, setValue1] = useState<string | undefined>();
  const [value2, setValue2] = useState<string | undefined>('viewer');
  const [value3, setValue3] = useState<string | undefined>('admin');
  return (
    <div style={{width: 300}}>
      <VStack gap={6}>
        <Selector
          label="Role"
          options={[
            {value: 'admin', label: 'Admin'},
            {value: 'editor', label: 'Editor'},
            {value: 'viewer', label: 'Viewer'},
          ]}
          value={value1}
          onChange={setValue1}
          placeholder="Choose a role..."
          status={{type: 'error', message: 'Please select a role'}}
        />
        <Selector
          label="Role"
          options={[
            {value: 'admin', label: 'Admin'},
            {value: 'editor', label: 'Editor'},
            {value: 'viewer', label: 'Viewer'},
          ]}
          value={value2}
          onChange={setValue2}
          status={{type: 'warning', message: 'Viewer has limited access'}}
        />
        <Selector
          label="Role"
          options={[
            {value: 'admin', label: 'Admin'},
            {value: 'editor', label: 'Editor'},
            {value: 'viewer', label: 'Viewer'},
          ]}
          value={value3}
          onChange={setValue3}
          status={{type: 'success'}}
        />
      </VStack>
    </div>
  );
}
