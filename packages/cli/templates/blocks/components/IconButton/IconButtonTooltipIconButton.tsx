'use client';

import {XDSIconButton} from '@xds/core/IconButton';
import {XDSIcon} from '@xds/core/Icon';
import {XDSHStack} from '@xds/core/Layout';

export default function IconButtonTooltipIconButton() {
  return (
    <XDSHStack gap={2}>
      <XDSIconButton
        label="Search"
        icon={<XDSIcon icon="search" color="inherit" />}
        variant="ghost"
        tooltip="Search items"
      />
      <XDSIconButton
        label="Copy link"
        icon={<XDSIcon icon="copy" color="inherit" />}
        variant="ghost"
        tooltip="Copy to clipboard"
      />
      <XDSIconButton
        label="More options"
        icon={<XDSIcon icon="moreHorizontal" color="inherit" />}
        variant="ghost"
        tooltip="More options"
      />
    </XDSHStack>
  );
}
