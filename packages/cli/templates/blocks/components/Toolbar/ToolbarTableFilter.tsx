// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {Toolbar} from '@astryxdesign/core/Toolbar';
import {Button} from '@astryxdesign/core/Button';
import {Icon} from '@astryxdesign/core/Icon';
import {TextInput} from '@astryxdesign/core/TextInput';
import {MoreMenu} from '@astryxdesign/core/MoreMenu';
import {Stack} from '@astryxdesign/core/Layout';
import {Table} from '@astryxdesign/core/Table';
import {
  MagnifyingGlassIcon,
  ChevronDownIcon,
} from '@heroicons/react/24/outline';

export default function ToolbarTableFilter() {
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
              value=""
              onChange={() => {}}
              startIcon={MagnifyingGlassIcon}
            />
            <Button
              label="Status"
              variant="secondary"
              endContent={<Icon icon={ChevronDownIcon} />}
            />
            <Button
              label="Priority"
              variant="secondary"
              endContent={<Icon icon={ChevronDownIcon} />}
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
