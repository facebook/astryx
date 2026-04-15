'use client';

import {XDSButton} from '@xds/core/Button';
import {XDSTooltip, useXDSTooltip} from '@xds/core/Tooltip';

export default function TooltipUseXDSTooltipHook() {
  const tooltip = useXDSTooltip({ placement: 'above' });
  

  return (
    <XDSButton ref={tooltip.ref} aria-describedby={tooltip.describedBy}>
      Hover me
    </XDSButton>
    {tooltip.renderTooltip('Helpful tooltip text')}
  );
}
