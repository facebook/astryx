'use client';

import {useState} from 'react';
import {XDSToggleButton, XDSToggleButtonGroup} from '@xds/core/ToggleButton';
import {XDSStack} from '@xds/core/Layout';
import {XDSText} from '@xds/core/Text';
import {XDSIcon} from '@xds/core/Icon';
import {ListBulletIcon, Squares2X2Icon, TableCellsIcon} from '@heroicons/react/24/outline';
import {BoldIcon, ItalicIcon, UnderlineIcon, StrikethroughIcon} from '@heroicons/react/24/outline';

export default function ToggleButtonGroup() {
  const [view, setView] = useState<string | null>('list');
  const [formats, setFormats] = useState<string[]>(['bold']);

  return (
    <XDSStack direction="vertical" gap={4}>
      <XDSStack direction="vertical" gap={1}>
        <XDSText type="supporting" color="secondary">
          Single selection
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
      <XDSStack direction="vertical" gap={1}>
        <XDSText type="supporting" color="secondary">
          Multiple selections
        </XDSText>
        <XDSToggleButtonGroup
          type="multiple"
          value={formats}
          onChange={setFormats}
          label="Text formatting">
          <XDSToggleButton
            value="bold"
            label="Bold"
            icon={<XDSIcon icon={BoldIcon} />}
            isIconOnly
          />
          <XDSToggleButton
            value="italic"
            label="Italic"
            icon={<XDSIcon icon={ItalicIcon} />}
            isIconOnly
          />
          <XDSToggleButton
            value="underline"
            label="Underline"
            icon={<XDSIcon icon={UnderlineIcon} />}
            isIconOnly
          />
          <XDSToggleButton
            value="strikethrough"
            label="Strikethrough"
            icon={<XDSIcon icon={StrikethroughIcon} />}
            isIconOnly
          />
        </XDSToggleButtonGroup>
      </XDSStack>
    </XDSStack>
  );
}
