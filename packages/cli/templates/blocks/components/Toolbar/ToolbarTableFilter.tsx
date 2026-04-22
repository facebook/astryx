'use client';

import {XDSToolbar} from '@xds/core/Toolbar';
import {XDSButton} from '@xds/core/Button';
import {XDSIcon} from '@xds/core/Icon';
import {XDSTextInput} from '@xds/core/TextInput';
import {XDSMoreMenu} from '@xds/core/MoreMenu';
import {XDSTable} from '@xds/core/Table';
import {
  MagnifyingGlassIcon,
  ChevronDownIcon,
} from '@heroicons/react/24/outline';

export default function ToolbarTableFilter() {
  return (
    <div style={{width: 600}}>
      <XDSToolbar
        label="Table filters"
        size="sm"
        dividers={['bottom']}
        startContent={
          <>
            <XDSTextInput
              label="Search"
              isLabelHidden
              placeholder="Search..."
              value=""
              onChange={() => {}}
              icon={<XDSIcon icon={MagnifyingGlassIcon} />}
            />
            <XDSButton
              label="Status"
              variant="secondary"
              endContent={<XDSIcon icon={ChevronDownIcon} />}
            />
            <XDSButton
              label="Priority"
              variant="secondary"
              endContent={<XDSIcon icon={ChevronDownIcon} />}
            />
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
    </div>
  );
}
