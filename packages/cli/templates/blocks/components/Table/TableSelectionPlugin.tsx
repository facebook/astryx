'use client';

import {useState} from 'react';
import {XDSTable, useXDSTableSelection, useXDSTableSelectionState} from '@xds/core/Table';
import {XDSTableSelection} from '@xds/core/TableSelection';
import {XDSTableSelectionState} from '@xds/core/TableSelectionState';

export default function TableSelectionPlugin() {
  const [selectedKeys, setSelectedKeys] = useState<Set<string>>(new Set());
  
  const {selectionConfig} = useXDSTableSelectionState<User>({
    data: users,
    idKey: 'id',
    selectedKeys,
    setSelectedKeys,
  });
  const selectionPlugin = useXDSTableSelection<User>(selectionConfig);
  

  return (
    <XDSTable
      data={users}
      columns={columns}
      plugins={{selection: selectionPlugin}}
    />
  );
}
