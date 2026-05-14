'use client';

import {useState} from 'react';
import {XDSToolbar} from '@xds/core/Toolbar';
import {XDSButton} from '@xds/core/Button';
import {XDSIcon} from '@xds/core/Icon';
import {XDSBadge} from '@xds/core/Badge';
import {XDSTable} from '@xds/core/Table';
import {useXDSTableSelection, useXDSTableSelectionState} from '@xds/core/Table';
import {XDSStack} from '@xds/core/Layout';
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

  const {selectionConfig} = useXDSTableSelectionState({
    data: DATA,
    idKey: 'id',
    selectedKeys,
    setSelectedKeys,
  });

  const selectionPlugin = useXDSTableSelection(selectionConfig);

  return (
    <XDSStack direction="vertical">
      {selectedKeys.size > 0 && (
        <XDSToolbar
          label="Bulk actions"
          size="sm"
          variant="muted"
          dividers={['bottom']}
          startContent={
            <>
              <XDSBadge label={`${selectedKeys.size} selected`} />
              <XDSButton
                label="Delete"
                variant="ghost"
                icon={<XDSIcon icon={TrashIcon} />}
                isIconOnly
              />
              <XDSButton
                label="Archive"
                variant="ghost"
                icon={<XDSIcon icon={ArchiveBoxIcon} />}
                isIconOnly
              />
            </>
          }
          endContent={
            <XDSButton
              label="Deselect all"
              variant="ghost"
              onClick={() => setSelectedKeys(new Set())}
            />
          }
        />
      )}
      <XDSTable
        idKey="id"
        columns={[
          {key: 'name', header: 'Name'},
          {key: 'status', header: 'Status'},
          {key: 'role', header: 'Role'},
        ]}
        data={DATA}
        plugins={{selection: selectionPlugin}}
      />
    </XDSStack>
  );
}
