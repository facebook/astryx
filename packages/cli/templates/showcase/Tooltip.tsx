'use client';

import {XDSTooltip} from '@xds/core/Tooltip';

export default function TooltipShowcase() {
  return (
    <XDSTooltip content="Help text">
      <button>Hover</button>
    </XDSTooltip>
  );
}
