// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {useState} from 'react';
import {Toolbar} from '@astryxdesign/core/Toolbar';
import {Selector} from '@astryxdesign/core/Selector';
import {TextInput} from '@astryxdesign/core/TextInput';
import {MoreMenu} from '@astryxdesign/core/MoreMenu';
import {Stack} from '@astryxdesign/core/Layout';
import {Table} from '@astryxdesign/core/Table';
import {MagnifyingGlassIcon} from '@heroicons/react/24/outline';

export default function ToolbarTableFilter() {
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<string | null>(null);
  const [priority, setPriority] = useState<string | null>(null);

  return (
    <Stack direction="vertical" style={{width: '100%'}}>
      <Toolbar
        label="Table filters"
        size="sm"
        dividers={['bottom']}
        startContent={
          <>
            <TextInput
              label="Search"
              isLabelHidden
              placeholder="Search..."
              value={search}
              onChange={setSearch}
              startIcon={MagnifyingGlassIcon}
            />
            <Selector
              label="Status"
              isLabelHidden
              placeholder="Status"
              hasClear
              value={status}
              onChange={setStatus}
              options={['Open', 'In progress', 'Done']}
            />
            <Selector
              label="Priority"
              isLabelHidden
              placeholder="Priority"
              hasClear
              value={priority}
              onChange={setPriority}
              options={['High', 'Medium', 'Low']}
            />
          </>
        }
        endContent={
          <MoreMenu
            items={[
              {label: 'Compact view'},
              {label: 'Comfortable view'},
              {label: 'Export CSV'},
            ]}
          />
        }
      />
      <Table
        idKey="id"
        columns={[
          {key: 'task', header: 'Task'},
          {key: 'status', header: 'Status'},
          {key: 'priority', header: 'Priority'},
        ]}
        data={[
          {id: '1', task: 'Fix login bug', status: 'Open', priority: 'High'},
          {
            id: '2',
            task: 'Update docs',
            status: 'In progress',
            priority: 'Medium',
          },
          {id: '3', task: 'Add unit tests', status: 'Open', priority: 'Low'},
        ]}
      />
    </Stack>
  );
}
