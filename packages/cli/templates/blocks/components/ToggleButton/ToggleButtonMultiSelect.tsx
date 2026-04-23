'use client';

import {useState} from 'react';
import {XDSToggleButton, XDSToggleButtonGroup} from '@xds/core/ToggleButton';
import {XDSStack} from '@xds/core/Layout';
import {XDSText} from '@xds/core/Text';
import {XDSIcon} from '@xds/core/Icon';
import {
  BoldIcon,
  ItalicIcon,
  UnderlineIcon,
  StrikethroughIcon,
} from '@heroicons/react/24/outline';

export default function ToggleButtonMultiSelect() {
  const [formats, setFormats] = useState<string[]>(['bold']);

  return (
    <XDSStack direction="vertical" gap={4}>
      <XDSText type="supporting" color="secondary">
        Text formatting — multiple active at once
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
  );
}
