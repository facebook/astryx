'use client';

import {XDSButton} from '@xds/core/Button';
import {XDSTooltip} from '@xds/core/Tooltip';

export default function TooltipXDSTooltipBasic() {
  return (
    <XDSTooltip content="Save your changes" placement="above">
      <XDSButton label="Save" variant="primary" />
    </XDSTooltip>
  );
}
