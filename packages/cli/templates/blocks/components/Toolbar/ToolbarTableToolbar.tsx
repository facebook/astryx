'use client';

import {XDSToolbar} from '@xds/core/Toolbar';
import {XDSButton} from '@xds/core/Button';
import {XDSTextInput} from '@xds/core/TextInput';
import {XDSMoreMenu} from '@xds/core/MoreMenu';
import {XDSTable} from '@xds/core/Table';

export default function ToolbarTableToolbar() {
  return (
    <div style={{width: 700}}>
      <XDSToolbar
        label="Table filters"
        startContent={
          <>
            <XDSTextInput
              label="Search"
              isLabelHidden
              placeholder="Search..."
              size="sm"
              value=""
              onChange={() => {}}
            />
            <XDSButton label="Status" variant="secondary" size="sm" />
            <XDSButton label="Priority" variant="secondary" size="sm" />
            <XDSButton label="Assignee" variant="secondary" size="sm" />
          </>
        }
        endContent={
          <XDSMoreMenu
            items={[
              {label: 'Compact view'},
              {label: 'Comfortable view'},
              {label: 'Export CSV'},
            ]}
          />
        }
      />
      <XDSTable
        idKey="id"
        columns={[
          {key: 'name', header: 'Name'},
          {key: 'status', header: 'Status'},
          {key: 'priority', header: 'Priority'},
        ]}
        data={[
          {id: '1', name: 'Fix login bug', status: 'Open', priority: 'High'},
          {id: '2', name: 'Update docs', status: 'In Progress', priority: 'Medium'},
          {id: '3', name: 'Add tests', status: 'Open', priority: 'Low'},
        ]}
      />
    </div>
  );
}
