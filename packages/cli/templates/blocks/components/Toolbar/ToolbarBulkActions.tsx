// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {useState} from 'react';
import {Toolbar} from '@xds/core/Toolbar';
import {Button} from '@xds/core/Button';
import {Icon} from '@xds/core/Icon';
import {Badge} from '@xds/core/Badge';
import {Table} from '@xds/core/Table';
import {useTableSelection, useTableSelectionState} from '@xds/core/Table';
import {Stack} from '@xds/core/Layout';
import {TrashIcon, ArchiveBoxIcon} from '@heroicons/react/24/outline';

const DATA = [
  {id: '1', name: 'Alex Johnson', status: 'Active', role: 'Admin'},
  {id: '2', name: 'Sam Rivera', status: 'Active', role: 'Editor'},
  {id: '3', name: 'Jordan Lee', status: 'Invited', role: 'Viewer'},
  {id: '4', name: 'Taylor Kim', status: 'Active', role: 'Editor'},
  {id: '5', name: 'Casey Park', status: 'Active', role: 'Viewer'},
];

export default function ToolbarBulkActions() {
  const [selectedKeys, setSelectedKeys] = useState<Set<string>>(
    () => new Set(['1', '3', '5']),
  );

  const {selectionConfig} = useTableSelectionState({
    data: DATA,
    idKey: 'id',
    selectedKeys,
    setSelectedKeys,
  });

  const selectionPlugin = useTableSelection(selectionConfig);

  return (
    <Stack direction="vertical">
      {selectedKeys.size > 0 && (
        <Toolbar
          label="Bulk actions"
          size="sm"
          variant="muted"
          dividers={['bottom']}
          startContent={
            <>
              <Badge label={`${selectedKeys.size} selected`} />
              <Button
                label="Delete"
                variant="ghost"
                icon={<Icon icon={TrashIcon} />}
                isIconOnly
              />
              <Button
                label="Archive"
                variant="ghost"
                icon={<Icon icon={ArchiveBoxIcon} />}
                isIconOnly
              />
            </>
          }
          endContent={
            <Button
              label="Deselect all"
              variant="ghost"
              onClick={() => setSelectedKeys(new Set())}
            />
          }
        />
      )}
      <Table
        idKey="id"
        columns={[
          {key: 'name', header: 'Name'},
          {key: 'status', header: 'Status'},
          {key: 'role', header: 'Role'},
        ]}
        data={DATA}
        plugins={{selection: selectionPlugin}}
      />
    </Stack>
  );
}
