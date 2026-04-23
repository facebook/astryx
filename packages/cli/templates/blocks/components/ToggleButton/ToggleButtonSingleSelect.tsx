'use client';

import {useState} from 'react';
import {XDSToggleButton, XDSToggleButtonGroup} from '@xds/core/ToggleButton';
import {XDSStack} from '@xds/core/Layout';
import {XDSText} from '@xds/core/Text';
import {XDSIcon} from '@xds/core/Icon';
import {
  ListBulletIcon,
  Squares2X2Icon,
  TableCellsIcon,
} from '@heroicons/react/24/outline';

export default function ToggleButtonSingleSelect() {
  const [view, setView] = useState<string | null>('list');

  return (
    <XDSStack direction="vertical" gap={4}>
      <XDSText type="supporting" color="secondary">
        View mode switcher — one active at a time
      </XDSText>
      <XDSToggleButtonGroup value={view} onChange={setView} label="View mode">
        <XDSToggleButton
          value="list"
          label="List view"
          icon={<XDSIcon icon={ListBulletIcon} />}
          isIconOnly
        />
        <XDSToggleButton
          value="grid"
          label="Grid view"
          icon={<XDSIcon icon={Squares2X2Icon} />}
          isIconOnly
        />
        <XDSToggleButton
          value="table"
          label="Table view"
          icon={<XDSIcon icon={TableCellsIcon} />}
          isIconOnly
        />
      </XDSToggleButtonGroup>
    </XDSStack>
  );
}
