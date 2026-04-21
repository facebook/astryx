'use client';

import {XDSTooltip} from '@xds/core/Tooltip';
import {XDSButton} from '@xds/core/Button';
import {XDSHStack} from '@xds/core/Layout';

export default function TooltipActionBarTooltips() {
  return (
    <XDSHStack gap={4}>
      <XDSTooltip content="Save your changes" placement="above">
        <XDSButton label="Save" />
      </XDSTooltip>
      <XDSTooltip content="Discard changes" placement="above">
        <XDSButton label="Cancel" />
      </XDSTooltip>
      <XDSTooltip content="Delete permanently" placement="above">
        <XDSButton label="Delete" variant="destructive" />
      </XDSTooltip>
    </XDSHStack>
  );
}
