'use client';

import {useState} from 'react';
import {XDSToggleButton, XDSToggleButtonGroup} from '@xds/core/ToggleButton';
import {XDSStack} from '@xds/core/Layout';
import {XDSText} from '@xds/core/Text';
import {XDSIcon} from '@xds/core/Icon';
import {EyeIcon, EyeSlashIcon, FunnelIcon, MapPinIcon} from '@heroicons/react/24/outline';

export default function ToggleButtonLabel() {
  const [isVisible, setIsVisible] = useState(true);
  const [filters, setFilters] = useState<string[]>([]);

  return (
    <XDSStack direction="vertical" gap={4}>
      <XDSStack direction="vertical" gap={1}>
        <XDSText type="supporting" color="secondary">
          Standalone with label and icon
        </XDSText>
        <XDSStack direction="horizontal" gap={3} vAlign="center">
          <XDSToggleButton
            label="Visible"
            icon={<XDSIcon icon={EyeIcon} />}
            pressedIcon={<XDSIcon icon={EyeSlashIcon} />}
            isPressed={isVisible}
            onPressedChange={setIsVisible}>
            {isVisible ? 'Visible' : 'Hidden'}
          </XDSToggleButton>
        </XDSStack>
      </XDSStack>
      <XDSStack direction="vertical" gap={1}>
        <XDSText type="supporting" color="secondary">
          Labeled group — filter toolbar
        </XDSText>
        <XDSToggleButtonGroup
          type="multiple"
          value={filters}
          onChange={setFilters}
          label="Filters">
          <XDSToggleButton
            value="filter"
            label="Filter"
            icon={<XDSIcon icon={FunnelIcon} />}>
            Filter
          </XDSToggleButton>
          <XDSToggleButton
            value="nearby"
            label="Nearby"
            icon={<XDSIcon icon={MapPinIcon} />}>
            Nearby
          </XDSToggleButton>
        </XDSToggleButtonGroup>
      </XDSStack>
    </XDSStack>
  );
}
